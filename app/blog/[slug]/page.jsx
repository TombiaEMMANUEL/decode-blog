"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebaseClient";
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove, addDoc, orderBy, serverTimestamp, deleteDoc } from "firebase/firestore";
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove, addDoc, orderBy, serverTimestamp } from "firebase/firestore";
import { useSession } from "next-auth/react";
import { FiClock, FiUser, FiHeart, FiBookmark, FiArrowLeft, FiTag } from "react-icons/fi";

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
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
        }
      } catch (err) {
        console.error(err);
     } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        const q = query(
          collection(db, "comments"),
          where("postId", "==", slug),
          orderBy("createdAt", "asc")
        );
        const snap = await getDocs(q);
        setComments(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error(err);
      }
    };
    if (slug) fetchPost();
  }, [slug, session]);

  const handleLike = async () => {
    if (!session) return;
    const postRef = doc(db, "posts", post.id);
    if (liked) {
      await updateDoc(postRef, { likedBy: arrayRemove(session.user.id), likes: likeCount - 1 });
      setLiked(false);
      setLikeCount((c) => c - 1);
    } else {
      await updateDoc(postRef, { likedBy: arrayUnion(session.user.id), likes: likeCount + 1  });
      setLiked(true);
      setLikeCount((c) => c + 1);
    }
  };
 const handleComment = async () => {
  if (!session || !commentText.trim()) return;
  setSubmitting(true);
  try {
    const newComment = {
      postId: slug,
      authorId: session.user.id,
      authorName: session.user.name,
      authorImage: session.user.image,
      content: commentText.trim(),
      createdAt: serverTimestamp(),
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

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "#080412", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#9ca3af", fontSize: "16px" }}>Loading...</div>
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
    <main style={{ minHeight: "100vh", backgroundColor: "#080412", padding: "40px 24px" }}>
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "40px" }}>
    <button onClick={() => router.push("/blog")} style={{ display: "flex", alignItems: "center", gap: "8px", color: "#9ca3af", background: "none", border: "none", cursor: "pointer", fontSize: "14px", padding: 0 }}>
    <FiArrowLeft />
    Back to Blog
  </button>
  {session?.user?.id === post.authorId && (
    <button
      onClick={async () => {
        if (confirm("Are you sure you want to delete this post?")) {
          await deleteDoc(doc(db, "posts", post.id));
          router.push("/blog");
        }
      }}
      style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", padding: "8px 16px", borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 500 }}
    >
      Delete Post
    </button>
  )}
</div>

        {post.category && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", color: "#a78bfa", padding: "4px 12px", borderRadius: "100px", fontSize: "12px", fontWeight: 500, marginBottom: "20px" }}>
            <FiTag style={{ fontSize: "10px" }} />
            {post.category}
          </div>
        )}

        <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 800, color: "white", lineHeight: 1.2, letterSpacing: "-1px", marginBottom: "24px" }}>
          {post.title}
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: "20px", paddingBottom: "24px", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: "40px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {post.authorImage && (
              <img src={post.authorImage} alt={post.authorName} style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} />
            )}
            <Link
               href={`/profile/${post.authorId}`}
               style={{ color: "#e5e7eb", fontSize: "14px", fontWeight: 500, textDecoration: "none" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#a78bfa"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#e5e7eb"}
            >
          {post.authorName}
          </Link>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6b7280", fontSize: "13px" }}>
            <FiClock style={{ fontSize: "12px" }} />
            {timeAgo(post.createdAt)}
          </div>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "12px" }}>
            <button onClick={handleLike} style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "1px solid", borderColor: liked ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.1)", color: liked ? "#f87171" : "#9ca3af", padding: "8px 16px", borderRadius: "100px", cursor: session ? "pointer" : "default", fontSize: "13px", transition: "all 0.2s" }}>
              <FiHeart style={{ fill: liked ? "#f87171" : "none" }} />
              {likeCount}
            </button>

            <button onClick={handleBookmark} style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "1px solid", borderColor: bookmarked ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.1)", color: bookmarked ? "#a78bfa" : "#9ca3af", padding: "8px 16px", borderRadius: "100px", cursor: session ? "pointer" : "default", fontSize: "13px", transition: "all 0.2s" }}>
              <FiBookmark style={{ fill: bookmarked ? "#a78bfa" : "none" }} />
              {bookmarked ? "Saved" : "Save"}
            </button>
          </div>
        </div>

        <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} style={{ color: "#d1d5db", fontSize: "17px", lineHeight: 1.8 }} />
        
        {post.tags?.length > 0 && (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "48px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            {post.tags.map((tag) => (
              <span key={tag} style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#9ca3af", padding: "4px 12px", borderRadius: "100px", fontSize: "12px" }}>
                #{tag}
              </span>
            ))}
          </div>
        )}
        {/* COMMENTS */}
        <div style={{ marginTop: "60px" }}>
          
        </div>

      </div>
    </main>
  );
}
      