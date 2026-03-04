import type { ReactNode } from "react";

export type TemplateRuntimeLocale = "ko" | "en";

export type SpecialTemplateDraft = {
  jsonText: string;
  state: Record<string, unknown>;
};

type BuildResponseResult =
  | {
      ok: true;
      responseJson: unknown;
    }
  | {
      ok: false;
      errorCode: "invalid_schema" | "invalid_json" | "incomplete_answers";
    };

type SpecialRendererRenderProps = {
  locale: TemplateRuntimeLocale;
  schema: unknown;
  draft: SpecialTemplateDraft;
  disabled?: boolean;
  onChangeDraft: (next: SpecialTemplateDraft) => void;
};

type SpecialRendererBuildProps = {
  schema: unknown;
  draft: SpecialTemplateDraft;
};

export type SpecialTemplateRenderer = {
  id: string;
  label: {
    ko: string;
    en: string;
  };
  matches: (schema: unknown) => boolean;
  createInitialDraft: (schema: unknown) => SpecialTemplateDraft;
  render: (props: SpecialRendererRenderProps) => ReactNode;
  buildResponse: (props: SpecialRendererBuildProps) => BuildResponseResult;
};

type ScaleDef = {
  min: number;
  max: number;
  labels: string[];
};

type EmotionSchema = {
  kind: "emotion_stimulus_judgment_v1";
  stimuli: Array<{ id: string; text: string }>;
  dimensions: string[];
  scale: ScaleDef;
};

type SelfAspectSchema = {
  kind: "self_aspect_inventory_v1";
  prompts: Array<{ id: string; text: string }>;
  aspects: Array<{ id: string; label: string }>;
  scale: ScaleDef;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function parseScale(value: unknown): ScaleDef | null {
  if (!isObject(value)) {
    return null;
  }
  const min = Number(value.min);
  const max = Number(value.max);
  if (!Number.isInteger(min) || !Number.isInteger(max) || min >= max) {
    return null;
  }
  const labels = Array.isArray(value.labels)
    ? value.labels
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter((item) => item.length > 0)
    : [];
  return { min, max, labels };
}

function parseEmotionSchema(schema: unknown): EmotionSchema | null {
  if (!isObject(schema) || schema.kind !== "emotion_stimulus_judgment_v1") {
    return null;
  }
  if (!Array.isArray(schema.stimuli) || schema.stimuli.length === 0) {
    return null;
  }
  const scale = parseScale(schema.scale);
  if (!scale) {
    return null;
  }

  const stimuli: Array<{ id: string; text: string }> = [];
  for (const row of schema.stimuli) {
    if (!isObject(row)) {
      return null;
    }
    const id = typeof row.id === "string" ? row.id.trim() : "";
    const text =
      typeof row.text === "string"
        ? row.text.trim()
        : typeof row.label === "string"
          ? row.label.trim()
          : "";
    if (!id || !text) {
      return null;
    }
    stimuli.push({ id, text });
  }

  const dimensions = Array.isArray(schema.dimensions)
    ? schema.dimensions
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter((item) => item.length > 0)
    : [];

  return {
    kind: "emotion_stimulus_judgment_v1",
    stimuli,
    dimensions: dimensions.length > 0 ? dimensions : ["valence", "arousal"],
    scale,
  };
}

function parseSelfAspectSchema(schema: unknown): SelfAspectSchema | null {
  if (!isObject(schema) || schema.kind !== "self_aspect_inventory_v1") {
    return null;
  }
  if (!Array.isArray(schema.prompts) || !Array.isArray(schema.aspects)) {
    return null;
  }
  if (schema.prompts.length === 0 || schema.aspects.length === 0) {
    return null;
  }

  const scale = parseScale(schema.scale);
  if (!scale) {
    return null;
  }

  const prompts: Array<{ id: string; text: string }> = [];
  for (const row of schema.prompts) {
    if (!isObject(row)) {
      return null;
    }
    const id = typeof row.id === "string" ? row.id.trim() : "";
    const text = typeof row.text === "string" ? row.text.trim() : "";
    if (!id || !text) {
      return null;
    }
    prompts.push({ id, text });
  }

  const aspects: Array<{ id: string; label: string }> = [];
  for (const row of schema.aspects) {
    if (!isObject(row)) {
      return null;
    }
    const id = typeof row.id === "string" ? row.id.trim() : "";
    const label =
      typeof row.label === "string"
        ? row.label.trim()
        : typeof row.text === "string"
          ? row.text.trim()
          : "";
    if (!id || !label) {
      return null;
    }
    aspects.push({ id, label });
  }

  return {
    kind: "self_aspect_inventory_v1",
    prompts,
    aspects,
    scale,
  };
}

function rangeInclusive(start: number, end: number): number[] {
  const output: number[] = [];
  for (let i = start; i <= end; i += 1) {
    output.push(i);
  }
  return output;
}

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

const jsonFallbackRenderer: SpecialTemplateRenderer = {
  id: "special.json-fallback",
  label: {
    ko: "JSON 직접 입력",
    en: "Raw JSON editor",
  },
  matches: () => true,
  createInitialDraft() {
    return {
      jsonText: "{}",
      state: {},
    };
  },
  render(props) {
    return (
      <label style={{ display: "grid", gap: 6, marginTop: 8 }}>
        JSON
        <textarea
          rows={6}
          value={props.draft.jsonText}
          disabled={props.disabled}
          onChange={(event) =>
            props.onChangeDraft({
              ...props.draft,
              jsonText: event.target.value,
            })
          }
          style={{ fontFamily: "monospace" }}
        />
      </label>
    );
  },
  buildResponse({ draft }) {
    const source = draft.jsonText.trim() || "{}";
    try {
      const parsed = JSON.parse(source);
      return {
        ok: true,
        responseJson: parsed,
      };
    } catch {
      return {
        ok: false,
        errorCode: "invalid_json",
      };
    }
  },
};

const emotionRenderer: SpecialTemplateRenderer = {
  id: "special.emotion-stimulus-judgment.v1",
  label: {
    ko: "정서 자극 판단 과제",
    en: "Emotion Stimulus Judgment Task",
  },
  matches(schema) {
    return parseEmotionSchema(schema) !== null;
  },
  createInitialDraft(schema) {
    const parsed = parseEmotionSchema(schema);
    if (!parsed) {
      return jsonFallbackRenderer.createInitialDraft(schema);
    }

    const ratings: Record<string, Record<string, number | null>> = {};
    for (const stimulus of parsed.stimuli) {
      ratings[stimulus.id] = {};
      for (const dimension of parsed.dimensions) {
        ratings[stimulus.id][dimension] = null;
      }
    }

    return {
      jsonText: "{}",
      state: { ratings },
    };
  },
  render(props) {
    const parsed = parseEmotionSchema(props.schema);
    if (!parsed) {
      return jsonFallbackRenderer.render(props);
    }

    const rawRatings = isObject(props.draft.state.ratings)
      ? (props.draft.state.ratings as Record<string, Record<string, number | null>>)
      : {};

    const dimensionLabel = (dimension: string) => {
      if (dimension === "valence") {
        return props.locale === "ko" ? "정서가(Valence)" : "Valence";
      }
      if (dimension === "arousal") {
        return props.locale === "ko" ? "각성도(Arousal)" : "Arousal";
      }
      if (dimension === "dominance") {
        return props.locale === "ko" ? "지배감(Dominance)" : "Dominance";
      }
      return dimension;
    };

    const scores = rangeInclusive(parsed.scale.min, parsed.scale.max);

    return (
      <div style={{ marginTop: 8, display: "grid", gap: 10 }}>
        {parsed.stimuli.map((stimulus) => (
          <article
            key={stimulus.id}
            style={{ border: "1px solid #eee", borderRadius: 8, padding: 10 }}
          >
            <strong>{stimulus.text}</strong>
            <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
              {parsed.dimensions.map((dimension) => (
                <fieldset
                  key={`${stimulus.id}-${dimension}`}
                  style={{ border: "1px solid #f2f2f2", borderRadius: 6 }}
                >
                  <legend>{dimensionLabel(dimension)}</legend>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {scores.map((score) => {
                      const checked = rawRatings?.[stimulus.id]?.[dimension] === score;
                      const label =
                        parsed.scale.labels[score - parsed.scale.min] ?? String(score);
                      return (
                        <label key={score} style={{ display: "inline-flex", gap: 4 }}>
                          <input
                            type="radio"
                            checked={checked}
                            disabled={props.disabled}
                            onChange={() => {
                              const nextRatings = {
                                ...rawRatings,
                                [stimulus.id]: {
                                  ...(rawRatings?.[stimulus.id] ?? {}),
                                  [dimension]: score,
                                },
                              };
                              props.onChangeDraft({
                                ...props.draft,
                                state: {
                                  ...props.draft.state,
                                  ratings: nextRatings,
                                },
                              });
                            }}
                          />
                          <span>
                            {score}. {label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </div>
          </article>
        ))}
      </div>
    );
  },
  buildResponse({ schema, draft }) {
    const parsed = parseEmotionSchema(schema);
    if (!parsed) {
      return { ok: false, errorCode: "invalid_schema" };
    }

    const ratings = isObject(draft.state.ratings)
      ? (draft.state.ratings as Record<string, Record<string, number | null>>)
      : {};

    const rows: Array<{
      stimulusId: string;
      values: Record<string, number>;
    }> = [];

    for (const stimulus of parsed.stimuli) {
      const values: Record<string, number> = {};
      for (const dimension of parsed.dimensions) {
        const numeric = Number(ratings?.[stimulus.id]?.[dimension]);
        if (!Number.isFinite(numeric)) {
          return { ok: false, errorCode: "incomplete_answers" };
        }
        values[dimension] = numeric;
      }
      rows.push({
        stimulusId: stimulus.id,
        values,
      });
    }

    return {
      ok: true,
      responseJson: {
        kind: "emotion_stimulus_judgment_response_v1",
        ratings: rows,
      },
    };
  },
};

const selfAspectRenderer: SpecialTemplateRenderer = {
  id: "special.self-aspect-inventory.v1",
  label: {
    ko: "자기 측면 검사",
    en: "Self-Aspect Inventory",
  },
  matches(schema) {
    return parseSelfAspectSchema(schema) !== null;
  },
  createInitialDraft(schema) {
    const parsed = parseSelfAspectSchema(schema);
    if (!parsed) {
      return jsonFallbackRenderer.createInitialDraft(schema);
    }
    const answers: Record<
      string,
      {
        aspectId: string;
        score: number | null;
      }
    > = {};
    for (const prompt of parsed.prompts) {
      answers[prompt.id] = {
        aspectId: "",
        score: null,
      };
    }
    return {
      jsonText: "{}",
      state: { answers },
    };
  },
  render(props) {
    const parsed = parseSelfAspectSchema(props.schema);
    if (!parsed) {
      return jsonFallbackRenderer.render(props);
    }

    const answers = isObject(props.draft.state.answers)
      ? (props.draft.state.answers as Record<string, { aspectId: string; score: number | null }>)
      : {};
    const scores = rangeInclusive(parsed.scale.min, parsed.scale.max);

    return (
      <div style={{ marginTop: 8, display: "grid", gap: 10 }}>
        {parsed.prompts.map((prompt) => (
          <article
            key={prompt.id}
            style={{ border: "1px solid #eee", borderRadius: 8, padding: 10 }}
          >
            <p style={{ marginTop: 0 }}>{prompt.text}</p>

            <label style={{ display: "block", marginBottom: 8 }}>
              {props.locale === "ko" ? "자기 측면 선택" : "Select aspect"}
              <select
                value={normalizeText(answers[prompt.id]?.aspectId)}
                disabled={props.disabled}
                onChange={(event) => {
                  const nextAnswers = {
                    ...answers,
                    [prompt.id]: {
                      aspectId: event.target.value,
                      score:
                        typeof answers[prompt.id]?.score === "number"
                          ? answers[prompt.id]?.score
                          : null,
                    },
                  };
                  props.onChangeDraft({
                    ...props.draft,
                    state: {
                      ...props.draft.state,
                      answers: nextAnswers,
                    },
                  });
                }}
                style={{ marginLeft: 8 }}
              >
                <option value="">
                  {props.locale === "ko" ? "선택하세요" : "Select"}
                </option>
                {parsed.aspects.map((aspect) => (
                  <option key={aspect.id} value={aspect.id}>
                    {aspect.label}
                  </option>
                ))}
              </select>
            </label>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {scores.map((score) => {
                const checked = Number(answers[prompt.id]?.score) === score;
                const label = parsed.scale.labels[score - parsed.scale.min] ?? String(score);
                return (
                  <label key={score} style={{ display: "inline-flex", gap: 4 }}>
                    <input
                      type="radio"
                      checked={checked}
                      disabled={props.disabled}
                      onChange={() => {
                        const nextAnswers = {
                          ...answers,
                          [prompt.id]: {
                            aspectId: normalizeText(answers[prompt.id]?.aspectId),
                            score,
                          },
                        };
                        props.onChangeDraft({
                          ...props.draft,
                          state: {
                            ...props.draft.state,
                            answers: nextAnswers,
                          },
                        });
                      }}
                    />
                    <span>
                      {score}. {label}
                    </span>
                  </label>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    );
  },
  buildResponse({ schema, draft }) {
    const parsed = parseSelfAspectSchema(schema);
    if (!parsed) {
      return { ok: false, errorCode: "invalid_schema" };
    }

    const answers = isObject(draft.state.answers)
      ? (draft.state.answers as Record<string, { aspectId: string; score: number | null }>)
      : {};

    const rows: Array<{ promptId: string; aspectId: string; score: number }> = [];
    for (const prompt of parsed.prompts) {
      const aspectId = normalizeText(answers[prompt.id]?.aspectId);
      const score = Number(answers[prompt.id]?.score);
      if (!aspectId || !Number.isFinite(score)) {
        return { ok: false, errorCode: "incomplete_answers" };
      }
      rows.push({
        promptId: prompt.id,
        aspectId,
        score,
      });
    }

    return {
      ok: true,
      responseJson: {
        kind: "self_aspect_inventory_response_v1",
        answers: rows,
      },
    };
  },
};

const rendererRegistry: SpecialTemplateRenderer[] = [
  emotionRenderer,
  selfAspectRenderer,
  jsonFallbackRenderer,
];

export function resolveSpecialTemplateRenderer(schema: unknown): SpecialTemplateRenderer {
  for (const renderer of rendererRegistry) {
    if (renderer.matches(schema)) {
      return renderer;
    }
  }
  return jsonFallbackRenderer;
}
