"use client";
import { useState } from "react";
import { FiMail, FiSend, FiGithub } from "react-icons/fi";
import { FaXTwitter } from "react-icons/fa6";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSent(true);
  };

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#080412", padding: "60px 24px" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>

        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <h1 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 800, color: "white", letterSpacing: "-1px", marginBottom: "16px" }}>
            Get in touch
          </h1>
          <p style={{ color: "#9ca3af", fontSize: "16px", lineHeight: 1.7 }}>
            Have a question, idea, or just want to say hello? We'd love to hear from you.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>

          {/* CONTACT FORM */}
          <div style={{ gridColumn: "span 2" }}>
            {sent ? (
              <div style={{ textAlign: "center", padding: "60px 40px", backgroundColor: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: "20px" }}>
                <FiSend style={{ color: "#a78bfa", fontSize: "40px", marginBottom: "16px" }} />
                <h2 style={{ color: "white", fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>Message sent!</h2>
                <p style={{ color: "#9ca3af", fontSize: "14px" }}>Thanks for reaching out. We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "40px", display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ color: "#9ca3af", fontSize: "13px", fontWeight: 500, marginBottom: "8px", display: "block" }}>Name</label>
                    <input type="text" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      style={{ width: "100%", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px 16px", color: "white", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ color: "#9ca3af", fontSize: "13px", fontWeight: 500, marginBottom: "8px", display: "block" }}>Email</label>
                    <input type="email" placeholder="your@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      style={{ width: "100%", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px 16px", color: "white", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
                  </div>
                </div>
                <div>
                  <label style={{ color: "#9ca3af", fontSize: "13px", fontWeight: 500, marginBottom: "8px", display: "block" }}>Message</label>
                  <textarea placeholder="Tell us what's on your mind..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={6}
                    style={{ width: "100%", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px 16px", color: "white", fontSize: "14px", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
                </div>
                <button type="submit"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", backgroundColor: "#7c3aed", color: "white", padding: "14px", borderRadius: "12px", border: "none", fontWeight: 600, fontSize: "15px", cursor: "pointer" }}>
                  <FiSend />
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* CONTACT INFO */}
          <div style={{ gridColumn: "span 2", display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {[
              { icon: FiMail, label: "Email", value: "hello@decode.com", href: "mailto:hello@decode.com" },
              { icon: FaXTwitter, label: "Twitter / X", value: "@decode", href: "https://twitter.com/yourhandle" },
              { icon: FiGithub, label: "GitHub", value: "github.com/decode", href: "https://github.com/yourhandle" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer"
                  style={{ flex: 1, minWidth: "180px", display: "flex", alignItems: "center", gap: "14px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "20px", textDecoration: "none", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.border = "1px solid rgba(139,92,246,0.3)"; e.currentTarget.style.backgroundColor = "rgba(139,92,246,0.05)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.07)"; e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)"; }}
                >
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#a78bfa", fontSize: "18px", flexShrink: 0 }}>
                    <Icon />
                  </div>
                  <div>
                    <p style={{ color: "#6b7280", fontSize: "12px", marginBottom: "2px" }}>{item.label}</p>
                    <p style={{ color: "white", fontSize: "14px", fontWeight: 500 }}>{item.value}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}