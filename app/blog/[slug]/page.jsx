"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebaseClient";
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove, addDoc, orderBy, serverTimestamp, deleteDoc, increment } from "firebase/firestore";
import { useSession } from "next-auth/react";
import { FiClock, FiHeart, FiBookmark, FiArrowLeft, FiTag, FiEye, FiShare2, FiTwitter, FiLink, FiMessageCircle } from "react-icons/fi";

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

function TableOfContents({ content }) {
  const [toc, setToc] = useState([]);

  useEffect(() => {
    if (!content) return;
    const parser = new DOMParser();
    const parsed = parser.parseFromString(content, "text/html");
    const headings = Array.from(parsed.querySelectorAll("h1, h2, h3"));
    setToc(headings.map((h, i) => ({
      id: `heading-${i}`,
      text: h.textContent,
      level: parseInt(h.tagName[1]),
    })));
  }, [content]);

  if (toc.length === 0) return null;

  return (
    <div style={{ backgroundColor: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: "14px", padding: "20px 24px", marginBottom: "32px" }}>
      <h3 style={{ color: "white", fontSize: "14px", fontWeight: 700, marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Table of Contents</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {toc.map((item) => (
          <a key={item.id} href={`#${item.id}`}
            style={{ color: "#9ca3af", fontSize: "14px", textDecoration: "none", paddingLeft: item.level === 1 ? "0px" : item.level === 2 ? "12px" : "24px", display: "flex", alignItems: "center", gap: "8px" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#a78bfa"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#9ca3af"}>
            <span style={{ color: "#6b7280", fontSize: "12px" }}>—</span>
            {item.text}
          </a>
        ))}
      </div>
    </div>
  );
}
   
    function AuthorBio({ authorId, authorName, authorImage }) {
  const [bio, setBio] = useState("");
  const [postCount, setPostCount] = useState(0);

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const { doc, getDoc, collection, query, where, getDocs } = await import("firebase/firestore");
        const userSnap = await getDoc(doc(db, "users", authorId));
        if (userSnap.exists()) setBio(userSnap.data().bio || "");
        const postsSnap = await getDocs(query(collection(db, "posts"), where("authorId", "==", authorId)));
        setPostCount(postsSnap.size);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAuthor();
  }, [authorId]);

  return (
    <div style={{ margin: "40px 0", padding: "28px", backgroundColor: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: "20px" }}>
      <p style={{ color: "#a78bfa", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>Written by</p>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
        <Link href={`/profile/${authorId}`}>
          <img src={authorImage} alt={authorName} style={{ width: "60px", height: "60px", borderRadius: "50%", border: "2px solid rgba(139,92,246,0.4)", flexShrink: 0, cursor: "pointer" }} />
        </Link>
        <div style={{ flex: 1, minWidth: "180px" }}>
          <Link href={`/profile/${authorId}`} style={{ textDecoration: "none" }}>
            <h4 style={{ color: "white", fontSize: "18px", fontWeight: 700, marginBottom: "6px" }}>{authorName}</h4>
          </Link>
          <p style={{ color: "#9ca3af", fontSize: "14px", lineHeight: 1.6, marginBottom: "12px" }}>
            {bio || "No bio yet."}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <span style={{ color: "#6b7280", fontSize: "13px" }}>{postCount} posts</span>
            <Link href={`/profile/${authorId}`}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", color: "#a78bfa", padding: "6px 14px", borderRadius: "100px", fontSize: "13px", fontWeight: 500, textDecoration: "none" }}>
              View Profile →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PostPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const q = query(collection(db, "posts"), where("slug", "==", slug));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const data = { id: snap.docs[0].id, ...snap.docs[0].data() };
          setPost(data);
          setLikeCount(data.likes || 0);
          if (session?.user?.id) {
            setLiked(data.likedBy?.includes(session.user.id));
            setBookmarked(data.bookmarkedBy?.includes(session.user.id));
          }
          await updateDoc(doc(db, "posts", snap.docs[0].id), { views: increment(1) });
          // Fetch related posts
          if (data.category) {
            const relQ = query(collection(db, "posts"), where("category", "==", data.category));
            const relSnap = await getDocs(relQ);
            const related = relSnap.docs
              .map((d) => ({ id: d.id, ...d.data() }))
              .filter((p) => p.id !== snap.docs[0].id)
              .slice(0, 3);
            setRelatedPosts(related);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        const q = query(collection(db, "comments"), where("postId", "==", slug), orderBy("createdAt", "asc"));
        const snap = await getDocs(q);
        setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      }
    };

    if (slug) {
      fetchPost();
      fetchComments();
    }
  }, [slug, session]);

  const handleLike = async () => {
    if (!session) return;
    const postRef = doc(db, "posts", post.id);
    if (liked) {
      await updateDoc(postRef, { likedBy: arrayRemove(session.user.id), likes: likeCount - 1 });
      setLiked(false);
      setLikeCount((c) => c - 1);
    } else {
      await updateDoc(postRef, { likedBy: arrayUnion(session.user.id), likes: likeCount + 1 });
      setLiked(true);
      setLikeCount((c) => c + 1);
    }
  };

  const handleBookmark = async () => {
    if (!session) return;
    const postRef = doc(db, "posts", post.id);
    if (bookmarked) {
      await updateDoc(postRef, { bookmarkedBy: arrayRemove(session.user.id) });
      setBookmarked(false);
    } else {
      await updateDoc(postRef, { bookmarkedBy: arrayUnion(session.user.id) });
      setBookmarked(true);
    }
  };

  const handleComment = async () => {
    if (!session || !commentText.trim()) return;
    setSubmitting(true);
    try {
      const newComment = {
        postId: slug, authorId: session.user.id, authorName: session.user.name,
        authorImage: session.user.image, content: commentText.trim(), createdAt: serverTimestamp(),
      };
      const ref = await addDoc(collection(db, "comments"), newComment);
      setComments((prev) => [...prev, { id: ref.id, ...newComment, createdAt: new Date() }]);
      setCommentText("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this post?")) {
      await deleteDoc(doc(db, "posts", post.id));
      router.push("/blog");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`, "_blank");
  };

  const handleShareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(post.title + " " + window.location.href)}`, "_blank");
  };

  const isAuthor = session?.user?.name === post?.authorName;

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "#080412", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#9ca3af" }}>Loading...</div>
      </main>
    );
  }

  if (!post) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "#080412", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "white", fontSize: "24px", fontWeight: 700, marginBottom: "16px" }}>Post not found</p>
          <button onClick={() => router.push("/blog")} style={{ color: "#a78bfa", background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}>Back to Blog</button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#080412", padding: "32px 20px" }}>
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>

        {/* TOP BAR */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", gap: "12px" }}>
          <button onClick={() => router.push("/blog")} style={{ display: "flex", alignItems: "center", gap: "8px", color: "#9ca3af", background: "none", border: "none", cursor: "pointer", fontSize: "14px", padding: 0 }}>
            <FiArrowLeft />
            Back to Blog
          </button>
          {isAuthor && (
            <button onClick={handleDelete}
              style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", padding: "8px 14px", borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: 500, whiteSpace: "nowrap" }}>
              Delete Post
            </button>
          )}
        </div>

        {/* COVER IMAGE */}
        {post.coverImage && (
          <div style={{ width: "100%", borderRadius: "16px", overflow: "hidden", marginBottom: "28px" }}>
            <img src={post.coverImage} alt={post.title} style={{ width: "100%", height: "clamp(200px, 40vw, 400px)", objectFit: "cover", display: "block" }} />
          </div>
        )}

        {/* CATEGORY */}
        {post.category && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", color: "#a78bfa", padding: "4px 12px", borderRadius: "100px", fontSize: "12px", fontWeight: 500, marginBottom: "16px" }}>
            <FiTag style={{ fontSize: "10px" }} />
            {post.category}
          </div>
        )}

        {/* TITLE */}
        <h1 style={{ fontSize: "clamp(24px, 6vw, 48px)", fontWeight: 800, color: "white", lineHeight: 1.2, letterSpacing: "-1px", marginBottom: "20px" }}>
          {post.title}
        </h1>

        {/* AUTHOR ROW */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: "32px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: "200px" }}>
            {post.authorImage && (
              <img src={post.authorImage} alt={post.authorName} style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
            )}
            <div>
              <Link href={`/profile/${post.authorId}`}
                style={{ color: "white", fontSize: "14px", fontWeight: 600, textDecoration: "none", display: "block" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#a78bfa"}
                onMouseLeave={(e) => e.currentTarget.style.color = "white"}>
                {post.authorName}
              </Link>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <span style={{ color: "#6b7280", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                  <FiClock style={{ fontSize: "11px" }} />
                  {timeAgo(post.createdAt)}
                </span>
                {post.readingTime && (
                  <span style={{ color: "#6b7280", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <FiClock style={{ fontSize: "11px" }} />
                    {post.readingTime} min read
                  </span>
                )}
                {post.views !== undefined && (
                  <span style={{ color: "#6b7280", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <FiEye style={{ fontSize: "11px" }} />
                    {post.views} views
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <button onClick={handleLike} style={{ display: "flex", alignItems: "center", gap: "5px", background: "none", border: "1px solid", borderColor: liked ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.1)", color: liked ? "#f87171" : "#9ca3af", padding: "7px 14px", borderRadius: "100px", cursor: session ? "pointer" : "default", fontSize: "13px" }}>
              <FiHeart style={{ fill: liked ? "#f87171" : "none" }} />
              {likeCount}
            </button>
            <button onClick={handleBookmark} style={{ display: "flex", alignItems: "center", gap: "5px", background: "none", border: "1px solid", borderColor: bookmarked ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.1)", color: bookmarked ? "#a78bfa" : "#9ca3af", padding: "7px 14px", borderRadius: "100px", cursor: session ? "pointer" : "default", fontSize: "13px" }}>
              <FiBookmark style={{ fill: bookmarked ? "#a78bfa" : "none" }} />
              {bookmarked ? "Saved" : "Save"}
            </button>
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowShare(!showShare)}
                style={{ display: "flex", alignItems: "center", gap: "5px", background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "#9ca3af", padding: "7px 14px", borderRadius: "100px", cursor: "pointer", fontSize: "13px" }}>
                <FiShare2 />
                Share
              </button>
              {showShare && (
                <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, backgroundColor: "rgba(15,10,30,0.98)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: "12px", padding: "8px", minWidth: "160px", boxShadow: "0 8px 32px rgba(0,0,0,0.4)", zIndex: 50 }}>
                  {[
                    { icon: FiTwitter, label: "Share on X", action: handleShareTwitter },
                    { icon: FiMessageCircle, label: "WhatsApp", action: handleShareWhatsApp },
                    { icon: FiLink, label: copied ? "Copied!" : "Copy Link", action: handleCopyLink },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button key={item.label} onClick={item.action}
                        style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", color: "#d1d5db", fontSize: "13px", background: "none", border: "none", cursor: "pointer", width: "100%" }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(139,92,246,0.15)"; e.currentTarget.style.color = "white"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#d1d5db"; }}>
                        <Icon style={{ fontSize: "14px" }} />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TABLE OF CONTENTS */}
        <TableOfContents content={post.content} />

        {/* CONTENT */}
        <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} style={{ color: "#d1d5db", fontSize: "clamp(15px, 3vw, 17px)", lineHeight: 1.8 }} />

        {/* TAGS */}
        {post.tags?.length > 0 && (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "40px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            {post.tags.map((tag) => (
              <span key={tag} style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#9ca3af", padding: "4px 12px", borderRadius: "100px", fontSize: "12px" }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* AUTHOR BIO */}
            {post.authorId && (
              <AuthorBio authorId={post.authorId} authorName={post.authorName} authorImage={post.authorImage} />
            )}

        {/* SHARE BOTTOM */}
        <div style={{ marginTop: "40px", padding: "24px", backgroundColor: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <p style={{ color: "white", fontSize: "15px", fontWeight: 600, marginBottom: "4px" }}>Enjoyed this post?</p>
            <p style={{ color: "#9ca3af", fontSize: "13px" }}>Share it with your network</p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button onClick={handleShareTwitter}
              style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "10px 16px", borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: 500 }}>
              <FiTwitter />
              Share on X
            </button>
            <button onClick={handleCopyLink}
              style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: copied ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.05)", border: `1px solid ${copied ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.1)"}`, color: copied ? "#4ade80" : "white", padding: "10px 16px", borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: 500 }}>
              <FiLink />
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>

        {/* COMMENTS */}
        <div style={{ marginTop: "48px" }}>
          <h3 style={{ color: "white", fontSize: "18px", fontWeight: 700, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <FiMessageCircle />
            Comments ({comments.length})
          </h3>
          {session ? (
            <div style={{ marginBottom: "28px" }}>
              <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a comment..." rows={3}
                style={{ width: "100%", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "12px 14px", color: "white", fontSize: "14px", outline: "none", resize: "vertical", marginBottom: "10px", boxSizing: "border-box" }} />
              <button onClick={handleComment} disabled={submitting}
                style={{ backgroundColor: "#7c3aed", color: "white", padding: "10px 20px", borderRadius: "10px", border: "none", fontWeight: 600, fontSize: "14px", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1 }}>
                {submitting ? "Posting..." : "Post Comment"}
              </button>
            </div>
          ) : (
            <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "24px" }}>
              <Link href="/auth/signin" style={{ color: "#a78bfa", textDecoration: "none" }}>Sign in</Link> to leave a comment.
            </p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {comments.length === 0 ? (
              <p style={{ color: "#6b7280", fontSize: "14px" }}>No comments yet. Be the first!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                    {comment.authorImage && <img src={comment.authorImage} alt={comment.authorName} style={{ width: "26px", height: "26px", borderRadius: "50%", flexShrink: 0 }} />}
                    <span style={{ color: "white", fontSize: "13px", fontWeight: 600 }}>{comment.authorName}</span>
                    <span style={{ color: "#6b7280", fontSize: "12px" }}>{timeAgo(comment.createdAt)}</span>
                  </div>
                  <p style={{ color: "#d1d5db", fontSize: "14px", lineHeight: 1.6 }}>{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RELATED POSTS */}
        {relatedPosts.length > 0 && (
          <div style={{ marginTop: "60px", paddingTop: "40px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 style={{ color: "white", fontSize: "18px", fontWeight: 700, marginBottom: "20px" }}>Related Posts</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
              {relatedPosts.map((related) => (
                <Link key={related.id} href={`/blog/${related.slug}`} style={{ textDecoration: "none" }}>
                  <div style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", overflow: "hidden", transition: "all 0.2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.border = "1px solid rgba(139,92,246,0.3)"; e.currentTarget.style.backgroundColor = "rgba(139,92,246,0.05)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.07)"; e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)"; }}>
                    {related.coverImage && <img src={related.coverImage} alt={related.title} style={{ width: "100%", height: "120px", objectFit: "cover", display: "block" }} />}
                    <div style={{ padding: "14px" }}>
                      <h4 style={{ color: "white", fontSize: "14px", fontWeight: 600, lineHeight: 1.4, marginBottom: "6px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{related.title}</h4>
                      <p style={{ color: "#6b7280", fontSize: "12px" }}>{related.authorName}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}