"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { getDefaultModel, type AiProvider } from "@/lib/ai/providers";

type LocaleCode = "ko" | "en";

type PackageOption = {
  id: string;
  code: string;
  title: string;
};

type SkillBookItem = {
  id: string;
  title: string;
  description: string | null;
  locale: LocaleCode;
  visibility: "PRIVATE" | "INTERNAL" | "STORE";
  status: "DRAFT" | "READY" | "ARCHIVED";
  body: string;
  compiledPrompt: string | null;
  createdAt: string;
  updatedAt: string;
  sources: Array<{
    id: string;
    label: string | null;
    content: string;
    orderIndex: number;
    createdAt: string;
    updatedAt: string;
  }>;
  listing: {
    id: string;
    priceCredits: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  } | null;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type Props = {
  locale: LocaleCode;
  packages: PackageOption[];
};

const refreshEventName = "sa-skillbook-library-changed";

const providerOptions: AiProvider[] = ["OPENAI", "GEMINI", "ANTHROPIC"];

const textMap = {
  ko: {
    title: "SkillBook �� BYOK ��ȭ",
    subtitle: "���� ������� SkillBook���� �����ϰ�, ��Ű�� �����Ϳ� �Բ� AI�� ��ȭ�մϴ�.",
    mySkillBooks: "�� SkillBook",
    newSkillBook: "�� SkillBook",
    noSkillBook: "���� SkillBook�� �����ϴ�.",
    titleLabel: "����",
    descLabel: "����",
    bodyLabel: "�ٽ� ����� / �ؼ� ��Ģ",
    sourceLabel: "���� �޸� / ����",
    visibilityLabel: "���� ����",
    statusLabel: "����",
    save: "����",
    compile: "������",
    reset: "���� �ۼ�",
    compiledPrompt: "�����ϵ� ������Ʈ",
    chatTitle: "BYOK ��ȭ",
    packageLabel: "��Ű��",
    skillBookLabel: "���� SkillBook",
    providerLabel: "Provider",
    modelLabel: "��",
    apiKeyLabel: "API Key",
    messageLabel: "�޽���",
    send: "������",
    clearChat: "��ȭ ����",
    loading: "ó�� ��...",
    skillBookSaved: "SkillBook�� ����Ǿ����ϴ�.",
    skillBookCompiled: "SkillBook�� READY ���·� �����ϵǾ����ϴ�.",
    sendPlaceholder: "��: �� ��Ű���� �ٽ� ����� �ؼ��� �������� ��������.",
    sourcePlaceholder: "���� ��ȹ, ����, �ؼ� ��Ģ, ���� �޸� �ٿ���������.",
    bodyPlaceholder: "AI�� ����� �� �м� ������ �ؼ� ��Ģ�� �����ּ���.",
    noPackage: "���� ��Ű���� �־�� AI ��ȭ�� ������ �� �ֽ��ϴ�.",
    visibilityPrivate: "�����",
    visibilityInternal: "���ΰ���",
    visibilityStore: "����� ����",
    statusDraft: "�ʾ�",
    statusReady: "�غ� �Ϸ�",
    statusArchived: "����",
    providerBadRequest: "Provider ��û ������ ���� �ʽ��ϴ�.",
    providerAuthError: "API Ű�� �ùٸ��� �ʰų� ������ �����ϴ�.",
    providerRateLimited: "Provider ��û �ѵ��� �ʰ��߽��ϴ�.",
    providerEmpty: "Provider�� �� ������ ��ȯ�߽��ϴ�.",
    providerError: "Provider ȣ�� �� ������ �߻��߽��ϴ�.",
  },
  en: {
    title: "SkillBook �� BYOK Chat",
    subtitle: "Save your research methodology as SkillBooks and chat with package data.",
    mySkillBooks: "My SkillBooks",
    newSkillBook: "New SkillBook",
    noSkillBook: "No SkillBook yet.",
    titleLabel: "Title",
    descLabel: "Description",
    bodyLabel: "Core methodology / interpretation rules",
    sourceLabel: "Source notes / excerpts",
    visibilityLabel: "Visibility",
    statusLabel: "Status",
    save: "Save",
    compile: "Compile",
    reset: "Reset",
    compiledPrompt: "Compiled prompt",
    chatTitle: "BYOK Chat",
    packageLabel: "Package",
    skillBookLabel: "SkillBook",
    providerLabel: "Provider",
    modelLabel: "Model",
    apiKeyLabel: "API Key",
    messageLabel: "Message",
    send: "Send",
    clearChat: "Clear chat",
    loading: "Processing...",
    skillBookSaved: "SkillBook saved.",
    skillBookCompiled: "SkillBook compiled and marked READY.",
    sendPlaceholder: "e.g. Explain the main trends and interpretation caveats in this package.",
    sourcePlaceholder: "Paste research plans, hypotheses, interpretation notes, or excerpts.",
    bodyPlaceholder: "Describe the analysis procedure and interpretation rules the AI should follow.",
    noPackage: "A package is required before starting BYOK chat.",
    visibilityPrivate: "Private",
    visibilityInternal: "Internal",
    visibilityStore: "Store",
    statusDraft: "Draft",
    statusReady: "Ready",
    statusArchived: "Archived",
    providerBadRequest: "Provider rejected the request shape.",
    providerAuthError: "API key is invalid or unauthorized.",
    providerRateLimited: "Provider rate limit exceeded.",
    providerEmpty: "Provider returned an empty response.",
    providerError: "Provider request failed.",
  },
} as const;

function errorMessage(locale: LocaleCode, code: string | undefined) {
  const t = textMap[locale];
  switch (code) {
    case "provider_bad_request":
      return t.providerBadRequest;
    case "provider_auth_error":
      return t.providerAuthError;
    case "provider_rate_limited":
      return t.providerRateLimited;
    case "provider_empty_response":
      return t.providerEmpty;
    case "provider_error":
      return t.providerError;
    default:
      return code ?? "unknown_error";
  }
}

export function AdminAiSkillBookPanel({ locale, packages }: Props) {
  const t = textMap[locale];
  const [skillBooks, setSkillBooks] = useState<SkillBookItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedSkillBookId, setSelectedSkillBookId] = useState<string>("");
  const [editingSkillBookId, setEditingSkillBookId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [body, setBody] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [visibility, setVisibility] = useState<SkillBookItem["visibility"]>("PRIVATE");
  const [status, setStatus] = useState<SkillBookItem["status"]>("DRAFT");
  const [chatPackageId, setChatPackageId] = useState(packages[0]?.id ?? "");
  const [provider, setProvider] = useState<AiProvider>("OPENAI");
  const [model, setModel] = useState(getDefaultModel("OPENAI"));
  const [apiKey, setApiKey] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatMeta, setChatMeta] = useState("");

  const selectedSkillBook = useMemo(
    () => skillBooks.find((item) => item.id === selectedSkillBookId) ?? null,
    [selectedSkillBookId, skillBooks],
  );

  const refreshSkillBooks = useCallback(async () => {
    const response = await fetch("/api/admin/skillbooks", { cache: "no-store" });
    const payload = (await response.json().catch(() => null)) as
      | { ok?: boolean; skillBooks?: SkillBookItem[]; error?: string }
      | null;
    if (!response.ok || !payload?.ok || !payload.skillBooks) {
      setMessage(payload?.error ?? "failed_to_load_skillbooks");
      return;
    }
    const skillBooks = payload.skillBooks;
    setSkillBooks(skillBooks);
    setSelectedSkillBookId((prev) =>
      prev && skillBooks.some((item) => item.id === prev) ? prev : (skillBooks[0]?.id ?? ""),
    );
  }, []);

  useEffect(() => {
    void refreshSkillBooks();
  }, [refreshSkillBooks]);

  useEffect(() => {
    const handler = () => {
      void refreshSkillBooks();
    };
    window.addEventListener(refreshEventName, handler);
    return () => {
      window.removeEventListener(refreshEventName, handler);
    };
  }, [refreshSkillBooks]);

  useEffect(() => {
    setModel(getDefaultModel(provider));
  }, [provider]);

  const applySkillBookToForm = useCallback((skillBook: SkillBookItem | null) => {
    if (!skillBook) {
      setEditingSkillBookId(null);
      setTitle("");
      setDescription("");
      setBody("");
      setSourceText("");
      setVisibility("PRIVATE");
      setStatus("DRAFT");
      return;
    }

    setEditingSkillBookId(skillBook.id);
    setTitle(skillBook.title);
    setDescription(skillBook.description ?? "");
    setBody(skillBook.body);
    setSourceText(skillBook.sources.map((source) => source.content).join("\n\n---\n\n"));
    setVisibility(skillBook.visibility);
    setStatus(skillBook.status);
  }, []);

  const onSaveSkillBook = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    const sourceChunks = sourceText
      .split(/\n\s*---\s*\n/g)
      .map((chunk) => chunk.trim())
      .filter(Boolean)
      .map((content, index) => ({
        label: index === 0 ? "notes" : `notes_${index + 1}`,
        content,
      }));

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      locale,
      visibility,
      status,
      body: body.trim(),
      sources: sourceChunks,
    };

    const response = await fetch(
      editingSkillBookId ? `/api/admin/skillbooks/${editingSkillBookId}` : "/api/admin/skillbooks",
      {
        method: editingSkillBookId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const json = (await response.json().catch(() => null)) as
      | { ok?: boolean; error?: string; skillBook?: SkillBookItem }
      | null;

    if (!response.ok || !json?.ok || !json.skillBook) {
      setMessage(json?.error ?? "skillbook_save_failed");
      setIsLoading(false);
      return;
    }

    await refreshSkillBooks();
    setSelectedSkillBookId(json.skillBook.id);
    applySkillBookToForm(json.skillBook);
    setMessage(t.skillBookSaved);
    window.dispatchEvent(new Event(refreshEventName));
    setIsLoading(false);
  };

  const onCompileSkillBook = async () => {
    if (!editingSkillBookId) {
      return;
    }
    setIsLoading(true);
    setMessage("");

    const response = await fetch(`/api/admin/skillbooks/${editingSkillBookId}/compile`, {
      method: "POST",
    });
    const json = (await response.json().catch(() => null)) as
      | { ok?: boolean; error?: string; skillBook?: SkillBookItem }
      | null;

    if (!response.ok || !json?.ok || !json.skillBook) {
      setMessage(json?.error ?? "skillbook_compile_failed");
      setIsLoading(false);
      return;
    }

    await refreshSkillBooks();
    setSelectedSkillBookId(json.skillBook.id);
    applySkillBookToForm(json.skillBook);
    setMessage(t.skillBookCompiled);
    window.dispatchEvent(new Event(refreshEventName));
    setIsLoading(false);
  };

  const onSendChat = async (event: FormEvent) => {
    event.preventDefault();
    if (!chatPackageId) {
      setMessage(t.noPackage);
      return;
    }
    if (!chatInput.trim()) {
      return;
    }
    if (!apiKey.trim()) {
      setMessage(locale === "ko" ? "API Key�� �Է��ϼ���." : "Enter an API key.");
      return;
    }

    const nextMessages = [...chatMessages, { role: "user", content: chatInput.trim() } as ChatMessage];
    setChatMessages(nextMessages);
    setChatInput("");
    setIsLoading(true);
    setMessage("");

    const response = await fetch("/api/admin/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        packageId: chatPackageId,
        provider,
        model: model.trim() || undefined,
        apiKey: apiKey.trim(),
        skillBookId: selectedSkillBookId || undefined,
        messages: nextMessages,
      }),
    });

    const json = (await response.json().catch(() => null)) as
      | {
          ok?: boolean;
          error?: string;
          assistantMessage?: string;
          model?: string;
          usage?: { totalTokens?: number | null };
          context?: { skillBookTitle?: string | null };
        }
      | null;

    if (!response.ok || !json?.ok || !json.assistantMessage) {
      setMessage(errorMessage(locale, json?.error));
      setChatMessages(chatMessages);
      setIsLoading(false);
      return;
    }

    setChatMessages([...nextMessages, { role: "assistant", content: json.assistantMessage }]);
    setChatMeta(
      [
        `model=${json.model ?? model}`,
        `tokens=${json.usage?.totalTokens ?? "unknown"}`,
        `skillbook=${json.context?.skillBookTitle ?? "none"}`,
      ].join(", "),
    );
    setIsLoading(false);
  };

  return (
    <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16, marginTop: 16 }}>
      <h2>{t.title}</h2>
      <p>{t.subtitle}</p>
      {message ? <p className="sa-inline-message">{message}</p> : null}

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "minmax(260px, 320px) minmax(0, 1fr)" }}>
        <aside style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <strong>{t.mySkillBooks}</strong>
            <button type="button" onClick={() => applySkillBookToForm(null)} disabled={isLoading}>
              {t.newSkillBook}
            </button>
          </div>
          {skillBooks.length === 0 ? <p>{t.noSkillBook}</p> : null}
          <div style={{ display: "grid", gap: 8 }}>
            {skillBooks.map((skillBook) => (
              <button
                key={skillBook.id}
                type="button"
                onClick={() => {
                  setSelectedSkillBookId(skillBook.id);
                  applySkillBookToForm(skillBook);
                }}
                style={{
                  textAlign: "left",
                  padding: 10,
                  borderRadius: 10,
                  border: skillBook.id === selectedSkillBookId ? "2px solid #2A5F7F" : "1px solid #d7e0e6",
                  background: "#fff",
                }}
              >
                <div style={{ fontWeight: 700 }}>{skillBook.title}</div>
                <div style={{ fontSize: 13, opacity: 0.8 }}>{skillBook.status} �� {skillBook.visibility}</div>
              </button>
            ))}
          </div>
        </aside>

        <div style={{ display: "grid", gap: 16 }}>
          <form onSubmit={onSaveSkillBook} style={{ display: "grid", gap: 10, border: "1px solid #eee", borderRadius: 10, padding: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>
              {t.titleLabel}
              <input value={title} onChange={(event) => setTitle(event.target.value)} disabled={isLoading} />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              {t.descLabel}
              <input value={description} onChange={(event) => setDescription(event.target.value)} disabled={isLoading} />
            </label>
            <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
              <label style={{ display: "grid", gap: 6 }}>
                {t.visibilityLabel}
                <select value={visibility} onChange={(event) => setVisibility(event.target.value as SkillBookItem["visibility"])} disabled={isLoading}>
                  <option value="PRIVATE">{t.visibilityPrivate}</option>
                  <option value="INTERNAL">{t.visibilityInternal}</option>
                  <option value="STORE">{t.visibilityStore}</option>
                </select>
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                {t.statusLabel}
                <select value={status} onChange={(event) => setStatus(event.target.value as SkillBookItem["status"])} disabled={isLoading}>
                  <option value="DRAFT">{t.statusDraft}</option>
                  <option value="READY">{t.statusReady}</option>
                  <option value="ARCHIVED">{t.statusArchived}</option>
                </select>
              </label>
            </div>
            <label style={{ display: "grid", gap: 6 }}>
              {t.bodyLabel}
              <textarea rows={8} value={body} onChange={(event) => setBody(event.target.value)} placeholder={t.bodyPlaceholder} disabled={isLoading} />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              {t.sourceLabel}
              <textarea rows={6} value={sourceText} onChange={(event) => setSourceText(event.target.value)} placeholder={t.sourcePlaceholder} disabled={isLoading} />
            </label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="submit" disabled={isLoading}>{isLoading ? t.loading : t.save}</button>
              <button type="button" disabled={isLoading || !editingSkillBookId} onClick={() => void onCompileSkillBook()}>{t.compile}</button>
              <button type="button" disabled={isLoading} onClick={() => applySkillBookToForm(null)}>{t.reset}</button>
            </div>
            {selectedSkillBook?.compiledPrompt ? (
              <label style={{ display: "grid", gap: 6 }}>
                {t.compiledPrompt}
                <textarea rows={6} readOnly value={selectedSkillBook.compiledPrompt} />
              </label>
            ) : null}
          </form>

          <section style={{ border: "1px solid #eee", borderRadius: 10, padding: 12 }}>
            <h3 style={{ marginTop: 0 }}>{t.chatTitle}</h3>
            <form onSubmit={onSendChat} style={{ display: "grid", gap: 10 }}>
              <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                <label style={{ display: "grid", gap: 6 }}>
                  {t.packageLabel}
                  <select value={chatPackageId} onChange={(event) => setChatPackageId(event.target.value)} disabled={isLoading}>
                    {packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>{pkg.title} ({pkg.code})</option>
                    ))}
                  </select>
                </label>
                <label style={{ display: "grid", gap: 6 }}>
                  {t.skillBookLabel}
                  <select value={selectedSkillBookId} onChange={(event) => setSelectedSkillBookId(event.target.value)} disabled={isLoading}>
                    <option value="">None</option>
                    {skillBooks.map((skillBook) => (
                      <option key={skillBook.id} value={skillBook.id}>{skillBook.title}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
                <label style={{ display: "grid", gap: 6 }}>
                  {t.providerLabel}
                  <select value={provider} onChange={(event) => setProvider(event.target.value as AiProvider)} disabled={isLoading}>
                    {providerOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
                <label style={{ display: "grid", gap: 6 }}>
                  {t.modelLabel}
                  <input value={model} onChange={(event) => setModel(event.target.value)} disabled={isLoading} />
                </label>
                <label style={{ display: "grid", gap: 6 }}>
                  {t.apiKeyLabel}
                  <input type="password" value={apiKey} onChange={(event) => setApiKey(event.target.value)} disabled={isLoading} />
                </label>
              </div>
              <div style={{ border: "1px solid #e5ebef", borderRadius: 10, padding: 12, background: "#fff", minHeight: 220, maxHeight: 420, overflowY: "auto", display: "grid", gap: 10 }}>
                {chatMessages.map((messageItem, index) => (
                  <div key={`${messageItem.role}_${index}`} style={{ justifySelf: messageItem.role === "user" ? "end" : "start", maxWidth: "88%" }}>
                    <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>{messageItem.role === "user" ? "You" : "AI"}</div>
                    <div style={{ whiteSpace: "pre-wrap", border: "1px solid #d7e0e6", borderRadius: 10, padding: 10, background: messageItem.role === "user" ? "#eef5f8" : "#f7f9fa" }}>{messageItem.content}</div>
                  </div>
                ))}
              </div>
              {chatMeta ? <p style={{ margin: 0, fontSize: 13 }}>{chatMeta}</p> : null}
              <label style={{ display: "grid", gap: 6 }}>
                {t.messageLabel}
                <textarea rows={4} value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder={t.sendPlaceholder} disabled={isLoading} />
              </label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button type="submit" disabled={isLoading || packages.length === 0}>{isLoading ? t.loading : t.send}</button>
                <button type="button" disabled={isLoading} onClick={() => setChatMessages([])}>{t.clearChat}</button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </section>
  );
}


