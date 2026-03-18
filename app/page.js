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

      {/* HERO SECTION */}
      <section style={{ position: "relative", minHeight: "90vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px" }}>
        <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "10%", left: "10%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(109, 40, 217, 0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "30%", right: "10%", width: "250px", height: "250px", background: "radial-gradient(circle, rgba(167, 139, 250, 0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} style={{ position: "relative", zIndex: 1, maxWidth: "800px" }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.5 }}
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(139, 92, 246, 0.1)", border: "1px solid rgba(139, 92, 246, 0.3)", borderRadius: "100px", padding: "6px 16px", marginBottom: "32px", color: "#a78bfa", fontSize: "13px", fontWeight: 500 }}>
            <FiZap style={{ fontSize: "12px" }} />
            Learn. Grow. Build.
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }}
            style={{ fontSize: "clamp(40px, 7vw, 80px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-2px", color: "white", marginBottom: "24px" }}>
            Simplifying complexity{" "}
            <span style={{ background: "linear-gradient(135deg, #8b5cf6, #a78bfa, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              one idea
            </span>{" "}
            at a time
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7 }}
            style={{ fontSize: "18px", color: "#9ca3af", lineHeight: 1.7, maxWidth: "560px", margin: "0 auto 40px" }}>
            Decode is where curious minds come to read, learn, and build.
            Explore articles, courses, and ideas that make the complex feel simple.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }}
            style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/blog" style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#7c3aed", color: "white", padding: "14px 28px", borderRadius: "12px", fontWeight: 600, fontSize: "15px", textDecoration: "none" }}>
              <FiBook />
              Start Reading
              <FiArrowRight />
            </Link>
            <Link href="/learn" style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "14px 28px", borderRadius: "12px", fontWeight: 600, fontSize: "15px", textDecoration: "none" }}>
              <FiZap />
              Explore Courses
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* FEATURES SECTION */}
      <section style={{ padding: "80px 24px", maxWidth: "1100px", margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: "60px" }}>
          <h2 style={{ fontSize: "36px", fontWeight: 700, color: "white", marginBottom: "16px" }}>Everything you need to grow</h2>
          <p style={{ color: "#9ca3af", fontSize: "16px", maxWidth: "500px", margin: "0 auto" }}>From quick reads to deep dives — Decode has it all in one place.</p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          {[
            { icon: FiBook, title: "In-depth Articles", description: "Thoughtfully written posts that break down complex topics into clear, actionable insights.", color: "#8b5cf6" },
            { icon: FiZap, title: "Structured Courses", description: "Learn at your own pace with step-by-step courses covering tech, design, and more.", color: "#7c3aed" },
            { icon: FiEdit, title: "Write & Share", description: "Have something to say? Publish your own articles and reach a community of learners.", color: "#6d28d9" },
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }} viewport={{ once: true }}
                style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "32px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: `${feature.color}20`, border: `1px solid ${feature.color}40`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", color: feature.color, fontSize: "20px" }}>
                  <Icon />
                </div>
                <h3 style={{ color: "white", fontWeight: 600, fontSize: "18px", marginBottom: "10px" }}>{feature.title}</h3>
                <p style={{ color: "#9ca3af", fontSize: "14px", lineHeight: 1.7 }}>{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* NEWSLETTER CTA */}
      <section style={{ padding: "80px 24px" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true }}
          style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center", backgroundColor: "rgba(139, 92, 246, 0.05)", border: "1px solid rgba(139, 92, 246, 0.2)", borderRadius: "24px", padding: "60px 40px" }}>
          <h2 style={{ fontSize: "32px", fontWeight: 700, color: "white", marginBottom: "16px" }}>Stay in the loop</h2>
          <p style={{ color: "#9ca3af", marginBottom: "32px", lineHeight: 1.7 }}>
            Get the latest articles and courses delivered straight to your inbox. No spam, ever.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
            {heroSubscribed ? (
              <div style={{ color: "#a78bfa", fontSize: "15px", fontWeight: 500 }}>
                ⚡ You're subscribed! Welcome to Decode.
              </div>
            ) : (
              <>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={heroEmail}
                  onChange={(e) => setHeroEmail(e.target.value)}
                  style={{ flex: 1, minWidth: "220px", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px 16px", color: "white", outline: "none", fontSize: "14px" }}
                />
                <button
                  onClick={handleHeroSubscribe}
                  style={{ backgroundColor: "#7c3aed", color: "white", padding: "12px 24px", borderRadius: "10px", border: "none", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}
                >
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