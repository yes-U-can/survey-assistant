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
          <stop offset="0%" stopColor="#E0F0F6" />
          <stop offset="100%" stopColor="#C7D8E4" />
        </linearGradient>
        <linearGradient id="participant-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F2B5D8" />
          <stop offset="100%" stopColor="#9966BB" />
        </linearGradient>
        <linearGradient id="participant-hair" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D591CF" />
          <stop offset="100%" stopColor="#7B58AF" />
        </linearGradient>
      </defs>

      <ellipse cx="138" cy="98" rx="112" ry="58" fill="url(#participant-backdrop)" />
      <circle cx="218" cy="44" r="18" fill="#F4C7DA" opacity="0.9" />

      <g transform="translate(34 20)">
        <rect x="26" y="82" width="110" height="70" rx="34" fill="url(#participant-body)" />
        <path d="M120 98C131 93 141 99 142 110C143 118 137 125 127 126L112 109Z" fill="#F1C6D9" />
        <rect x="110" y="74" width="30" height="54" rx="8" fill="#443A86" />
        <rect x="114" y="79" width="22" height="44" rx="6" fill="#F7F0FA" />
        <circle cx="119" cy="91" r="3" fill="#86B4C7" />
        <rect x="126" y="88" width="7" height="5" rx="2.5" fill="#DDA8C9" />
        <circle cx="119" cy="103" r="3" fill="#DDA8C9" />
        <rect x="126" y="100" width="10" height="5" rx="2.5" fill="#C6B8E4" />
        <circle cx="119" cy="115" r="3" fill="#86B4C7" />
        <rect x="126" y="112" width="6" height="5" rx="2.5" fill="#DDA8C9" />

        <circle cx="74" cy="54" r="25" fill="#F8D9E0" />
        <circle cx="54" cy="46" r="18" fill="url(#participant-hair)" />
        <circle cx="77" cy="37" r="24" fill="url(#participant-hair)" />
        <circle cx="94" cy="50" r="17" fill="url(#participant-hair)" />
        <path d="M52 51C52 32 65 20 82 20C97 20 108 31 108 45C95 44 87 35 82 27C74 37 65 45 52 51Z" fill="url(#participant-hair)" />

        <path d="M96 57C96 69 87 78 75 78C63 78 53 69 53 57C53 45 63 37 75 37C87 37 96 45 96 57Z" fill="#F8D9E0" />
        <ellipse cx="73" cy="56" rx="2.2" ry="3.4" fill="#2E2958" />
        <ellipse cx="83" cy="57" rx="2.2" ry="3.4" fill="#2E2958" />
        <path d="M87 65C90 67 93 67 96 65L96 67C93 69 89 69 86 67Z" fill="#B97F9F" />
        <path d="M91 61C95 60 98 62 99 66C95 69 90 68 88 64Z" fill="#F0C5D9" />

        <rect x="18" y="100" width="30" height="18" rx="9" fill="#8D69C1" />
      </g>
    </IllustrationFrame>
  );
}

export function AdminPortalIllustration() {
  return (
    <IllustrationFrame title="노트북과 차트 패널을 확인하는 연구관리자">
      <defs>
        <linearGradient id="admin-backdrop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DFEFF6" />
          <stop offset="100%" stopColor="#C5D7E4" />
        </linearGradient>
        <linearGradient id="admin-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8F75CF" />
          <stop offset="100%" stopColor="#4E418E" />
        </linearGradient>
        <linearGradient id="admin-hair" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#355C8B" />
          <stop offset="100%" stopColor="#213865" />
        </linearGradient>
        <linearGradient id="admin-panel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF8FC" />
          <stop offset="100%" stopColor="#EEF4F7" />
        </linearGradient>
      </defs>

      <ellipse cx="142" cy="98" rx="112" ry="58" fill="url(#admin-backdrop)" />
      <circle cx="60" cy="42" r="16" fill="#F4C7DA" opacity="0.9" />

      <g transform="translate(28 20)">
        <rect x="150" y="42" width="56" height="78" rx="18" fill="url(#admin-panel)" />
        <circle cx="170" cy="68" r="12" fill="#D9CAE8" />
        <path d="M170 68L170 56A12 12 0 0 1 181 74Z" fill="#8AB8CA" />
        <circle cx="170" cy="68" r="5.5" fill="url(#admin-panel)" />
        <rect x="162" y="92" width="28" height="6" rx="3" fill="#DFA9CB" />
        <path d="M159 109L166 101L174 105L181 97L189 101L189 105L181 101L174 109L166 105L159 113Z" fill="#8AB8CA" />
        <circle cx="166" cy="103" r="2.5" fill="#DFA9CB" />
        <circle cx="174" cy="107" r="2.5" fill="#C5B6E2" />
        <circle cx="181" cy="99" r="2.5" fill="#8AB8CA" />

        <rect x="24" y="82" width="108" height="70" rx="34" fill="url(#admin-body)" />
        <circle cx="76" cy="54" r="25" fill="#F8D9E0" />
        <circle cx="58" cy="47" r="17" fill="url(#admin-hair)" />
        <circle cx="78" cy="37" r="23" fill="url(#admin-hair)" />
        <circle cx="95" cy="48" r="15" fill="url(#admin-hair)" />
        <path d="M54 49C54 31 67 20 83 20C98 20 109 30 109 44C97 43 88 35 83 27C75 36 66 44 54 49Z" fill="url(#admin-hair)" />

        <path d="M98 57C98 69 89 78 77 78C64 78 55 69 55 57C55 45 64 37 77 37C89 37 98 45 98 57Z" fill="#F8D9E0" />
        <ellipse cx="72" cy="56" rx="7" ry="7" fill="#4A5370" />
        <ellipse cx="84" cy="56" rx="7" ry="7" fill="#4A5370" />
        <ellipse cx="72" cy="56" rx="4.5" ry="4.5" fill="#F8D9E0" />
        <ellipse cx="84" cy="56" rx="4.5" ry="4.5" fill="#F8D9E0" />
        <rect x="76" y="54.75" width="4" height="2.5" rx="1.25" fill="#4A5370" />

        <rect x="88" y="82" width="48" height="30" rx="6" fill="#EEDCEB" />
        <rect x="92" y="86" width="40" height="22" rx="4" fill="#F9F3FB" />
        <path d="M93 104L100 97L109 101L117 92L127 96L127 100L117 96L109 105L100 101L93 108Z" fill="#8AB8CA" />
        <circle cx="100" cy="99" r="2.2" fill="#DDA8CA" />
        <circle cx="109" cy="103" r="2.2" fill="#C5B6E2" />
        <circle cx="117" cy="94" r="2.2" fill="#DDA8CA" />
        <circle cx="127" cy="98" r="2.2" fill="#8AB8CA" />
        <path d="M82 112H142L149 120H75Z" fill="#B28AC9" />
        <rect x="107" y="114" width="10" height="2.5" rx="1.25" fill="#EEDCEB" />

        <rect x="16" y="102" width="28" height="18" rx="9" fill="#A07BCD" />
      </g>
    </IllustrationFrame>
  );
}
