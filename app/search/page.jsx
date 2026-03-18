"use client";
import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/firebaseClient";
import { collection, query, where, getDocs } from "firebase/firestore";
import Link from "next/link";
import { FiSearch, FiClock, FiUser, FiTag } from "react-icons/fi";

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

function SearchResults() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) return;
    const fetchResults = async () => {
      setLoading(true);
      setSearched(true);
      try {
        const q = query(
          collection(db, "posts"),
          where("titleKeywords", "array-contains", searchQuery.toLowerCase().trim())
        );
        const snap = await getDocs(q);
        setResults(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [searchQuery]);

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ color: "white", fontSize: "36px", fontWeight: 800, letterSpacing: "-1px", marginBottom: "8px" }}>Search</h1>
        {searchQuery && (
          <p style={{ color: "#9ca3af", fontSize: "15px" }}>
            {loading ? "Searching..." : `${results.length} result${results.length !== 1 ? "s" : ""} for `}
            {!loading && <span style={{ color: "#a78bfa", fontWeight: 600 }}>"{searchQuery}"</span>}
          </p>
        )}
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", height: "120px" }} />
          ))}
        </div>
      ) : !searched ? (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <FiSearch style={{ color: "#4b5563", fontSize: "48px", marginBottom: "16px" }} />
          <p style={{ color: "#6b7280", fontSize: "16px" }}>Type something to search posts</p>
        </div>
      ) : results.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <FiSearch style={{ color: "#4b5563", fontSize: "48px", marginBottom: "16px" }} />
          <p style={{ color: "white", fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>No results found</p>
          <p style={{ color: "#6b7280", fontSize: "14px" }}>Try searching with different keywords</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {results.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
              <div
                style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "24px", transition: "all 0.2s", cursor: "pointer" }}
                onMouseEnter={(e) => { e.currentTarget.style.border = "1px solid rgba(139,92,246,0.3)"; e.currentTarget.style.backgroundColor = "rgba(139,92,246,0.05)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.07)"; e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)"; }}
              >
                {post.category && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(139,92,246,0.1)", color: "#a78bfa", padding: "3px 10px", borderRadius: "100px", fontSize: "11px", fontWeight: 500, marginBottom: "10px" }}>
                    <FiTag style={{ fontSize: "10px" }} />
                    {post.category}
                  </div>
                )}
                <h2 style={{ color: "white", fontSize: "20px", fontWeight: 700, marginBottom: "8px", lineHeight: 1.3 }}>{post.title}</h2>
                <p style={{ color: "#9ca3af", fontSize: "14px", lineHeight: 1.6, marginBottom: "16px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.excerpt}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6b7280", fontSize: "13px" }}>
                    <FiUser style={{ fontSize: "12px" }} />
                    {post.authorName}
                  </div>
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
  );
}

export default function SearchPage() {
  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#080412", padding: "40px 24px" }}>
      <Suspense fallback={
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h1 style={{ color: "white", fontSize: "36px", fontWeight: 800, marginBottom: "40px" }}>Search</h1>
          <div style={{ textAlign: "center", padding: "80px 0", color: "#6b7280" }}>Loading...</div>
        </div>
      }>
        <SearchResults />
      </Suspense>
    </main>
  );
}