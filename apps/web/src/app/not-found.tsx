import Link from "next/link";

export default function NotFound() {
  return (
    <main className="sa-page" style={{ maxWidth: 720 }}>
      <section className="sa-auth-hero">
        <h1>404</h1>
        <p>요청한 페이지를 찾을 수 없습니다. / Page not found.</p>
        <div className="sa-auth-links">
          <Link href="/ko">한국어 홈</Link>
          <Link href="/en">English Home</Link>
        </div>
      </section>
    </main>
  );
}
