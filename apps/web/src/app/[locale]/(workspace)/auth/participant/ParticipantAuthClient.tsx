"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { signIn } from "next-auth/react";


type Props = {
  locale: "ko" | "en";
};

export function ParticipantAuthClient({ locale }: Props) {
  const [signupId, setSignupId] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupMessage, setSignupMessage] = useState("");
  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginMessage, setLoginMessage] = useState("");

  const t = useMemo(
    () =>
      locale === "ko"
        ? {
            title: "설문 응답자 로그인/가입",
            subtitle:
              "개인 실명정보 없이 연구 ID(예: 학번/실험번호)로 가입할 수 있습니다. 가입 후 연구자가 안내한 참여코드를 입력해 설문에 참여하세요.",
            flowTitle: "참여 흐름",
            flow: ["익명형 계정 가입", "로그인", "참여코드 입력 후 응답 시작"],
            signupTitle: "익명형 가입",
            loginTitle: "로그인",
            idLabel: "연구 ID",
            idPlaceholder: "예: 20260001",
            passwordLabel: "비밀번호",
            nameLabel: "표시 이름 (선택)",
            namePlaceholder: "예: P-001",
            signupButton: "가입하기",
            loginButton: "로그인",
            signupOk: "가입 완료",
            signupFail: "가입 실패",
            loginFail: "로그인 실패",
            toAdmin: "관리자 로그인으로 이동",
            toHome: "홈으로 이동",
          }
        : {
            title: "Participant Sign-In / Sign-Up",
            subtitle:
              "Create an anonymous-style account with your study ID (e.g., student number). After sign-in, enter the survey code provided by your researcher.",
            flowTitle: "Participation flow",
            flow: ["Create anonymous-style account", "Sign in", "Enter survey code and respond"],
            signupTitle: "Sign up",
            loginTitle: "Sign in",
            idLabel: "Study ID",
            idPlaceholder: "e.g. 20260001",
            passwordLabel: "Password",
            nameLabel: "Display name (optional)",
            namePlaceholder: "e.g. P-001",
            signupButton: "Create account",
            loginButton: "Sign in",
            signupOk: "Sign-up complete",
            signupFail: "Sign-up failed",
            loginFail: "Sign-in failed",
            toAdmin: "Go to admin sign-in",
            toHome: "Back to home",
          },
    [locale],
  );

  const resolveSignupError = (errorCode: string | null, retryAfterSec: number | null) => {
    if (errorCode === "login_id_taken") {
      return locale === "ko" ? "이미 사용 중인 ID입니다." : "This ID is already in use.";
    }
    if (errorCode === "rate_limited") {
      if (locale === "ko") {
        return `요청이 너무 많습니다. ${retryAfterSec ?? 0}초 후 다시 시도해주세요.`;
      }
      return `Too many attempts. Try again in ${retryAfterSec ?? 0} seconds.`;
    }
    return t.signupFail;
  };

  const resolveLoginError = (errorCode: string | null) => {
    if (
      !errorCode ||
      errorCode === "participant_invalid_credentials" ||
      errorCode === "CredentialsSignin"
    ) {
      return locale === "ko" ? "ID 또는 비밀번호가 올바르지 않습니다." : "Invalid ID or password.";
    }
    if (errorCode === "participant_inactive") {
      return locale === "ko" ? "비활성화된 계정입니다." : "This account is inactive.";
    }
    if (errorCode.startsWith("rate_limited:")) {
      const sec = Number(errorCode.split(":")[1] ?? "0");
      if (locale === "ko") {
        return `로그인 시도가 너무 많습니다. ${Number.isFinite(sec) ? sec : 0}초 후 다시 시도해주세요.`;
      }
      return `Too many sign-in attempts. Try again in ${Number.isFinite(sec) ? sec : 0} seconds.`;
    }
    return t.loginFail;
  };

  const onSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSignupMessage("");

    const response = await fetch("/api/auth/participant/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        loginId: signupId,
        password: signupPassword,
        displayName: signupName || undefined,
        locale,
      }),
    });

    if (response.ok) {
      setSignupMessage(t.signupOk);
      setLoginId(signupId);
      setSignupPassword("");
      return;
    }

    const payload = (await response.json().catch(() => null)) as
      | { error?: string; retryAfterSec?: number }
      | null;
    setSignupMessage(resolveSignupError(payload?.error ?? null, payload?.retryAfterSec ?? null));
  };

  const onLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginMessage("");

    const result = await signIn("participant-credentials", {
      loginId,
      password: loginPassword,
      redirect: false,
      callbackUrl: `/${locale}/participant`,
    });

    if (result?.ok && result.url) {
      window.location.href = result.url;
      return;
    }

    setLoginMessage(resolveLoginError(result?.error ?? null));
  };

  return (
    <main className="sa-page sa-auth-shell" style={{ maxWidth: 1060 }}>
      <section className="sa-auth-hero">
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
        <h2>{t.flowTitle}</h2>
        <ol className="sa-role-flow-list">
          {t.flow.map((step, idx) => (
            <li key={step}>
              <span>{idx + 1}</span>
              {step}
            </li>
          ))}
        </ol>
        <div className="sa-auth-links">
          <Link href={`/${locale}/auth/admin`}>{t.toAdmin}</Link>
          <Link href={`/${locale}`}>{t.toHome}</Link>
        </div>
      </section>

      <div className="sa-auth-grid">
        <section className="sa-auth-card">
          <h2>{t.signupTitle}</h2>
          <form onSubmit={onSignup} style={{ display: "grid", gap: 10 }}>
            <label className="sa-field-label">
              {t.idLabel}
              <input
                value={signupId}
                onChange={(event) => setSignupId(event.target.value)}
                placeholder={t.idPlaceholder}
                required
              />
            </label>
            <label className="sa-field-label">
              {t.passwordLabel}
              <input
                value={signupPassword}
                onChange={(event) => setSignupPassword(event.target.value)}
                placeholder={t.passwordLabel}
                type="password"
                required
              />
            </label>
            <label className="sa-field-label">
              {t.nameLabel}
              <input
                value={signupName}
                onChange={(event) => setSignupName(event.target.value)}
                placeholder={t.namePlaceholder}
              />
            </label>
            <button type="submit">{t.signupButton}</button>
          </form>
          <p className="sa-inline-message">{signupMessage}</p>
        </section>

        <section className="sa-auth-card">
          <h2>{t.loginTitle}</h2>
          <form onSubmit={onLogin} style={{ display: "grid", gap: 10 }}>
            <label className="sa-field-label">
              {t.idLabel}
              <input
                value={loginId}
                onChange={(event) => setLoginId(event.target.value)}
                placeholder={t.idPlaceholder}
                required
              />
            </label>
            <label className="sa-field-label">
              {t.passwordLabel}
              <input
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                placeholder={t.passwordLabel}
                type="password"
                required
              />
            </label>
            <button type="submit">{t.loginButton}</button>
          </form>
          <p className="sa-inline-message">{loginMessage}</p>
        </section>
      </div>
    </main>
  );
}
