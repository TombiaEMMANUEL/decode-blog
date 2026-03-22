import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#080412", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", position: "relative", overflow: "hidden" }}>

      {/* BACKGROUND GLOW */}
      <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%, -50%)", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ textAlign: "center", position: "relative", zIndex: 1, maxWidth: "500px" }}>

        {/* 404 NUMBER */}
        <div style={{ fontSize: "clamp(80px, 20vw, 140px)", fontWeight: 900, lineHeight: 1, letterSpacing: "-4px", background: "linear-gradient(135deg, #8b5cf6, #a78bfa, #6d28d9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "8px" }}>
          404
        </div>

        {/* BADGE */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "100px", padding: "6px 16px", marginBottom: "24px", color: "#a78bfa", fontSize: "13px", fontWeight: 500 }}>
          Page Not Found
        </div>

        <h1 style={{ color: "white", fontSize: "clamp(22px, 5vw, 32px)", fontWeight: 700, marginBottom: "14px", letterSpacing: "-0.5px" }}>
          Oops! This page doesn't exist
        </h1>

        <p style={{ color: "#9ca3af", fontSize: "15px", lineHeight: 1.7, marginBottom: "36px" }}>
          The page you're looking for may have been moved, deleted, or never existed. Let's get you back on track.
        </p>

        {/* BUTTONS */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/"
            style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#7c3aed", color: "white", padding: "12px 24px", borderRadius: "12px", fontWeight: 600, fontSize: "15px", textDecoration: "none" }}>
            ← Go Home
          </Link>
          <Link href="/blog"
            style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "12px 24px", borderRadius: "12px", fontWeight: 600, fontSize: "15px", textDecoration: "none" }}>
            Read Blog
          </Link>
        </div>

        {/* QUICK LINKS */}
        <div style={{ marginTop: "48px", paddingTop: "32px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "16px" }}>Or explore these pages:</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { label: "Blog", href: "/blog" },
              { label: "Learn", href: "/learn" },
              { label: "About", href: "/about" },
              { label: "Contact", href: "/contact" },
            ].map((link) => (
              <Link key={link.label} href={link.href}
                style={{ color: "#a78bfa", fontSize: "14px", textDecoration: "none", padding: "4px 0" }}
                onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
                onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}