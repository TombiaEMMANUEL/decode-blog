"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseClient";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import Link from "next/link";
import { FiBook, FiClock, FiTag, FiZap, FiUser } from "react-icons/fi";

const difficultyColors = {
  beginner: { bg: "rgba(34, 197, 94, 0.1)", border: "rgba(34, 197, 94, 0.2)", text: "#4ade80" },
  intermediate: { bg: "rgba(251, 191, 36, 0.1)", border: "rgba(251, 191, 36, 0.2)", text: "#fbbf24" },
  advanced: { bg: "rgba(239, 68, 68, 0.1)", border: "rgba(239, 68, 68, 0.2)", text: "#f87171" },
};

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
              <div key={i} style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", height: "280px" }} />
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
                <Link key={course.id} href={`/learn/${course.id}`} style={{ textDecoration: "none" }}>
                  <div
                    style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "28px", height: "100%", transition: "all 0.3s", cursor: "pointer" }}
                    onMouseEnter={(e) => { e.currentTarget.style.border = "1px solid rgba(139,92,246,0.4)"; e.currentTarget.style.backgroundColor = "rgba(139,92,246,0.05)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.07)"; e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)"; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    {/* COVER */}
                          <div style={{
                            width: "100%",
                            height: "140px",
                            borderRadius: "10px",
                            overflow: "hidden",
                            marginBottom: "20px",
                            background: course.category === "Programming" || course.category === "programming"
                              ? "linear-gradient(135deg, #1e1b4b, #4c1d95)"
                              : course.category === "Design"
                              ? "linear-gradient(135deg, #1e3a5f, #0e7490)"
                              : course.category === "Business"
                              ? "linear-gradient(135deg, #1a2e1a, #166534)"
                              : "linear-gradient(135deg, #2d1b4e, #6d28d9)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative",
                          }}>
                            <FiBook style={{ color: "rgba(255,255,255,0.3)", fontSize: "48px" }} />
                            <div style={{ position: "absolute", bottom: "12px", left: "16px", color: "rgba(255,255,255,0.6)", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>
                              {course.category}
                            </div>
                          </div>

                    {/* BADGES */}
                    <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
                      {course.category && (
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", color: "#a78bfa", padding: "3px 10px", borderRadius: "100px", fontSize: "11px", fontWeight: 500 }}>
                          <FiTag style={{ fontSize: "10px" }} />
                          {course.category}
                        </div>
                      )}
                      {course.difficulty && (
                        <div style={{ display: "inline-flex", alignItems: "center", backgroundColor: diff.bg, border: `1px solid ${diff.border}`, color: diff.text, padding: "3px 10px", borderRadius: "100px", fontSize: "11px", fontWeight: 500 }}>
                          {course.difficulty}
                        </div>
                      )}
                    </div>

                    <h2 style={{ color: "white", fontSize: "20px", fontWeight: 700, marginBottom: "10px", lineHeight: 1.3 }}>{course.title}</h2>
                    <p style={{ color: "#9ca3af", fontSize: "14px", lineHeight: 1.6, marginBottom: "20px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{course.description}</p>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6b7280", fontSize: "13px" }}>
                        <FiUser style={{ fontSize: "12px" }} />
                        {course.authorName}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6b7280", fontSize: "13px" }}>
                        <FiBook style={{ fontSize: "12px" }} />
                        {course.totalLessons || 0} lessons
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}