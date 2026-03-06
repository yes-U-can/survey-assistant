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
    <IllustrationFrame title="참여 코드를 입력하고 설문에 응답하는 피검자">
      <defs>
        <linearGradient id="participant-wave" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#95E0F6" />
          <stop offset="100%" stopColor="#2A5F7F" />
        </linearGradient>
        <linearGradient id="participant-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F3B7D9" />
          <stop offset="100%" stopColor="#9E67BC" />
        </linearGradient>
        <linearGradient id="participant-hair" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B96BC1" />
          <stop offset="100%" stopColor="#6E4EA4" />
        </linearGradient>
        <linearGradient id="participant-card" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF8FC" />
          <stop offset="100%" stopColor="#F2DCEB" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="280" height="180" fill="transparent" />
      <circle cx="224" cy="34" r="24" fill="#F5C7DD" />
      <path
        d="M-8 123C31 90 58 67 102 61C156 54 183 77 230 110C247 123 263 132 286 141V180H-8Z"
        fill="url(#participant-wave)"
      />
      <path
        d="M18 154H204C196 165 172 171 132 171H7C9 163 13 157 18 154Z"
        fill="#7464B5"
        opacity="0.88"
      />

      <g transform="translate(34 22)">
        <ellipse cx="76" cy="132" rx="54" ry="10" fill="#6D5AA9" opacity="0.18" />
        <rect x="30" y="62" width="92" height="82" rx="36" fill="url(#participant-body)" />
        <circle cx="76" cy="48" r="26" fill="#F8D9E0" />

        <circle cx="56" cy="38" r="20" fill="url(#participant-hair)" />
        <circle cx="79" cy="30" r="24" fill="url(#participant-hair)" />
        <circle cx="96" cy="42" r="18" fill="url(#participant-hair)" />
        <path d="M49 45C49 27 61 14 80 14C96 14 106 24 106 40C95 39 85 31 77 22C71 31 61 40 49 45Z" fill="url(#participant-hair)" />

        <rect x="67" y="47" width="4" height="10" rx="2" fill="#2F2A55" />
        <rect x="79" y="47" width="4" height="10" rx="2" fill="#2F2A55" />

        <rect x="22" y="86" width="28" height="18" rx="9" fill="#8F69C1" />
        <rect x="110" y="84" width="34" height="18" rx="9" fill="#F1C4D8" />
        <circle cx="143" cy="93" r="10" fill="#F1C4D8" />

        <rect x="138" y="48" width="60" height="84" rx="20" fill="url(#participant-card)" />
        <rect x="151" y="62" width="34" height="8" rx="4" fill="#6EA8C2" opacity="0.8" />
        <rect x="151" y="78" width="22" height="8" rx="4" fill="#E2A9C9" />
        <circle cx="157" cy="98" r="4" fill="#6EA8C2" />
        <rect x="166" y="94" width="18" height="8" rx="4" fill="#C7B4E4" />
        <circle cx="157" cy="115" r="4" fill="#E2A9C9" />
        <rect x="166" y="111" width="14" height="8" rx="4" fill="#6EA8C2" />
      </g>
    </IllustrationFrame>
  );
}

export function AdminPortalIllustration() {
  return (
    <IllustrationFrame title="템플릿과 결과를 관리하는 연구관리자">
      <defs>
        <linearGradient id="admin-wave" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9ADAF0" />
          <stop offset="100%" stopColor="#2A5F7F" />
        </linearGradient>
        <linearGradient id="admin-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8F74CF" />
          <stop offset="100%" stopColor="#4C3E8D" />
        </linearGradient>
        <linearGradient id="admin-hair" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#385B8E" />
          <stop offset="100%" stopColor="#233864" />
        </linearGradient>
        <linearGradient id="admin-panel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF8FC" />
          <stop offset="100%" stopColor="#EEF5F8" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="280" height="180" fill="transparent" />
      <circle cx="46" cy="30" r="20" fill="#F4C6DB" />
      <path
        d="M-8 126C24 113 54 88 98 82C148 76 187 92 240 121C254 129 268 136 286 142V180H-8Z"
        fill="url(#admin-wave)"
      />
      <path
        d="M64 154H258C248 165 222 171 183 171H48C50 162 56 157 64 154Z"
        fill="#7262B2"
        opacity="0.92"
      />

      <g transform="translate(28 20)">
        <rect x="126" y="26" width="84" height="62" rx="20" fill="url(#admin-panel)" />
        <rect x="140" y="40" width="42" height="8" rx="4" fill="#D9C9EC" />
        <rect x="140" y="56" width="26" height="8" rx="4" fill="#E7AFCF" />
        <rect x="170" y="56" width="20" height="8" rx="4" fill="#9CC7D8" />
        <rect x="140" y="72" width="54" height="8" rx="4" fill="#C8DFE8" />

        <ellipse cx="88" cy="132" rx="58" ry="10" fill="#6D5AA9" opacity="0.18" />
        <rect x="36" y="64" width="94" height="80" rx="36" fill="url(#admin-body)" />
        <circle cx="82" cy="48" r="25" fill="#F8D9E0" />
        <circle cx="66" cy="40" r="18" fill="url(#admin-hair)" />
        <circle cx="88" cy="32" r="23" fill="url(#admin-hair)" />
        <circle cx="102" cy="43" r="16" fill="url(#admin-hair)" />
        <path d="M56 45C56 28 68 15 86 15C101 15 110 25 110 40C98 39 90 31 84 22C78 30 68 39 56 45Z" fill="url(#admin-hair)" />
        <rect x="73" y="46" width="4" height="10" rx="2" fill="#2F2A55" />
        <rect x="85" y="46" width="4" height="10" rx="2" fill="#2F2A55" />

        <rect x="104" y="92" width="72" height="38" rx="12" fill="#EADAF0" />
        <rect x="116" y="102" width="20" height="6" rx="3" fill="#A57AC4" />
        <rect x="140" y="102" width="24" height="6" rx="3" fill="#6EA8C2" />
        <rect x="122" y="113" width="34" height="6" rx="3" fill="#FFFFFF" opacity="0.88" />

        <rect x="28" y="94" width="32" height="18" rx="9" fill="#A07BCF" />
        <rect x="112" y="82" width="36" height="16" rx="8" fill="#F0C7D8" />
        <circle cx="147" cy="90" r="9" fill="#F0C7D8" />
      </g>
    </IllustrationFrame>
  );
}
