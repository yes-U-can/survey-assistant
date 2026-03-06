import type { ReactNode } from "react";

function IllustrationFrame({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <svg
      viewBox="0 0 280 180"
      role="img"
      aria-label={title}
      className="sa-home-illustration"
    >
      {children}
    </svg>
  );
}

export function ParticipantPortalIllustration() {
  return (
    <IllustrationFrame title="스마트폰으로 설문에 응답하는 피검자">
      <defs>
        <linearGradient id="participant-backdrop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D8EFF7" />
          <stop offset="100%" stopColor="#BFD4E2" />
        </linearGradient>
        <linearGradient id="participant-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F2B4D8" />
          <stop offset="100%" stopColor="#9964BA" />
        </linearGradient>
        <linearGradient id="participant-hair" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D48ECF" />
          <stop offset="100%" stopColor="#7D58AF" />
        </linearGradient>
        <linearGradient id="participant-card" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF9FC" />
          <stop offset="100%" stopColor="#F2E0EC" />
        </linearGradient>
      </defs>

      <ellipse cx="138" cy="98" rx="114" ry="60" fill="url(#participant-backdrop)" />
      <circle cx="220" cy="42" r="20" fill="#F5C4D8" opacity="0.9" />

      <g transform="translate(40 18)">
        <rect x="120" y="44" width="64" height="82" rx="20" fill="url(#participant-card)" />
        <rect x="134" y="58" width="34" height="8" rx="4" fill="#7FA7BF" />
        <rect x="134" y="75" width="20" height="8" rx="4" fill="#E5A9CC" />
        <circle cx="139" cy="95" r="4" fill="#7FA7BF" />
        <rect x="148" y="91" width="18" height="8" rx="4" fill="#C7B6E2" />
        <circle cx="139" cy="112" r="4" fill="#E5A9CC" />
        <rect x="148" y="108" width="12" height="8" rx="4" fill="#7FA7BF" />

        <rect x="18" y="74" width="94" height="78" rx="36" fill="url(#participant-body)" />
        <circle cx="64" cy="54" r="27" fill="#F8D8E0" />
        <circle cx="45" cy="46" r="20" fill="url(#participant-hair)" />
        <circle cx="68" cy="36" r="25" fill="url(#participant-hair)" />
        <circle cx="87" cy="49" r="19" fill="url(#participant-hair)" />
        <path d="M39 51C39 31 54 17 72 17C91 17 103 31 103 47C90 45 80 35 72 24C64 36 53 45 39 51Z" fill="url(#participant-hair)" />

        <rect x="56" y="54" width="4" height="10" rx="2" fill="#2E2956" />
        <rect x="69" y="54" width="4" height="10" rx="2" fill="#2E2956" />

        <rect x="10" y="97" width="30" height="18" rx="9" fill="#8E6AC2" />
        <rect x="97" y="91" width="36" height="18" rx="9" fill="#F1C7D9" />
        <circle cx="130" cy="100" r="10" fill="#F1C7D9" />
        <rect x="92" y="84" width="22" height="34" rx="9" fill="#473C88" />
        <rect x="98" y="90" width="10" height="3" rx="1.5" fill="#F4ECF8" />
        <rect x="98" y="97" width="10" height="3" rx="1.5" fill="#F4ECF8" />
      </g>
    </IllustrationFrame>
  );
}

export function AdminPortalIllustration() {
  return (
    <IllustrationFrame title="클립보드와 설문 패널을 확인하는 연구관리자">
      <defs>
        <linearGradient id="admin-backdrop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D7ECF6" />
          <stop offset="100%" stopColor="#C8D9E5" />
        </linearGradient>
        <linearGradient id="admin-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8E75CF" />
          <stop offset="100%" stopColor="#4E418E" />
        </linearGradient>
        <linearGradient id="admin-hair" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#345C8B" />
          <stop offset="100%" stopColor="#213864" />
        </linearGradient>
        <linearGradient id="admin-panel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF9FC" />
          <stop offset="100%" stopColor="#EEF5F8" />
        </linearGradient>
      </defs>

      <ellipse cx="144" cy="96" rx="112" ry="60" fill="url(#admin-backdrop)" />
      <circle cx="58" cy="38" r="18" fill="#F3C6DA" opacity="0.9" />

      <g transform="translate(34 18)">
        <rect x="128" y="46" width="72" height="76" rx="20" fill="url(#admin-panel)" />
        <rect x="142" y="60" width="40" height="8" rx="4" fill="#D8CAE8" />
        <rect x="142" y="77" width="22" height="8" rx="4" fill="#E4A9CB" />
        <rect x="168" y="77" width="16" height="8" rx="4" fill="#97C2D6" />
        <rect x="142" y="94" width="46" height="8" rx="4" fill="#C7DEE8" />

        <rect x="22" y="76" width="96" height="76" rx="36" fill="url(#admin-body)" />
        <circle cx="70" cy="54" r="27" fill="#F8D8E0" />
        <circle cx="52" cy="46" r="18" fill="url(#admin-hair)" />
        <circle cx="74" cy="36" r="24" fill="url(#admin-hair)" />
        <circle cx="91" cy="48" r="16" fill="url(#admin-hair)" />
        <path d="M48 49C48 30 62 17 79 17C97 17 108 29 108 45C96 44 86 35 79 24C71 36 61 44 48 49Z" fill="url(#admin-hair)" />

        <rect x="62" y="54" width="4" height="10" rx="2" fill="#2E2956" />
        <rect x="75" y="54" width="4" height="10" rx="2" fill="#2E2956" />
        <circle cx="61" cy="58" r="7" fill="#4A5370" />
        <circle cx="79" cy="58" r="7" fill="#4A5370" />
        <circle cx="61" cy="58" r="4.5" fill="#F8D8E0" />
        <circle cx="79" cy="58" r="4.5" fill="#F8D8E0" />
        <rect x="67" y="56.75" width="6" height="2.5" rx="1.25" fill="#4A5370" />

        <rect x="104" y="92" width="28" height="38" rx="8" fill="#F5D8E7" />
        <rect x="111" y="102" width="14" height="4" rx="2" fill="#AB7CC7" />
        <rect x="111" y="111" width="10" height="4" rx="2" fill="#7FA7BF" />
        <rect x="111" y="120" width="14" height="4" rx="2" fill="#AB7CC7" />

        <rect x="10" y="98" width="32" height="18" rx="9" fill="#A07ACD" />
        <rect x="96" y="98" width="22" height="18" rx="9" fill="#F1C8DA" />
      </g>
    </IllustrationFrame>
  );
}
