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
    <IllustrationFrame title="설문에 참여하는 피검자 일러스트">
      <defs>
        <linearGradient id="sa-participant-wave" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#80D8F7" />
          <stop offset="100%" stopColor="#2A5F7F" />
        </linearGradient>
        <linearGradient id="sa-participant-body-pink" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F3B7D9" />
          <stop offset="100%" stopColor="#9A61B8" />
        </linearGradient>
        <linearGradient id="sa-participant-body-violet" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8D6CCB" />
          <stop offset="100%" stopColor="#4B3C8A" />
        </linearGradient>
        <linearGradient id="sa-participant-soft-sky" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F8D9EA" />
          <stop offset="100%" stopColor="#EEDFF7" />
        </linearGradient>
        <linearGradient id="sa-participant-floor" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B7B0E5" />
          <stop offset="100%" stopColor="#6A63B0" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="280" height="180" fill="transparent" />
      <circle cx="228" cy="36" r="22" fill="#F4C0D6" />
      <path
        d="M0 110C35 84 57 58 104 50C157 41 182 60 220 96C244 120 257 129 280 137V180H0Z"
        fill="url(#sa-participant-wave)"
      />
      <g opacity="0.72" fill="url(#sa-participant-soft-sky)">
        <path d="M162 25C172 10 195 10 206 24C217 19 229 27 229 39H155C155 31 159 26 162 25Z" />
        <path d="M34 44C42 32 59 31 68 42C76 38 87 45 87 55H26C26 49 30 45 34 44Z" />
      </g>
      <path
        d="M36 152H218C205 164 182 170 151 170H21C24 162 30 156 36 152Z"
        fill="url(#sa-participant-floor)"
      />

      <g transform="translate(58 40)">
        <ellipse cx="68" cy="114" rx="54" ry="10" fill="#6D5AA9" opacity="0.22" />
        <path
          d="M40 32C31 16 44 0 67 0C91 0 108 18 104 38C100 60 75 63 60 61C50 60 45 49 40 32Z"
          fill="url(#sa-participant-body-pink)"
        />
        <circle cx="66" cy="42" r="25" fill="#F8D8DF" />
        <path
          d="M41 38C41 16 57 4 73 4C91 4 103 18 103 34C91 30 84 20 78 13C73 23 59 34 41 38Z"
          fill="url(#sa-participant-body-pink)"
        />
        <rect x="54" y="40" width="4" height="10" rx="2" fill="#34305B" />
        <rect x="67" y="40" width="4" height="10" rx="2" fill="#34305B" />
        <path
          d="M31 72C31 56 44 44 60 44H78C96 44 110 58 110 76V119C110 136 96 150 78 150H61C42 150 27 136 27 118V83C27 79 28 75 31 72Z"
          fill="url(#sa-participant-body-pink)"
        />
        <ellipse cx="68" cy="82" rx="22" ry="27" fill="#F7E7EF" opacity="0.88" />
        <path
          d="M26 79C18 72 7 77 6 89C5 100 16 106 28 102Z"
          fill="url(#sa-participant-body-violet)"
        />
        <path
          d="M111 73C121 66 132 71 133 84C134 95 123 102 112 98Z"
          fill="#F1C6D9"
        />
        <rect x="104" y="68" width="24" height="32" rx="8" fill="#4E3D89" />
        <rect x="110" y="76" width="12" height="3" rx="1.5" fill="#F3EAF8" />
        <rect x="110" y="83" width="8" height="3" rx="1.5" fill="#F3EAF8" />
        <rect x="109" y="90" width="10" height="3" rx="1.5" fill="#F3EAF8" />
      </g>
    </IllustrationFrame>
  );
}

export function AdminPortalIllustration() {
  return (
    <IllustrationFrame title="설문을 운영하는 연구관리자 일러스트">
      <defs>
        <linearGradient id="sa-admin-wave" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#80D8F7" />
          <stop offset="100%" stopColor="#2A5F7F" />
        </linearGradient>
        <linearGradient id="sa-admin-body-violet" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8D6CCB" />
          <stop offset="100%" stopColor="#4B3C8A" />
        </linearGradient>
        <linearGradient id="sa-admin-soft-sky" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F8D9EA" />
          <stop offset="100%" stopColor="#EEDFF7" />
        </linearGradient>
        <linearGradient id="sa-admin-floor" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B7B0E5" />
          <stop offset="100%" stopColor="#6A63B0" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="280" height="180" fill="transparent" />
      <circle cx="38" cy="34" r="20" fill="#F0C6DA" />
      <path
        d="M0 121C32 110 58 83 103 78C148 72 180 83 228 114C246 126 260 135 280 140V180H0Z"
        fill="url(#sa-admin-wave)"
      />
      <g opacity="0.72" fill="url(#sa-admin-soft-sky)">
        <path d="M172 28C181 16 202 15 212 28C222 22 235 30 235 42H164C164 35 169 29 172 28Z" />
      </g>
      <path
        d="M74 152H259C247 164 221 170 184 170H60C61 161 68 155 74 152Z"
        fill="url(#sa-admin-floor)"
      />

      <g transform="translate(34 34)">
        <rect x="98" y="18" width="86" height="68" rx="18" fill="#F7EEF6" />
        <rect x="110" y="32" width="46" height="10" rx="5" fill="#E6D4F1" />
        <rect x="110" y="48" width="30" height="10" rx="5" fill="#F2BCD9" />
        <rect x="145" y="48" width="24" height="10" rx="5" fill="#9BBFD3" />
        <rect x="110" y="64" width="58" height="10" rx="5" fill="#C6DCE8" />

        <ellipse cx="75" cy="120" rx="60" ry="11" fill="#6D5AA9" opacity="0.2" />
        <circle cx="74" cy="38" r="24" fill="#F8D8DF" />
        <path
          d="M49 35C49 14 65 4 81 4C96 4 111 14 111 35C103 31 95 24 87 14C82 23 67 33 49 35Z"
          fill="#2C4C7A"
        />
        <rect x="63" y="37" width="4" height="10" rx="2" fill="#34305B" />
        <rect x="76" y="37" width="4" height="10" rx="2" fill="#34305B" />
        <path
          d="M44 67C44 51 57 40 73 40H90C109 40 122 55 122 74V119C122 136 108 150 89 150H72C53 150 38 136 38 118V82C38 76 40 71 44 67Z"
          fill="url(#sa-admin-body-violet)"
        />
        <ellipse cx="86" cy="89" rx="22" ry="29" fill="#4F418D" opacity="0.62" />
        <path d="M117 83C129 79 138 90 134 102C129 115 113 114 108 105Z" fill="#F0C7D8" />
        <rect x="102" y="78" width="30" height="22" rx="9" fill="#F6D8E6" />
        <rect x="109" y="84" width="8" height="3" rx="1.5" fill="#A06ABF" />
        <rect x="109" y="90" width="14" height="3" rx="1.5" fill="#6D8EA7" />
        <rect x="109" y="96" width="10" height="3" rx="1.5" fill="#A06ABF" />
      </g>
    </IllustrationFrame>
  );
}
