"use client";

import { FormEvent, useState } from "react";
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
      setSignupMessage(locale === "ko" ? "가입 완료" : "Sign-up complete");
      setLoginId(signupId);
      setSignupPassword("");
      return;
    }

    setSignupMessage(locale === "ko" ? "가입 실패" : "Sign-up failed");
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

    setLoginMessage(locale === "ko" ? "로그인 실패" : "Sign-in failed");
  };

  return (
    <main className="sa-page" style={{ maxWidth: 620 }}>
      <h1>{locale === "ko" ? "피검자 로그인" : "Participant Sign-In"}</h1>

      <section>
        <h2>{locale === "ko" ? "익명형 가입" : "Anonymous-Style Sign-Up"}</h2>
        <form onSubmit={onSignup} style={{ display: "grid", gap: 10 }}>
          <input
            value={signupId}
            onChange={(e) => setSignupId(e.target.value)}
            placeholder={locale === "ko" ? "아이디" : "ID"}
            required
          />
          <input
            value={signupPassword}
            onChange={(e) => setSignupPassword(e.target.value)}
            placeholder={locale === "ko" ? "비밀번호" : "Password"}
            type="password"
            required
          />
          <input
            value={signupName}
            onChange={(e) => setSignupName(e.target.value)}
            placeholder={locale === "ko" ? "표시 이름(선택)" : "Display name (optional)"}
          />
          <button type="submit">
            {locale === "ko" ? "가입하기" : "Create Account"}
          </button>
        </form>
        <p className="sa-inline-message">{signupMessage}</p>
      </section>

      <section>
        <h2>{locale === "ko" ? "로그인" : "Sign-In"}</h2>
        <form onSubmit={onLogin} style={{ display: "grid", gap: 10 }}>
          <input
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            placeholder={locale === "ko" ? "아이디" : "ID"}
            required
          />
          <input
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            placeholder={locale === "ko" ? "비밀번호" : "Password"}
            type="password"
            required
          />
          <button type="submit">{locale === "ko" ? "로그인" : "Sign In"}</button>
        </form>
        <p className="sa-inline-message">{loginMessage}</p>
      </section>
    </main>
  );
}
