"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { FaGithub, FaEnvelope } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FiArrowRight, FiZap } from "react-icons/fi";
import { db } from "@/lib/firebaseClient";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "Blog", href: "/blog" },
  { name: "Learn", href: "/learn" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

const socialLinks = [
  { Icon: FaXTwitter, href: "https://twitter.com/yourhandle", label: "X" },
  { Icon: FaGithub, href: "https://github.com/yourhandle", label: "GitHub" },
  { Icon: FaEnvelope, href: "mailto:hello@decode.com", label: "Email" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      await addDoc(collection(db, "newsletter"), {
        email: email.trim(),
        subscribedAt: serverTimestamp(),
      });
      setSubscribed(true);
      setEmail("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <footer style={{ position: "relative", backgroundColor: "#080412", borderTop: "1px solid rgba(139,92,246,0.2)", marginTop: "80px", overflow: "hidden" }}>
      <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "600px", height: "300px", background: "radial-gradient(ellipse, rgba(139,92,246,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px)`, backgroundSize: "40px 40px", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "1100px", margin: "0 auto", padding: "48px 20px 0" }}>

        {/* TOP SECTION - stacks on mobile */}
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "40px", marginBottom: "48px" }}>

          {/* BRAND */}
          <div style={{ flex: isMobile ? "unset" : 1 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", marginBottom: "16px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: "16px" }}>D</div>
              <span style={{ color: "white", fontWeight: 700, fontSize: "20px" }}>Decode</span>
            </Link>
            <p style={{ color: "#6b7280", fontSize: "14px", lineHeight: 1.7, marginBottom: "20px", maxWidth: "280px" }}>
              Simplifying complexity — one idea at a time.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              {socialLinks.map((item) => {
                const Icon = item.Icon;
                return (
                  <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" aria-label={item.label}
                    style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "16px", textDecoration: "none" }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(139,92,246,0.15)"; e.currentTarget.style.color = "#a78bfa"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#9ca3af"; }}>
                    <Icon />
                  </a>
                );
              })}
            </div>
          </div>

          {/* QUICK LINKS */}
          <div style={{ flex: isMobile ? "unset" : 1 }}>
            <h3 style={{ color: "white", fontSize: "14px", fontWeight: 600, marginBottom: "16px", letterSpacing: "0.5px", textTransform: "uppercase" }}>Navigation</h3>
            <div style={{ display: "flex", flexDirection: isMobile ? "row" : "column", flexWrap: "wrap", gap: isMobile ? "8px 20px" : "10px" }}>
              {quickLinks.map((link) => (
                <Link key={link.name} href={link.href}
                  style={{ color: "#6b7280", fontSize: "14px", textDecoration: "none" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#a78bfa"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "#6b7280"}>
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* NEWSLETTER */}
          <div style={{ flex: isMobile ? "unset" : 2 }}>
            <div style={{ backgroundColor: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: "16px", padding: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <FiZap style={{ color: "#a78bfa", fontSize: "16px" }} />
                <h3 style={{ color: "white", fontSize: "17px", fontWeight: 700 }}>Stay in the loop</h3>
              </div>
              <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "16px", lineHeight: 1.6 }}>
                Get the latest articles and courses. No spam, ever.
              </p>
              {subscribed ? (
                <div style={{ color: "#a78bfa", fontSize: "14px", fontWeight: 500 }}>⚡ You're subscribed! Welcome to Decode.</div>
              ) : (
                <form onSubmit={handleSubscribe} style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "10px" }}>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email"
                    style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px 16px", color: "white", fontSize: "14px", outline: "none" }} />
                  <button type="submit" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", backgroundColor: "#7c3aed", color: "white", padding: "12px 20px", borderRadius: "10px", border: "none", fontWeight: 600, fontSize: "14px", cursor: "pointer", whiteSpace: "nowrap" }}>
                    Subscribe <FiArrowRight />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "20px 0", display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", gap: "12px" }}>
          <p style={{ color: "#4b5563", fontSize: "13px" }}>&copy; {new Date().getFullYear()} Decode. All rights reserved.</p>
          <div style={{ display: "flex", gap: "20px" }}>
            {["Privacy Policy", "Terms of Service"].map((item) => (
              <Link key={item} href="#" style={{ color: "#4b5563", fontSize: "13px", textDecoration: "none" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#9ca3af"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#4b5563"}>
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}