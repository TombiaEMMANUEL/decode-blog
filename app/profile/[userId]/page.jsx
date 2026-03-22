"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebaseClient";
import { collection, query, where, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
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
  beginner: { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.2)", text: "#4ade80" },
  intermediate: { bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.2)", text: "#fbbf24" },
  advanced: { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.2)", text: "#f87171" },
};

export default function ProfilePage() {
  const { userId } = useParams();
  const { data: session } = useSession();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followModalTab, setFollowModalTab] = useState("followers");  
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
            setFollowerCount(userData.followers?.length || 0);
           try {
                const followersIds = userData.followers || [];
                const followerProfiles = [];
                for (const fid of followersIds) {
                  const fSnap = await getDoc(doc(db, "users", fid));
                  if (fSnap.exists()) followerProfiles.push({ id: fid, ...fSnap.data() });
                }
                setFollowers(followerProfiles);
              } catch (err) {
                console.error("Followers error:", err);
              }

            if (session?.user?.id) {
              const mySnap = await getDoc(doc(db, "users", session.user.id));
              if (mySnap.exists()) {
                const followingIds = mySnap.data().followers || [];
                const followingProfiles = [];
                for (const fid of followingIds) {
                  const fSnap = await getDoc(doc(db, "users", fid));
                  if (fSnap.exists()) followingProfiles.push({ id: fid, ...fSnap.data() });
                }
                setFollowing(followingProfiles);
              }
            }
          if (session?.user?.id && userData.followers?.includes(session.user.id)) {
            setIsFollowing(true);
          }
          setBioText(userData.bio || "");
        }
        const postsQ = query(collection(db, "posts"), where("authorId", "==", userId));
        const postsSnap = await getDocs(postsQ);
        setPosts(postsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        const coursesQ = query(collection(db, "courses"), where("authorId", "==", userId));
        const coursesSnap = await getDocs(coursesQ);
        setCourses(coursesSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

       if (session?.user?.id === userId) {
            try {
              const bookmarksQ = query(collection(db, "posts"), where("bookmarkedBy", "array-contains", userId));
              const bookmarksSnap = await getDocs(bookmarksQ);
              setBookmarks(bookmarksSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
            } catch (err) {
              console.error("Bookmarks error:", err);
            }
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

const handleFollow = async () => {
  if (!session) return;
  const userRef = doc(db, "users", userId);
  if (isFollowing) {
    await updateDoc(userRef, { followers: arrayRemove(session.user.id) });
    setIsFollowing(false);
    setFollowerCount((c) => c - 1);
  } else {
    await updateDoc(userRef, { followers: arrayUnion(session.user.id) });
    setIsFollowing(true);
    setFollowerCount((c) => c + 1);
    // Send follow notification
    const { addDoc, collection, serverTimestamp } = await import("firebase/firestore");
    await addDoc(collection(db, "notifications"), {
      userId: userId,
      type: "follow",
      message: `${session.user.name} started following you`,
      postSlug: "",
      fromUser: session.user.name,
      fromImage: session.user.image,
      read: false,
      createdAt: serverTimestamp(),
    });
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

  const activePosts = activeTab === "posts" ? posts : activeTab === "courses" ? courses : bookmarks;

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#080412", padding: "40px 20px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* PROFILE HEADER */}
        <div style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "28px 24px", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "20px", flexWrap: "wrap" }}>
            <img src={user.image || "/default-avatar.png"} alt={user.name}
              style={{ width: "72px", height: "72px", borderRadius: "50%", border: "3px solid rgba(139,92,246,0.4)", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: "200px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "8px" }}>
                <h1 style={{ color: "white", fontSize: "clamp(20px, 5vw, 28px)", fontWeight: 700 }}>{user.name}</h1>
                {isOwner && (
                  <Link href="/write" style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#7c3aed", color: "white", padding: "8px 16px", borderRadius: "10px", textDecoration: "none", fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap" }}>
                    <FiEdit style={{ fontSize: "12px" }} />
                    Write Post
                  </Link>
                )}
              </div>

              {editingBio ? (
                <div style={{ marginBottom: "12px" }}>
                  <textarea value={bioText} onChange={(e) => setBioText(e.target.value)} placeholder="Write a short bio..." rows={3}
                    style={{ width: "100%", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "10px", padding: "10px 14px", color: "white", fontSize: "14px", outline: "none", resize: "vertical", boxSizing: "border-box", marginBottom: "10px" }} />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={handleSaveBio} disabled={savingBio}
                      style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#7c3aed", color: "white", padding: "8px 16px", borderRadius: "8px", border: "none", fontWeight: 500, fontSize: "13px", cursor: "pointer" }}>
                      <FiCheck />{savingBio ? "Saving..." : "Save"}
                    </button>
                    <button onClick={() => { setEditingBio(false); setBioText(user.bio || ""); }}
                      style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#9ca3af", padding: "8px 16px", borderRadius: "8px", fontSize: "13px", cursor: "pointer" }}>
                      <FiX />Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <p style={{ color: "#9ca3af", fontSize: "14px" }}>{user.bio || "No bio yet."}</p>
                  {isOwner && (
                    <button onClick={() => setEditingBio(true)} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: "14px", padding: "2px" }}>
                      <FiEdit />
                    </button>
                  )}
                </div>
              )}

              <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ color: "#a78bfa", fontSize: "13px", fontWeight: 500 }}>{posts.length} posts</span>
                <span style={{ color: "#a78bfa", fontSize: "13px", fontWeight: 500 }}>{courses.length} courses</span>
                <button onClick={() => { setShowFollowModal(true); setFollowModalTab("followers"); }}
                    style={{ background: "none", border: "none", color: "#a78bfa", fontSize: "13px", fontWeight: 500, cursor: "pointer", padding: 0 }}>
                    {followerCount} followers
                  </button>
                {!isOwner && session && (
                  <button onClick={handleFollow}
                    style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: isFollowing ? "transparent" : "#7c3aed", border: isFollowing ? "1px solid rgba(255,255,255,0.2)" : "none", color: isFollowing ? "#9ca3af" : "white", padding: "6px 16px", borderRadius: "100px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                    {isFollowing ? "Following ✓" : "Follow"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "24px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "4px", overflowX: "auto" }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "8px", border: "none", backgroundColor: activeTab === tab.id ? "#7c3aed" : "transparent", color: activeTab === tab.id ? "white" : "#9ca3af", fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap", flexShrink: 0 }}>
                <Icon style={{ fontSize: "13px" }} />
                {tab.label}
                <span style={{ backgroundColor: activeTab === tab.id ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)", borderRadius: "100px", padding: "1px 6px", fontSize: "11px" }}>
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
                  <div style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "20px", transition: "all 0.2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.border = "1px solid rgba(139,92,246,0.3)"; e.currentTarget.style.backgroundColor = "rgba(139,92,246,0.05)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.07)"; e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)"; }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {post.category && (
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(139,92,246,0.1)", color: "#a78bfa", padding: "3px 10px", borderRadius: "100px", fontSize: "11px", fontWeight: 500, marginBottom: "8px" }}>
                            <FiTag style={{ fontSize: "10px" }} />
                            {post.category}
                          </div>
                        )}
                        <h3 style={{ color: "white", fontSize: "16px", fontWeight: 600, marginBottom: "6px", lineHeight: 1.3 }}>{post.title}</h3>
                        <p style={{ color: "#9ca3af", fontSize: "13px", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.excerpt}</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#6b7280", fontSize: "12px", whiteSpace: "nowrap", flexShrink: 0 }}>
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
              {courses.map((course) => {
                const diff = difficultyColors[course.difficulty] || difficultyColors.beginner;
                return (
                  <Link key={course.id} href={`/learn/${course.id}`} style={{ textDecoration: "none" }}>
                    <div style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "20px", transition: "all 0.2s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.border = "1px solid rgba(139,92,246,0.3)"; e.currentTarget.style.backgroundColor = "rgba(139,92,246,0.05)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.07)"; e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)"; }}>
                      <div style={{ display: "flex", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }}>
                        {course.category && (
                          <div style={{ display: "inline-flex", alignItems: "center", backgroundColor: "rgba(139,92,246,0.1)", color: "#a78bfa", padding: "3px 10px", borderRadius: "100px", fontSize: "11px", fontWeight: 500 }}>
                            {course.category}
                          </div>
                        )}
                        {course.difficulty && (
                          <div style={{ backgroundColor: diff.bg, border: `1px solid ${diff.border}`, color: diff.text, padding: "3px 10px", borderRadius: "100px", fontSize: "11px", fontWeight: 500 }}>
                            {course.difficulty}
                          </div>
                        )}
                      </div>
                      <h3 style={{ color: "white", fontSize: "16px", fontWeight: 600, marginBottom: "6px", lineHeight: 1.3 }}>{course.title}</h3>
                      <p style={{ color: "#9ca3af", fontSize: "13px", lineHeight: 1.6, marginBottom: "12px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{course.description}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6b7280", fontSize: "12px" }}>
                        <FiBook style={{ fontSize: "11px" }} />
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
                  <div style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "20px", transition: "all 0.2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.border = "1px solid rgba(139,92,246,0.3)"; e.currentTarget.style.backgroundColor = "rgba(139,92,246,0.05)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.07)"; e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)"; }}>
                    <h3 style={{ color: "white", fontSize: "16px", fontWeight: 600, marginBottom: "6px" }}>{post.title}</h3>
                    <p style={{ color: "#9ca3af", fontSize: "13px", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}

      </div>

      {showFollowModal && (
          <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
            onClick={() => setShowFollowModal(false)}>
            <div style={{ backgroundColor: "#0f0a1e", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "20px", width: "100%", maxWidth: "400px", maxHeight: "80vh", overflow: "hidden", display: "flex", flexDirection: "column" }}
              onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {["followers", "following"].map((tab) => (
                  <button key={tab} onClick={() => setFollowModalTab(tab)}
                    style={{ flex: 1, padding: "16px", background: "none", border: "none", borderBottom: followModalTab === tab ? "2px solid #7c3aed" : "2px solid transparent", color: followModalTab === tab ? "white" : "#6b7280", fontSize: "14px", fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>
                    {tab === "followers" ? `${followerCount} Followers` : `${following.length} Following`}
                  </button>
                ))}
                <button onClick={() => setShowFollowModal(false)}
                  style={{ padding: "16px", background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: "18px" }}>
                  ✕
                </button>
              </div>
              <div style={{ overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {(followModalTab === "followers" ? followers : following).length === 0 ? (
                  <p style={{ color: "#6b7280", fontSize: "14px", textAlign: "center", padding: "32px 0" }}>
                    {followModalTab === "followers" ? "No followers yet" : "Not following anyone yet"}
                  </p>
                ) : (
                  (followModalTab === "followers" ? followers : following).map((user) => (
                    <Link key={user.id} href={`/profile/${user.id}`} onClick={() => setShowFollowModal(false)} style={{ textDecoration: "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "12px", transition: "all 0.2s" }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(139,92,246,0.1)"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                        <img src={user.image} alt={user.name} style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                        <div>
                          <p style={{ color: "white", fontSize: "14px", fontWeight: 600 }}>{user.name}</p>
                          <p style={{ color: "#6b7280", fontSize: "12px" }}>{user.bio || "No bio yet"}</p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
)}
    </main>
  );
}