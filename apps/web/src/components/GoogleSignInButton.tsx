type Props = {
  href: string;
  label: string;
};

export function GoogleSignInButton({ href, label }: Props) {
  return (
    <a className="sa-google-btn" href={href}>
      <span className="sa-google-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path
            fill="#EA4335"
            d="M12 10.2v3.9h5.4c-.2 1.3-1.6 3.9-5.4 3.9-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.6 3.5 14.5 2.5 12 2.5 6.8 2.5 2.7 6.7 2.7 12s4.1 9.5 9.3 9.5c5.4 0 8.9-3.8 8.9-9.2 0-.6-.1-1.1-.2-1.6H12z"
          />
          <path
            fill="#34A853"
            d="M3.8 7.4l3.2 2.3C7.8 8.2 9.7 6.7 12 6.7c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.6 3.5 14.5 2.5 12 2.5c-3.7 0-6.9 2.1-8.2 4.9z"
          />
          <path
            fill="#FBBC05"
            d="M12 21.5c2.4 0 4.5-.8 6-2.3l-2.8-2.2c-.8.6-1.9 1-3.2 1-3.7 0-5.2-2.5-5.4-3.9l-3.3 2.5c1.3 2.9 4.4 4.9 8.7 4.9z"
          />
          <path
            fill="#4285F4"
            d="M20.9 12.3c0-.6-.1-1.1-.2-1.6H12v3.9h5.4c-.3 1.7-1.4 3-2.8 3.8l2.8 2.2c1.6-1.5 3.5-4.1 3.5-8.3z"
          />
        </svg>
      </span>
      <span>{label}</span>
    </a>
  );
}
