"use client";

import Link from "next/link";
import Script from "next/script";
import { signIn } from "next-auth/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type LocaleCode = "ko" | "en";

type Props = {
  locale: LocaleCode;
  callbackUrl: string;
  isGoogleEnabled: boolean;
  googleClientId: string | null;
  initialErrorCode: string | null;
};

type GoogleCredentialResponse = {
  credential?: string;
};

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
            cancel_on_tap_outside?: boolean;
            use_fedcm_for_prompt?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: "standard" | "icon";
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              shape?: "rectangular" | "pill" | "circle" | "square";
              logo_alignment?: "left" | "center";
              width?: number;
              locale?: string;
            },
          ) => void;
          cancel: () => void;
        };
      };
    };
  }
}

function resolveAuthErrorMessage(locale: LocaleCode, errorCode: string | null) {
  if (!errorCode) {
    return null;
  }

  const ko =
    errorCode === "admin_not_invited"
      ? "초대되지 않은 관리자 계정입니다."
      : errorCode === "admin_inactive"
        ? "비활성화된 관리자 계정입니다."
        : errorCode === "account_role_not_admin"
          ? "이 계정은 관리자 권한이 없습니다."
          : errorCode === "admin_email_required"
            ? "Google 계정 이메일 제공 동의가 필요합니다."
            : errorCode === "admin_email_not_verified"
              ? "이 Google 계정의 이메일이 아직 인증되지 않았습니다."
              : errorCode === "google_token_invalid"
                ? "Google 로그인 확인에 실패했습니다. 다시 시도해 주세요."
                : errorCode === "google_credential_missing"
                  ? "Google 로그인 응답이 비어 있습니다. 다시 시도해 주세요."
                  : errorCode === "oauth_not_configured"
                    ? "간편 로그인 환경변수가 아직 연결되지 않았습니다."
                    : errorCode === "oauth_subject_missing"
                      ? "Google 계정 식별값을 확인하지 못했습니다."
                      : errorCode === "rate_limited"
                        ? "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요."
                        : errorCode === "google_script_load_failed"
                          ? "Google 로그인 버튼을 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요."
                          : errorCode === "google_script_unavailable"
                            ? "Google 로그인 스크립트를 초기화하지 못했습니다."
                            : errorCode === "google_signin_failed"
                              ? "Google 로그인에 실패했습니다. 잠시 후 다시 시도해 주세요."
                              : "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.";

  const en =
    errorCode === "admin_not_invited"
      ? "This account is not invited for admin access."
      : errorCode === "admin_inactive"
        ? "This admin account is inactive."
        : errorCode === "account_role_not_admin"
          ? "This account is not an admin account."
          : errorCode === "admin_email_required"
            ? "Email permission is required for admin sign-in."
            : errorCode === "admin_email_not_verified"
              ? "This Google account email is not verified yet."
              : errorCode === "google_token_invalid"
                ? "Google verification failed. Please try again."
                : errorCode === "google_credential_missing"
                  ? "Google did not return a valid credential. Please try again."
                  : errorCode === "oauth_not_configured"
                    ? "OAuth environment variables are not configured yet."
                    : errorCode === "oauth_subject_missing"
                      ? "Google account subject is missing."
                      : errorCode === "rate_limited"
                        ? "Too many attempts. Please try again later."
                        : errorCode === "google_script_load_failed"
                          ? "Could not load the Google sign-in button. Refresh and try again."
                          : errorCode === "google_script_unavailable"
                            ? "Google sign-in script did not initialize."
                            : errorCode === "google_signin_failed"
                              ? "Google sign-in failed. Please try again."
                              : "Sign-in failed. Please try again.";

  return locale === "ko" ? ko : en;
}

export function AdminGoogleIdentityPanel({
  locale,
  callbackUrl,
  isGoogleEnabled,
  googleClientId,
  initialErrorCode,
}: Props) {
  const buttonRootRef = useRef<HTMLDivElement | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [scriptFailed, setScriptFailed] = useState(false);
  const [buttonWidth, setButtonWidth] = useState(360);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(initialErrorCode);

  const t = useMemo(
    () =>
      locale === "ko"
        ? {
            title: "연구자 간편 로그인",
            subtitle:
              "초대된 연구자 또는 운영자 계정은 Google 계정으로 로그인할 수 있습니다. 로그인 후 이메일 정책에 따라 연구자 또는 플랫폼 어드민 권한이 연결됩니다.",
            flowTitle: "로그인 흐름",
            flow: ["Google 계정 인증", "초대 및 권한 확인", "관리 콘솔 진입"],
            setupMissing:
              "간편 로그인 환경변수가 아직 연결되지 않았습니다. GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET를 확인해 주세요.",
            loadingButton: "Google 로그인 버튼을 불러오는 중입니다...",
            toParticipant: "피검자 로그인으로 이동",
            toHome: "홈으로 이동",
            signingIn: "Google 계정을 확인하는 중입니다...",
          }
        : {
            title: "Research Admin Sign-In",
            subtitle:
              "Invited research-admin and platform-admin accounts can sign in with a Google account. After authentication, role access is resolved by email policy.",
            flowTitle: "Sign-in flow",
            flow: ["Google account sign-in", "Invite and role check", "Enter admin console"],
            setupMissing:
              "OAuth environment variables are not configured yet. Check GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET.",
            loadingButton: "Loading the Google sign-in button...",
            toParticipant: "Go to participant auth",
            toHome: "Back to home",
            signingIn: "Verifying your Google account...",
          },
    [locale],
  );

  useEffect(() => {
    setErrorCode(initialErrorCode);
  }, [initialErrorCode]);

  useEffect(() => {
    const container = buttonRootRef.current;
    if (!container) {
      return undefined;
    }

    const updateWidth = () => {
      const nextWidth = Math.floor(container.getBoundingClientRect().width);
      if (nextWidth > 0) {
        setButtonWidth(Math.max(260, Math.min(380, nextWidth)));
      }
    };

    updateWidth();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateWidth);
      return () => window.removeEventListener("resize", updateWidth);
    }

    const observer = new ResizeObserver(updateWidth);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const handleCredentialResponse = useCallback(
    async (response: GoogleCredentialResponse) => {
      if (!response.credential) {
        setErrorCode("google_credential_missing");
        return;
      }

      setIsSubmitting(true);
      setErrorCode(null);

      try {
        const result = await signIn("google-id-token", {
          credential: response.credential,
          redirect: false,
          callbackUrl,
        });

        if (result?.ok && result.url) {
          window.location.href = result.url;
          return;
        }

        setErrorCode(result?.error ?? "google_signin_failed");
      } catch {
        setErrorCode("google_signin_failed");
      } finally {
        setIsSubmitting(false);
      }
    },
    [callbackUrl],
  );

  useEffect(() => {
    if (!isGoogleEnabled || !googleClientId || !scriptReady || scriptFailed) {
      return;
    }

    const idApi = window.google?.accounts?.id;
    const container = buttonRootRef.current;
    if (!idApi || !container) {
      setErrorCode((current) => current ?? "google_script_unavailable");
      return;
    }

    container.replaceChildren();
    setErrorCode((current) =>
      current === "google_script_unavailable" || current === "google_script_load_failed"
        ? null
        : current,
    );

    idApi.initialize({
      client_id: googleClientId,
      callback: handleCredentialResponse,
      cancel_on_tap_outside: true,
      use_fedcm_for_prompt: false,
    });

    idApi.renderButton(container, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "pill",
      logo_alignment: "left",
      width: buttonWidth,
      locale,
    });

    return () => {
      idApi.cancel();
    };
  }, [
    buttonWidth,
    googleClientId,
    handleCredentialResponse,
    isGoogleEnabled,
    locale,
    scriptFailed,
    scriptReady,
  ]);

  const errorMessage = resolveAuthErrorMessage(locale, errorCode);

  return (
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

      {isGoogleEnabled && googleClientId ? (
        <>
          <Script
            src={`https://accounts.google.com/gsi/client?hl=${locale}`}
            strategy="afterInteractive"
            onLoad={() => setScriptReady(true)}
            onError={() => {
              setScriptFailed(true);
              setErrorCode((current) => current ?? "google_script_load_failed");
            }}
          />
          <div className="sa-oauth-buttons" style={{ marginTop: 14 }}>
            <div
              className="sa-gis-button-shell"
              data-testid="google-gis-root"
              data-provider="google-id-token"
              data-callback-url={callbackUrl}
            >
              <div ref={buttonRootRef} className="sa-gis-button-slot" />
            </div>
          </div>
          {!scriptReady && !scriptFailed ? (
            <p className="sa-inline-message" style={{ marginTop: 12 }}>
              {t.loadingButton}
            </p>
          ) : null}
          {isSubmitting ? (
            <p className="sa-inline-message" style={{ marginTop: 12 }}>
              {t.signingIn}
            </p>
          ) : null}
        </>
      ) : (
        <p className="sa-inline-message" style={{ marginTop: 12 }}>
          {t.setupMissing}
        </p>
      )}

      {errorMessage ? (
        <p className="sa-inline-message" style={{ marginTop: 12 }}>
          {errorMessage}
        </p>
      ) : null}

      <div className="sa-auth-links">
        <Link href={`/${locale}/auth/participant`}>{t.toParticipant}</Link>
        <Link href={`/${locale}`}>{t.toHome}</Link>
      </div>
    </section>
  );
}
