"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebaseClient";
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FiEdit, FiBookmark, FiFileText, FiClock, FiTag, FiCheck, FiX, FiBook } from "react-icons/fi";

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

const difficultyColors = {
  beginner: { bg: "rgba(34, 197, 94, 0.1)", border: "rgba(34, 197, 94, 0.2)", text: "#4ade80" },
  intermediate: { bg: "rgba(251, 191, 36, 0.1)", border: "rgba(251, 191, 36, 0.2)", text: "#fbbf24" },
  advanced: { bg: "rgba(239, 68, 68, 0.1)", border: "rgba(239, 68, 68, 0.2)", text: "#f87171" },
};

export default function ProfilePage() {
  const { userId } = useParams();
  const { data: session } = useSession();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [loading, setLoading] = useState(true);
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState("");
  const [savingBio, setSavingBio] = useState(false);

  const isOwner = session?.user?.id === userId;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUser(userData);
          setBioText(userData.bio || "");
        }

        // Fetch posts
        const postsQ = query(collection(db, "posts"), where("authorId", "==", userId));
        const postsSnap = await getDocs(postsQ);
        setPosts(postsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        // Fetch courses
        const coursesQ = query(collection(db, "courses"), where("authorId", "==", userId));
        const coursesSnap = await getDocs(coursesQ);
        setCourses(coursesSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        // Fetch bookmarks if owner
        if (session?.user?.id === userId) {
          const bookmarksQ = query(collection(db, "posts"), where("bookmarkedBy", "array-contains", userId));
          const bookmarksSnap = await getDocs(bookmarksQ);
          setBookmarks(bookmarksSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchData();
  }, [userId, session]);

  const handleSaveBio = async () => {
    setSavingBio(true);
    try {
      await updateDoc(doc(db, "users", userId), { bio: bioText });
      setUser((prev) => ({ ...prev, bio: bioText }));
      setEditingBio(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingBio(false);
    }
  };

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "#080412", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#9ca3af" }}>Loading...</div>
      </main>
    );
  }

  if (!user) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "#080412", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "white" }}>User not found</div>
      </main>
    );
  }

  const tabs = [
    { id: "posts", label: "Posts", icon: FiFileText, count: posts.length },
    { id: "courses", label: "Courses", icon: FiBook, count: courses.length },
    ...(isOwner ? [{ id: "bookmarks", label: "Bookmarks", icon: FiBookmark, count: bookmarks.length }] : []),
  ];

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#080412", padding: "40px 24px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* PROFILE HEADER */}
        <div style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "40px", marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "24px", flexWrap: "wrap" }}>
            <img src={user.image || "/default-avatar.png"} alt={user.name}
              style={{ width: "80px", height: "80px", borderRadius: "50%", border: "3px solid rgba(139,92,246,0.4)", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <h1 style={{ color: "white", fontSize: "28px", fontWeight: 700, marginBottom: "12px" }}>{user.name}</h1>

              {/* BIO */}
              {editingBio ? (
                <div style={{ marginBottom: "12px" }}>
                  <textarea value={bioText} onChange={(e) => setBioText(e.target.value)} placeholder="Write a short bio..." rows={3}
                    style={{ width: "100%", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "10px", padding: "10px 14px", color: "white", fontSize: "14px", outline: "none", resize: "vertical", boxSizing: "border-box", marginBottom: "10px" }} />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={handleSaveBio} disabled={savingBio}
                      style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#7c3aed", color: "white", padding: "8px 16px", borderRadius: "8px", border: "none", fontWeight: 500, fontSize: "13px", cursor: "pointer" }}>
                      <FiCheck />
                      {savingBio ? "Saving..." : "Save"}
                    </button>
                    <button onClick={() => { setEditingBio(false); setBioText(user.bio || ""); }}
                      style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#9ca3af", padding: "8px 16px", borderRadius: "8px", fontWeight: 500, fontSize: "13px", cursor: "pointer" }}>
                      <FiX />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <p style={{ color: "#9ca3af", fontSize: "14px" }}>{user.bio || "No bio yet."}</p>
                  {isOwner && (
                    <button onClick={() => setEditingBio(true)}
                      style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: "14px", padding: "2px" }}>
                      <FiEdit />
                    </button>
                  )}
                </div>
              )}

              <div style={{ display: "flex", gap: "20px" }}>
                <span style={{ color: "#a78bfa", fontSize: "13px", fontWeight: 500 }}>{posts.length} posts</span>
                <span style={{ color: "#a78bfa", fontSize: "13px", fontWeight: 500 }}>{courses.length} courses</span>
              </div>
            </div>

            {isOwner && (
              <Link href="/write"
                style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#7c3aed", color: "white", padding: "10px 20px", borderRadius: "10px", textDecoration: "none", fontSize: "14px", fontWeight: 600 }}>
                <FiEdit />
                Write Post
              </Link>
            )}
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "32px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "4px", width: "fit-content" }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 20px", borderRadius: "8px", border: "none", backgroundColor: activeTab === tab.id ? "#7c3aed" : "transparent", color: activeTab === tab.id ? "white" : "#9ca3af", fontSize: "14px", fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }}>
                <Icon style={{ fontSize: "14px" }} />
                {tab.label}
                <span style={{ backgroundColor: activeTab === tab.id ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)", borderRadius: "100px", padding: "1px 7px", fontSize: "11px" }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* POSTS TAB */}
        {activeTab === "posts" && (
          posts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#6b7280" }}>
              <p style={{ fontSize: "16px" }}>No posts yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
                  <div style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "24px", transition: "all 0.2s", cursor: "pointer" }}
                    onMouseEnter={(e) => { e.currentTarget.style.border = "1px solid rgba(139,92,246,0.3)"; e.currentTarget.style.backgroundColor = "rgba(139,92,246,0.05)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.07)"; e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)"; }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                      <div style={{ flex: 1 }}>
                        {post.category && (
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(139,92,246,0.1)", color: "#a78bfa", padding: "3px 10px", borderRadius: "100px", fontSize: "11px", fontWeight: 500, marginBottom: "10px" }}>
                            <FiTag style={{ fontSize: "10px" }} />
                            {post.category}
                          </div>
                        )}
                        <h3 style={{ color: "white", fontSize: "18px", fontWeight: 600, marginBottom: "8px", lineHeight: 1.3 }}>{post.title}</h3>
                        <p style={{ color: "#9ca3af", fontSize: "13px", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.excerpt}</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6b7280", fontSize: "12px", whiteSpace: "nowrap" }}>
                        <FiClock style={{ fontSize: "11px" }} />
                        {timeAgo(post.createdAt)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}

        {/* COURSES TAB */}
        {activeTab === "courses" && (
          courses.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#6b7280" }}>
              <p style={{ fontSize: "16px" }}>No courses yet.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
              {courses.map((course) => {
                const diff = difficultyColors[course.difficulty] || difficultyColors.beginner;
                return (
                  <Link key={course.id} href={`/learn/${course.id}`} style={{ textDecoration: "none" }}>
                    <div style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "24px", transition: "all 0.2s", cursor: "pointer" }}
                      onMouseEnter={(e) => { e.currentTarget.style.border = "1px solid rgba(139,92,246,0.3)"; e.currentTarget.style.backgroundColor = "rgba(139,92,246,0.05)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.07)"; e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)"; }}>
                      <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
                        {course.category && (
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(139,92,246,0.1)", color: "#a78bfa", padding: "3px 10px", borderRadius: "100px", fontSize: "11px", fontWeight: 500 }}>
                            {course.category}
                          </div>
                        )}
                        {course.difficulty && (
                          <div style={{ display: "inline-flex", alignItems: "center", backgroundColor: diff.bg, border: `1px solid ${diff.border}`, color: diff.text, padding: "3px 10px", borderRadius: "100px", fontSize: "11px", fontWeight: 500 }}>
                            {course.difficulty}
                          </div>
                        )}
                      </div>
                      <h3 style={{ color: "white", fontSize: "17px", fontWeight: 600, marginBottom: "8px", lineHeight: 1.3 }}>{course.title}</h3>
                      <p style={{ color: "#9ca3af", fontSize: "13px", lineHeight: 1.6, marginBottom: "16px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{course.description}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6b7280", fontSize: "13px" }}>
                        <FiBook style={{ fontSize: "12px" }} />
                        {course.totalLessons || 0} lessons
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )
        )}

        {/* BOOKMARKS TAB */}
        {activeTab === "bookmarks" && (
          bookmarks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#6b7280" }}>
              <p style={{ fontSize: "16px" }}>No bookmarks yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {bookmarks.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
                  <div style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "24px", transition: "all 0.2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.border = "1px solid rgba(139,92,246,0.3)"; e.currentTarget.style.backgroundColor = "rgba(139,92,246,0.05)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.07)"; e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)"; }}>
                    <h3 style={{ color: "white", fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>{post.title}</h3>
                    <p style={{ color: "#9ca3af", fontSize: "13px", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}
      </div>
    </main>
  );
}