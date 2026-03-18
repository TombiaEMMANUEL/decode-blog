import Link from "next/link";
import { FiBook, FiEdit, FiZap, FiUsers } from "react-icons/fi";

export default function AboutPage() {
  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#080412", padding: "60px 24px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>

        {/* HERO */}
        <div style={{ textAlign: "center", marginBottom: "80px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(139, 92, 246, 0.1)", border: "1px solid rgba(139, 92, 246, 0.3)", borderRadius: "100px", padding: "6px 16px", marginBottom: "24px", color: "#a78bfa", fontSize: "13px", fontWeight: 500 }}>
            <FiZap style={{ fontSize: "12px" }} />
            About Decode
          </div>
          <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 800, color: "white", lineHeight: 1.1, letterSpacing: "-2px", marginBottom: "24px" }}>
            We make the complex{" "}
            <span style={{ background: "linear-gradient(135deg, #8b5cf6, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              feel simple
            </span>
          </h1>
          <p style={{ color: "#9ca3af", fontSize: "18px", lineHeight: 1.7, maxWidth: "560px", margin: "0 auto" }}>
            Decode is a community-driven platform where curious minds come to read, learn, and build. We believe knowledge should be accessible, clear, and actionable.
          </p>
        </div>

        {/* MISSION */}
        <div style={{ backgroundColor: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: "20px", padding: "48px", marginBottom: "60px", textAlign: "center" }}>
          <h2 style={{ color: "white", fontSize: "28px", fontWeight: 700, marginBottom: "16px" }}>Our Mission</h2>
          <p style={{ color: "#9ca3af", fontSize: "16px", lineHeight: 1.8 }}>
            To build the most accessible learning and publishing platform for developers, designers, and builders — where anyone can share what they know and learn what they need.
          </p>
        </div>

        {/* VALUES */}
        <div style={{ marginBottom: "60px" }}>
          <h2 style={{ color: "white", fontSize: "28px", fontWeight: 700, marginBottom: "32px", textAlign: "center" }}>What we stand for</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
            {[
              { icon: FiBook, title: "Clarity", description: "We break down complex ideas into simple, digestible content anyone can understand.", color: "#8b5cf6" },
              { icon: FiEdit, title: "Community", description: "Everyone has something to teach. We give writers a platform to share their knowledge.", color: "#7c3aed" },
              { icon: FiZap, title: "Growth", description: "From beginner to advanced — we build structured learning paths for every level.", color: "#6d28d9" },
              { icon: FiUsers, title: "Openness", description: "Anyone can read, write, and learn on Decode. No paywalls, no barriers.", color: "#5b21b6" },
            ].map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.title} style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "28px" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "10px", backgroundColor: `${value.color}20`, border: `1px solid ${value.color}40`, display: "flex", alignItems: "center", justifyContent: "center", color: value.color, fontSize: "18px", marginBottom: "16px" }}>
                    <Icon />
                  </div>
                  <h3 style={{ color: "white", fontSize: "16px", fontWeight: 600, marginBottom: "8px" }}>{value.title}</h3>
                  <p style={{ color: "#9ca3af", fontSize: "14px", lineHeight: 1.6 }}>{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", padding: "60px 40px", backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "20px" }}>
          <h2 style={{ color: "white", fontSize: "28px", fontWeight: 700, marginBottom: "16px" }}>Join the community</h2>
          <p style={{ color: "#9ca3af", fontSize: "16px", marginBottom: "32px", lineHeight: 1.6 }}>
            Start reading, writing, and learning today. It's free and always will be.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/blog" style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#7c3aed", color: "white", padding: "12px 28px", borderRadius: "12px", fontWeight: 600, fontSize: "15px", textDecoration: "none" }}>
              <FiBook />
              Start Reading
            </Link>
            <Link href="/write" style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "12px 28px", borderRadius: "12px", fontWeight: 600, fontSize: "15px", textDecoration: "none" }}>
              <FiEdit />
              Start Writing
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}