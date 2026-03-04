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

    setSignupMessage(t.signupFail);
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

    setLoginMessage(t.loginFail);
  };

  return (
    <main className="sa-page sa-auth-grid" style={{ maxWidth: 960 }}>
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
    </main>
  );
}
