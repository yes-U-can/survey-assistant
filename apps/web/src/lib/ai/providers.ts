export type AiProvider = "OPENAI" | "GEMINI" | "ANTHROPIC";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type RunByokChatInput = {
  provider: AiProvider;
  apiKey: string;
  model?: string;
  temperature?: number;
  systemPrompt: string;
  messages: ChatMessage[];
};

export type RunByokChatOutput = {
  message: string;
  model: string;
  usage: {
    inputTokens: number | null;
    outputTokens: number | null;
    totalTokens: number | null;
  };
};

export class ByokProviderError extends Error {
  constructor(
    public readonly code:
      | "provider_bad_request"
      | "provider_auth_error"
      | "provider_rate_limited"
      | "provider_empty_response"
      | "provider_error",
    public readonly status: number,
  ) {
    super(code);
    this.name = "ByokProviderError";
  }
}

export function getDefaultModel(provider: AiProvider) {
  switch (provider) {
    case "GEMINI":
      return "gemini-2.0-flash";
    case "ANTHROPIC":
      return "claude-3-5-sonnet-latest";
    default:
      return "gpt-4o-mini";
  }
}

function normalizeTemperature(value: number | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0.2;
  }
  return Math.min(Math.max(value, 0), 2);
}

async function parseJson(response: Response) {
  return (await response.json().catch(() => null)) as Record<string, unknown> | null;
}

async function runOpenAiChat(input: RunByokChatInput): Promise<RunByokChatOutput> {
  const model = input.model?.trim() || getDefaultModel("OPENAI");
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: normalizeTemperature(input.temperature),
      messages: [
        { role: "system", content: input.systemPrompt },
        ...input.messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      ],
    }),
  });

  const payload = await parseJson(response);
  if (!response.ok || !payload) {
    throw mapProviderError(response.status);
  }

  const choices = Array.isArray(payload.choices) ? payload.choices : [];
  const first = choices[0] as { message?: { content?: string | null } } | undefined;
  const message = first?.message?.content?.trim();
  if (!message) {
    throw new ByokProviderError("provider_empty_response", 502);
  }

  const usage = (payload.usage ?? {}) as Record<string, unknown>;
  return {
    message,
    model,
    usage: {
      inputTokens: typeof usage.prompt_tokens === "number" ? usage.prompt_tokens : null,
      outputTokens: typeof usage.completion_tokens === "number" ? usage.completion_tokens : null,
      totalTokens: typeof usage.total_tokens === "number" ? usage.total_tokens : null,
    },
  };
}

async function runGeminiChat(input: RunByokChatInput): Promise<RunByokChatOutput> {
  const model = input.model?.trim() || getDefaultModel("GEMINI");
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(input.apiKey)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          role: "system",
          parts: [{ text: input.systemPrompt }],
        },
        contents: input.messages.map((message) => ({
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: message.content }],
        })),
        generationConfig: {
          temperature: normalizeTemperature(input.temperature),
        },
      }),
    },
  );

  const payload = await parseJson(response);
  if (!response.ok || !payload) {
    throw mapProviderError(response.status);
  }

  const candidates = Array.isArray(payload.candidates) ? payload.candidates : [];
  const first = candidates[0] as { content?: { parts?: Array<{ text?: string }> } } | undefined;
  const text = Array.isArray(first?.content?.parts)
    ? first?.content?.parts
        ?.map((part) => (typeof part?.text === "string" ? part.text : ""))
        .join("\n")
        .trim()
    : "";
  if (!text) {
    throw new ByokProviderError("provider_empty_response", 502);
  }

  const usage = (payload.usageMetadata ?? {}) as Record<string, unknown>;
  return {
    message: text,
    model,
    usage: {
      inputTokens: typeof usage.promptTokenCount === "number" ? usage.promptTokenCount : null,
      outputTokens: typeof usage.candidatesTokenCount === "number" ? usage.candidatesTokenCount : null,
      totalTokens: typeof usage.totalTokenCount === "number" ? usage.totalTokenCount : null,
    },
  };
}

async function runAnthropicChat(input: RunByokChatInput): Promise<RunByokChatOutput> {
  const model = input.model?.trim() || getDefaultModel("ANTHROPIC");
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": input.apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      system: input.systemPrompt,
      max_tokens: 1024,
      temperature: normalizeTemperature(input.temperature),
      messages: input.messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    }),
  });

  const payload = await parseJson(response);
  if (!response.ok || !payload) {
    throw mapProviderError(response.status);
  }

  const content = Array.isArray(payload.content) ? payload.content : [];
  const text = content
    .map((item) => {
      const row = item as { type?: string; text?: string };
      return row.type === "text" && typeof row.text === "string" ? row.text : "";
    })
    .join("\n")
    .trim();
  if (!text) {
    throw new ByokProviderError("provider_empty_response", 502);
  }

  const usage = (payload.usage ?? {}) as Record<string, unknown>;
  const inputTokens = typeof usage.input_tokens === "number" ? usage.input_tokens : null;
  const outputTokens = typeof usage.output_tokens === "number" ? usage.output_tokens : null;
  return {
    message: text,
    model,
    usage: {
      inputTokens,
      outputTokens,
      totalTokens:
        typeof inputTokens === "number" && typeof outputTokens === "number"
          ? inputTokens + outputTokens
          : null,
    },
  };
}

function mapProviderError(status: number) {
  if (status === 400) {
    return new ByokProviderError("provider_bad_request", status);
  }
  if (status === 401 || status === 403) {
    return new ByokProviderError("provider_auth_error", status);
  }
  if (status === 429) {
    return new ByokProviderError("provider_rate_limited", status);
  }
  return new ByokProviderError("provider_error", status || 502);
}

export async function runByokChat(input: RunByokChatInput) {
  if (input.provider === "GEMINI") {
    return runGeminiChat(input);
  }
  if (input.provider === "ANTHROPIC") {
    return runAnthropicChat(input);
  }
  return runOpenAiChat(input);
}
