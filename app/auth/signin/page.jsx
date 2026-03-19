"use client";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { FaGoogle } from "react-icons/fa";
import { FiZap } from "react-icons/fi";

export default function SignInPage() {
  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#080412", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", position: "relative", overflow: "hidden" }}>

      {/* BACKGROUND GLOW */}
      <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: "min(500px, 90vw)", height: "min(500px, 90vw)", background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* CARD */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        style={{ width: "100%", maxWidth: "420px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: "24px", padding: "clamp(28px, 6vw, 48px) clamp(20px, 5vw, 40px)", textAlign: "center", position: "relative", zIndex: 1 }}>

        {/* LOGO */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "28px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: "18px" }}>D</div>
          <span style={{ color: "white", fontWeight: 700, fontSize: "22px", letterSpacing: "-0.5px" }}>Decode</span>
        </div>

        {/* HEADING */}
        <h1 style={{ color: "white", fontSize: "clamp(20px, 5vw, 26px)", fontWeight: 700, marginBottom: "8px", letterSpacing: "-0.5px" }}>Welcome back</h1>
        <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "32px", lineHeight: 1.6 }}>
          Sign in to read, write, and learn on Decode.
        </p>

        {/* GOOGLE BUTTON */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => signIn("google", { callbackUrl: "/" })}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", backgroundColor: "white", color: "#1f2937", padding: "14px 24px", borderRadius: "12px", border: "none", fontWeight: 600, fontSize: "15px", cursor: "pointer", marginBottom: "24px" }}>
          <FaGoogle style={{ fontSize: "18px", color: "#ea4335" }} />
          Continue with Google
        </motion.button>

        {/* DIVIDER */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255,255,255,0.08)" }} />
          <span style={{ color: "#6b7280", fontSize: "12px" }}>More options coming soon</span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255,255,255,0.08)" }} />
        </div>

        {/* FEATURES */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", textAlign: "left" }}>
          {[
            "Read and bookmark articles",
            "Enroll in courses and track progress",
            "Write and publish your own posts",
          ].map((feature) => (
            <div key={feature} style={{ display: "flex", alignItems: "center", gap: "10px", color: "#9ca3af", fontSize: "13px" }}>
              <FiZap style={{ color: "#8b5cf6", fontSize: "14px", flexShrink: 0 }} />
              {feature}
            </div>
          ))}
        </div>

        {/* TERMS */}
        <p style={{ color: "#6b7280", fontSize: "11px", marginTop: "24px", lineHeight: 1.6 }}>
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </main>
  );
}