"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiArrowRight, FiBook, FiEdit, FiZap } from "react-icons/fi";
import { db } from "@/lib/firebaseClient";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function Home() {
  const [heroEmail, setHeroEmail] = useState("");
  const [heroSubscribed, setHeroSubscribed] = useState(false);

  const handleHeroSubscribe = async () => {
    if (!heroEmail.trim()) return;
    try {
      await addDoc(collection(db, "newsletter"), {
        email: heroEmail.trim(),
        subscribedAt: serverTimestamp(),
      });
      setHeroSubscribed(true);
      setHeroEmail("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#080412", overflow: "hidden" }}>

      {/* HERO */}
      <section style={{ position: "relative", minHeight: "90vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 20px" }}>
        <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: "min(600px, 90vw)", height: "min(600px, 90vw)", background: "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)", pointerEvents: "none" }} />

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ position: "relative", zIndex: 1, maxWidth: "800px", width: "100%" }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.5 }}
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(139, 92, 246, 0.1)", border: "1px solid rgba(139, 92, 246, 0.3)", borderRadius: "100px", padding: "6px 16px", marginBottom: "24px", color: "#a78bfa", fontSize: "13px", fontWeight: 500 }}>
            <FiZap style={{ fontSize: "12px" }} />
            Learn. Grow. Build.
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }}
            style={{ fontSize: "clamp(32px, 8vw, 80px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-2px", color: "white", marginBottom: "20px" }}>
            Simplifying complexity{" "}
            <span style={{ background: "linear-gradient(135deg, #8b5cf6, #a78bfa, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              one idea
            </span>{" "}
            at a time
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7 }}
            style={{ fontSize: "clamp(15px, 3vw, 18px)", color: "#9ca3af", lineHeight: 1.7, maxWidth: "560px", margin: "0 auto 32px" }}>
            Decode is where curious minds come to read, learn, and build.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }}
            style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", padding: "0 16px" }}>
            <Link href="/blog" style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#7c3aed", color: "white", padding: "12px 24px", borderRadius: "12px", fontWeight: 600, fontSize: "15px", textDecoration: "none" }}>
              <FiBook />
              Start Reading
              <FiArrowRight />
            </Link>
            <Link href="/learn" style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "12px 24px", borderRadius: "12px", fontWeight: 600, fontSize: "15px", textDecoration: "none" }}>
              <FiZap />
              Explore Courses
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: "60px 20px", maxWidth: "1100px", margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2 style={{ fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 700, color: "white", marginBottom: "12px" }}>Everything you need to grow</h2>
          <p style={{ color: "#9ca3af", fontSize: "15px", maxWidth: "500px", margin: "0 auto" }}>From quick reads to deep dives — Decode has it all.</p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
          {[
            { icon: FiBook, title: "In-depth Articles", description: "Thoughtfully written posts that break down complex topics into clear insights.", color: "#8b5cf6" },
            { icon: FiZap, title: "Structured Courses", description: "Learn at your own pace with step-by-step courses covering tech, design, and more.", color: "#7c3aed" },
            { icon: FiEdit, title: "Write & Share", description: "Have something to say? Publish your own articles and reach a community of learners.", color: "#6d28d9" },
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }} viewport={{ once: true }}
                style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "28px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "10px", backgroundColor: `${feature.color}20`, border: `1px solid ${feature.color}40`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px", color: feature.color, fontSize: "18px" }}>
                  <Icon />
                </div>
                <h3 style={{ color: "white", fontWeight: 600, fontSize: "17px", marginBottom: "8px" }}>{feature.title}</h3>
                <p style={{ color: "#9ca3af", fontSize: "14px", lineHeight: 1.7 }}>{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section style={{ padding: "60px 20px" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true }}
          style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center", backgroundColor: "rgba(139, 92, 246, 0.05)", border: "1px solid rgba(139, 92, 246, 0.2)", borderRadius: "24px", padding: "48px 24px" }}>
          <h2 style={{ fontSize: "clamp(22px, 5vw, 32px)", fontWeight: 700, color: "white", marginBottom: "12px" }}>Stay in the loop</h2>
          <p style={{ color: "#9ca3af", marginBottom: "28px", lineHeight: 1.7, fontSize: "15px" }}>
            Get the latest articles and courses delivered straight to your inbox.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
            {heroSubscribed ? (
              <div style={{ color: "#a78bfa", fontSize: "15px", fontWeight: 500 }}>⚡ You're subscribed! Welcome to Decode.</div>
            ) : (
              <>
                <input type="email" placeholder="Enter your email" value={heroEmail} onChange={(e) => setHeroEmail(e.target.value)}
                  style={{ flex: 1, minWidth: "200px", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px 16px", color: "white", outline: "none", fontSize: "14px" }} />
                <button onClick={handleHeroSubscribe}
                  style={{ backgroundColor: "#7c3aed", color: "white", padding: "12px 24px", borderRadius: "10px", border: "none", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}>
                  Subscribe
                </button>
              </>
            )}
          </div>
        </motion.div>
      </section>
    </main>
  );
}