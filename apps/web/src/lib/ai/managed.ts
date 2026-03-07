import type { AiProvider } from "@/lib/ai/providers";

function parseIntEnv(name: string, fallback: number, min: number, max: number) {
  const raw = process.env[name];
  if (!raw) {
    return fallback;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  const value = Math.trunc(parsed);
  return Math.min(Math.max(value, min), max);
}

export function getManagedProviderApiKey(provider: AiProvider) {
  if (provider === "GEMINI") {
    return process.env.AI_MANAGED_GEMINI_API_KEY ?? process.env.GEMINI_API_KEY ?? null;
  }
  if (provider === "ANTHROPIC") {
    return process.env.AI_MANAGED_ANTHROPIC_API_KEY ?? process.env.ANTHROPIC_API_KEY ?? null;
  }
  return process.env.AI_MANAGED_OPENAI_API_KEY ?? process.env.OPENAI_API_KEY ?? null;
}

export function getManagedProviderModel(provider: AiProvider, requestedModel?: string) {
  const requested = requestedModel?.trim();
  if (requested) {
    return requested;
  }

  if (provider === "GEMINI") {
    return process.env.AI_MANAGED_GEMINI_MODEL?.trim() || process.env.GEMINI_MODEL?.trim() || null;
  }
  if (provider === "ANTHROPIC") {
    return process.env.AI_MANAGED_ANTHROPIC_MODEL?.trim() || process.env.ANTHROPIC_MODEL?.trim() || null;
  }
  return process.env.AI_MANAGED_OPENAI_MODEL?.trim() || process.env.AI_OPENAI_MODEL?.trim() || null;
}

export function getManagedChatCreditCost() {
  return parseIntEnv("AI_MANAGED_CHAT_CREDIT_COST", parseIntEnv("AI_MANAGED_CREDIT_PER_REQUEST", 1, 1, 1_000_000), 1, 1_000_000);
}

export function getSkillBookBuilderCreditCost() {
  return parseIntEnv("AI_SKILLBOOK_BUILDER_CREDIT_COST", 3, 1, 1_000_000);
}
