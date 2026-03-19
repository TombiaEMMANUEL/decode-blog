"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseClient";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import Link from "next/link";
import { FiBook, FiCode, FiPenTool, FiTrendingUp, FiZap, FiUser, FiLayers } from "react-icons/fi";

const difficultyColors = {
  beginner: { bg: "rgba(34, 197, 94, 0.1)", border: "rgba(34, 197, 94, 0.2)", text: "#4ade80" },
  intermediate: { bg: "rgba(251, 191, 36, 0.1)", border: "rgba(251, 191, 36, 0.2)", text: "#fbbf24" },
  advanced: { bg: "rgba(239, 68, 68, 0.1)", border: "rgba(239, 68, 68, 0.2)", text: "#f87171" },
};

const categoryConfig = {
  programming: { icon: FiCode, color: "#8b5cf6", bg: "#1e1b4b", pattern: "60deg" },
  design: { icon: FiPenTool, color: "#06b6d4", bg: "#0c2340", pattern: "120deg" },
  business: { icon: FiTrendingUp, color: "#10b981", bg: "#052e16", pattern: "45deg" },
  technology: { icon: FiZap, color: "#f59e0b", bg: "#1c1407", pattern: "90deg" },
  default: { icon: FiLayers, color: "#a78bfa", bg: "#1a0e2e", pattern: "135deg" },
};

function CourseCover({ category, title }) {
  const key = (category || "").toLowerCase();
  const config = categoryConfig[key] || categoryConfig.default;
  const Icon = config.icon;

  return (
    <div style={{
      width: "100%",
      height: "160px",
      borderRadius: "10px",
      overflow: "hidden",
      marginBottom: "20px",
      position: "relative",
      backgroundColor: config.bg,
    }}>
      {/* GRID PATTERN */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `linear-gradient(${config.pattern}, ${config.color}15 1px, transparent 1px), linear-gradient(${config.pattern}, ${config.color}15 1px, transparent 1px)`,
        backgroundSize: "20px 20px",
      }} />

      {/* DOTS */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `radial-gradient(${config.color}30 1px, transparent 1px)`,
        backgroundSize: "30px 30px",
      }} />

      {/* GLOW */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "120px",
        height: "120px",
        borderRadius: "50%",
        background: `radial-gradient(circle, ${config.color}25 0%, transparent 70%)`,
      }} />

      {/* ICON */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "56px",
        height: "56px",
        borderRadius: "14px",
        backgroundColor: `${config.color}20`,
        border: `1px solid ${config.color}40`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: config.color,
        fontSize: "24px",
      }}>
        <Icon />
      </div>

      {/* CATEGORY LABEL */}
      <div style={{
        position: "absolute",
        bottom: "10px",
        left: "14px",
        color: `${config.color}cc`,
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "1.5px",
        textTransform: "uppercase",
      }}>
        {category || "Course"}
      </div>
    </div>
  );
}

export default function LearnPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [categories, setCategories] = useState(["All"]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const q = query(collection(db, "courses"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setCourses(data);
        const cats = ["All", ...new Set(data.map((c) => c.category).filter(Boolean))];
        setCategories(cats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filtered = activeCategory === "All" ? courses : courses.filter((c) => c.category === activeCategory);

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#080412", padding: "40px 24px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* HEADER */}
        <div style={{ marginBottom: "48px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(139, 92, 246, 0.1)", border: "1px solid rgba(139, 92, 246, 0.3)", borderRadius: "100px", padding: "6px 16px", marginBottom: "16px", color: "#a78bfa", fontSize: "13px", fontWeight: 500 }}>
            <FiZap style={{ fontSize: "12px" }} />
            Start Learning
          </div>
          <h1 style={{ fontSize: "48px", fontWeight: 800, color: "white", letterSpacing: "-1px", marginBottom: "12px" }}>Courses</h1>
          <p style={{ color: "#9ca3af", fontSize: "16px", maxWidth: "500px" }}>
            Structured learning paths to help you grow your skills from beginner to advanced.
          </p>
        </div>

        {/* CATEGORY FILTER */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "40px" }}>
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              style={{ padding: "8px 20px", borderRadius: "100px", border: "1px solid", borderColor: activeCategory === cat ? "#7c3aed" : "rgba(255,255,255,0.1)", backgroundColor: activeCategory === cat ? "#7c3aed" : "transparent", color: activeCategory === cat ? "white" : "#9ca3af", fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }}>
              {cat}
            </button>
          ))}
        </div>

        {/* COURSES GRID */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", height: "320px" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <FiBook style={{ color: "#4b5563", fontSize: "48px", marginBottom: "16px" }} />
            <p style={{ color: "white", fontSize: "20px", fontWeight: 600, marginBottom: "8px" }}>No courses yet</p>
            <p style={{ color: "#6b7280", fontSize: "14px" }}>Check back soon — courses are coming!</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
            {filtered.map((course) => {
              const diff = difficultyColors[course.difficulty] || difficultyColors.beginner;
              return (
                <div key={course.id}
                  style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "28px", transition: "all 0.3s", cursor: "pointer" }}
                  onMouseEnter={(e) => { e.currentTarget.style.border = "1px solid rgba(139,92,246,0.4)"; e.currentTarget.style.backgroundColor = "rgba(139,92,246,0.05)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.07)"; e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  {/* COVER */}
                  <Link href={`/learn/${course.id}`} style={{ textDecoration: "none" }}>
                    <CourseCover category={course.category} title={course.title} />
                  </Link>

                  {/* BADGES */}
                  <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
                    {course.difficulty && (
                      <div style={{ display: "inline-flex", alignItems: "center", backgroundColor: diff.bg, border: `1px solid ${diff.border}`, color: diff.text, padding: "3px 10px", borderRadius: "100px", fontSize: "11px", fontWeight: 500 }}>
                        {course.difficulty}
                      </div>
                    )}
                  </div>

                  <Link href={`/learn/${course.id}`} style={{ textDecoration: "none" }}>
                    <h2 style={{ color: "white", fontSize: "20px", fontWeight: 700, marginBottom: "10px", lineHeight: 1.3 }}>{course.title}</h2>
                    <p style={{ color: "#9ca3af", fontSize: "14px", lineHeight: 1.6, marginBottom: "20px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{course.description}</p>
                  </Link>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <Link
                      href={`/profile/${course.authorId}`}
                      onClick={(e) => e.stopPropagation()}
                      style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6b7280", fontSize: "13px", textDecoration: "none", transition: "color 0.2s" }}
                      onMouseEnter={(e) => e.currentTarget.style.color = "#a78bfa"}
                      onMouseLeave={(e) => e.currentTarget.style.color = "#6b7280"}
                    >
                      <FiUser style={{ fontSize: "12px" }} />
                      {course.authorName}
                    </Link>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6b7280", fontSize: "13px" }}>
                      <FiBook style={{ fontSize: "12px" }} />
                      {course.totalLessons || 0} lessons
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}