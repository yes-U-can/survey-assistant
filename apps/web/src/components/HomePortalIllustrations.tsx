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
        <linearGradient id="participant-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DDEFF6" />
          <stop offset="100%" stopColor="#C7DAE5" />
        </linearGradient>
        <linearGradient id="participant-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F2B4D7" />
          <stop offset="100%" stopColor="#9A65BB" />
        </linearGradient>
        <linearGradient id="participant-hair" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D38DCB" />
          <stop offset="100%" stopColor="#7B56AF" />
        </linearGradient>
        <linearGradient id="participant-card" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF8FC" />
          <stop offset="100%" stopColor="#F4E4EE" />
        </linearGradient>
      </defs>

      <ellipse cx="136" cy="98" rx="112" ry="58" fill="url(#participant-bg)" />
      <circle cx="214" cy="42" r="18" fill="#F5C8DB" opacity="0.9" />

      <g transform="translate(32 18)">
        <rect x="140" y="42" width="56" height="70" rx="18" fill="url(#participant-card)" />
        <rect x="152" y="56" width="28" height="7" rx="3.5" fill="#7EA8C0" />
        <circle cx="156" cy="78" r="4" fill="#E3A8CA" />
        <rect x="165" y="74" width="16" height="8" rx="4" fill="#C8B8E2" />
        <circle cx="156" cy="97" r="4" fill="#7EA8C0" />
        <rect x="165" y="93" width="12" height="8" rx="4" fill="#E3A8CA" />

        <rect x="26" y="74" width="94" height="76" rx="34" fill="url(#participant-body)" />
        <circle cx="72" cy="50" r="25" fill="#F8D8E0" />
        <circle cx="54" cy="43" r="18" fill="url(#participant-hair)" />
        <circle cx="74" cy="34" r="23" fill="url(#participant-hair)" />
        <circle cx="91" cy="45" r="17" fill="url(#participant-hair)" />
        <path d="M48 48C48 29 61 17 79 17C96 17 107 29 107 45C95 43 86 34 79 25C71 35 61 43 48 48Z" fill="url(#participant-hair)" />
        <rect x="63" y="50" width="4" height="9" rx="2" fill="#2F2958" />
        <rect x="75" y="50" width="4" height="9" rx="2" fill="#2F2958" />

        <rect x="106" y="84" width="24" height="40" rx="8" fill="#473C88" />
        <rect x="112" y="90" width="12" height="3" rx="1.5" fill="#F6EEF9" />
        <rect x="112" y="97" width="12" height="3" rx="1.5" fill="#F6EEF9" />
        <rect x="112" y="104" width="8" height="3" rx="1.5" fill="#F6EEF9" />

        <rect x="95" y="88" width="20" height="16" rx="8" fill="#F0C6D9" />
        <circle cx="114" cy="96" r="8" fill="#F0C6D9" />
        <rect x="14" y="96" width="28" height="18" rx="9" fill="#8D68C1" />
      </g>
    </IllustrationFrame>
  );
}

export function AdminPortalIllustration() {
  return (
    <IllustrationFrame title="클립보드와 설문 패널을 확인하는 연구관리자">
      <defs>
        <linearGradient id="admin-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DDEFF6" />
          <stop offset="100%" stopColor="#C5D8E5" />
        </linearGradient>
        <linearGradient id="admin-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8F76D0" />
          <stop offset="100%" stopColor="#4F428F" />
        </linearGradient>
        <linearGradient id="admin-hair" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#345C8B" />
          <stop offset="100%" stopColor="#213864" />
        </linearGradient>
        <linearGradient id="admin-panel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF8FC" />
          <stop offset="100%" stopColor="#EEF4F7" />
        </linearGradient>
      </defs>

      <ellipse cx="140" cy="98" rx="112" ry="58" fill="url(#admin-bg)" />
      <circle cx="60" cy="40" r="16" fill="#F4C7DB" opacity="0.9" />

      <g transform="translate(30 18)">
        <rect x="144" y="40" width="56" height="78" rx="18" fill="url(#admin-panel)" />
        <rect x="156" y="54" width="28" height="7" rx="3.5" fill="#D8CAE8" />
        <rect x="156" y="71" width="18" height="8" rx="4" fill="#E3A8CA" />
        <rect x="178" y="71" width="10" height="8" rx="4" fill="#97C1D6" />
        <rect x="156" y="90" width="10" height="16" rx="4" fill="#97C1D6" />
        <rect x="170" y="82" width="10" height="24" rx="4" fill="#C5B7E1" />
        <rect x="184" y="95" width="10" height="11" rx="4" fill="#E3A8CA" />

        <rect x="24" y="74" width="96" height="76" rx="34" fill="url(#admin-body)" />
        <circle cx="70" cy="50" r="25" fill="#F8D8E0" />
        <circle cx="53" cy="43" r="17" fill="url(#admin-hair)" />
        <circle cx="73" cy="34" r="22" fill="url(#admin-hair)" />
        <circle cx="89" cy="45" r="15" fill="url(#admin-hair)" />
        <path d="M48 47C48 29 61 18 77 18C94 18 105 29 105 44C94 43 85 35 77 26C70 35 60 42 48 47Z" fill="url(#admin-hair)" />
        <rect x="61" y="50" width="4" height="9" rx="2" fill="#2F2958" />
        <rect x="73" y="50" width="4" height="9" rx="2" fill="#2F2958" />

        <circle cx="60" cy="54" r="7" fill="#4A5370" />
        <circle cx="78" cy="54" r="7" fill="#4A5370" />
        <circle cx="60" cy="54" r="4.5" fill="#F8D8E0" />
        <circle cx="78" cy="54" r="4.5" fill="#F8D8E0" />
        <rect x="66" y="52.75" width="6" height="2.5" rx="1.25" fill="#4A5370" />

        <rect x="102" y="86" width="28" height="42" rx="8" fill="#F6D9E8" />
        <rect x="110" y="82" width="12" height="7" rx="3.5" fill="#B88DCB" />
        <rect x="109" y="97" width="14" height="4" rx="2" fill="#AD80C8" />
        <rect x="109" y="106" width="10" height="4" rx="2" fill="#7FA8C0" />
        <rect x="109" y="115" width="14" height="4" rx="2" fill="#AD80C8" />

        <rect x="14" y="98" width="28" height="18" rx="9" fill="#A07BCD" />
        <rect x="94" y="96" width="18" height="18" rx="9" fill="#F1C7D9" />
      </g>
    </IllustrationFrame>
  );
}
