"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebaseClient";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { FiClock, FiUser, FiTag } from "react-icons/fi";

function timeAgo(timestamp) {
  if (!timestamp) return "";
  const now = new Date();
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [categories, setCategories] = useState(["All"]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPosts(data);
        const cats = ["All", ...new Set(data.map((p) => p.category).filter(Boolean))];
        setCategories(cats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const filtered = activeCategory === "All" ? posts : posts.filter((p) => p.category === activeCategory);

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#080412", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        <div style={{ marginBottom: "40px" }}>
          <h1 style={{ fontSize: "clamp(32px, 7vw, 48px)", fontWeight: 800, color: "white", letterSpacing: "-1px", marginBottom: "10px" }}>Blog</h1>
          <p style={{ color: "#9ca3af", fontSize: "15px" }}>Thoughts, ideas, and insights from the Decode community.</p>
        </div>

        {/* CATEGORY FILTER */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "32px" }}>
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              style={{ padding: "7px 16px", borderRadius: "100px", border: "1px solid", borderColor: activeCategory === cat ? "#7c3aed" : "rgba(255,255,255,0.1)", backgroundColor: activeCategory === cat ? "#7c3aed" : "transparent", color: activeCategory === cat ? "white" : "#9ca3af", fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }}>
              {cat}
            </button>
          ))}
        </div>

        {/* POSTS GRID */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", height: "240px" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#6b7280" }}>
            <p style={{ fontSize: "18px", marginBottom: "8px" }}>No posts yet</p>
            <p style={{ fontSize: "14px" }}>Be the first to write something!</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
            {filtered.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
                <div
                  style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "24px", height: "100%", transition: "all 0.3s", cursor: "pointer", boxSizing: "border-box" }}
                  onMouseEnter={(e) => { e.currentTarget.style.border = "1px solid rgba(139,92,246,0.4)"; e.currentTarget.style.backgroundColor = "rgba(139,92,246,0.05)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.07)"; e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  {post.category && (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", color: "#a78bfa", padding: "4px 10px", borderRadius: "100px", fontSize: "11px", fontWeight: 500, marginBottom: "14px" }}>
                      <FiTag style={{ fontSize: "10px" }} />
                      {post.category}
                    </div>
                  )}
                  <h2 style={{ color: "white", fontSize: "18px", fontWeight: 700, marginBottom: "10px", lineHeight: 1.3 }}>{post.title}</h2>
                  <p style={{ color: "#9ca3af", fontSize: "14px", lineHeight: 1.7, marginBottom: "16px", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.excerpt}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <Link href={`/profile/${post.authorId}`} onClick={(e) => e.stopPropagation()}
                      style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6b7280", fontSize: "13px", textDecoration: "none" }}
                      onMouseEnter={(e) => e.currentTarget.style.color = "#a78bfa"}
                      onMouseLeave={(e) => e.currentTarget.style.color = "#6b7280"}>
                      <FiUser style={{ fontSize: "12px" }} />
                      {post.authorName}
                    </Link>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6b7280", fontSize: "13px" }}>
                      <FiClock style={{ fontSize: "12px" }} />
                      {timeAgo(post.createdAt)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}