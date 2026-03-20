"use client";
import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { db } from "@/lib/firebaseClient";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { FiBold, FiItalic, FiList, FiCode, FiSave, FiImage, FiX } from "react-icons/fi";

function generateKeywords(title) {
  const words = title.toLowerCase().split(" ").filter((w) => w.length > 1);
  const keywords = new Set();
  words.forEach((word) => {
    for (let i = 1; i <= word.length; i++) keywords.add(word.slice(0, i));
  });
  return Array.from(keywords);
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function WritePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Start writing your post..." }),
    ],
    editorProps: {
      attributes: {
        style: "min-height: 300px; outline: none; color: #e5e7eb; font-size: 16px; line-height: 1.8;",
      },
    },
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Image must be under 5MB."); return; }
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setCoverImage(data.url);
      } else {
        setError("Image upload failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handlePublish = async () => {
    if (!session) { setError("You must be signed in."); return; }
    if (!title.trim()) { setError("Please add a title."); return; }
    if (!editor?.getText().trim()) { setError("Please add some content."); return; }
    setPublishing(true);
    setError("");
    try {
      const content = editor.getHTML();
      const excerpt = editor.getText().slice(0, 150);
      const wordCount = editor.getText().split(" ").filter(Boolean).length;
      const readingTime = Math.max(1, Math.ceil(wordCount / 200));
      const slug = slugify(title) + "-" + Date.now();
      const titleKeywords = generateKeywords(title);
      const tagsArray = tags.split(",").map((t) => t.trim()).filter(Boolean);
      await addDoc(collection(db, "posts"), {
        title, slug, content, excerpt, category, tags: tagsArray, titleKeywords,
        coverImage: coverImage || "",
        authorId: session.user.id, authorName: session.user.name, authorImage: session.user.image,
        likes: 0, likedBy: [], bookmarkedBy: [], published: true,
        views: 0, readingTime: readingTime,
        createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      });
      router.push("/blog");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setPublishing(false);
    }
  };

  if (!session) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "#080412", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <p style={{ color: "white", fontSize: "18px", textAlign: "center" }}>Please sign in to write a post.</p>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#080412", padding: "32px 20px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>

        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
          <h1 style={{ color: "white", fontSize: "clamp(22px, 5vw, 28px)", fontWeight: 700 }}>Write a Post</h1>
          <button onClick={handlePublish} disabled={publishing}
            style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: publishing ? "#6d28d9" : "#7c3aed", color: "white", padding: "10px 20px", borderRadius: "10px", border: "none", fontWeight: 600, fontSize: "14px", cursor: publishing ? "not-allowed" : "pointer", opacity: publishing ? 0.7 : 1, whiteSpace: "nowrap" }}>
            <FiSave />
            {publishing ? "Publishing..." : "Publish"}
          </button>
        </div>

        {error && (
          <div style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px" }}>
            {error}
          </div>
        )}

        {/* COVER IMAGE */}
        <div style={{ marginBottom: "24px" }}>
          {coverImage ? (
            <div style={{ position: "relative", width: "100%", borderRadius: "14px", overflow: "hidden" }}>
              <img src={coverImage} alt="Cover" style={{ width: "100%", height: "clamp(180px, 30vw, 280px)", objectFit: "cover", display: "block" }} />
              <button onClick={() => setCoverImage("")}
                style={{ position: "absolute", top: "12px", right: "12px", backgroundColor: "rgba(0,0,0,0.7)", border: "none", color: "white", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
                <FiX />
              </button>
            </div>
          ) : (
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
              style={{ width: "100%", height: "clamp(120px, 20vw, 180px)", border: "2px dashed rgba(139,92,246,0.3)", borderRadius: "14px", backgroundColor: "rgba(139,92,246,0.05)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", cursor: uploading ? "not-allowed" : "pointer", color: "#9ca3af", fontSize: "14px" }}>
              <FiImage style={{ fontSize: "28px", color: "#a78bfa" }} />
              {uploading ? "Uploading..." : "Click to add a cover image"}
              <span style={{ fontSize: "12px", color: "#6b7280" }}>JPEG, PNG or WebP — Max 5MB</span>
            </button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
        </div>

        {/* TITLE */}
        <input type="text" placeholder="Post title..." value={title} onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%", backgroundColor: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 700, padding: "12px 0", marginBottom: "20px", outline: "none", letterSpacing: "-0.5px", boxSizing: "border-box" }} />

        {/* META */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "24px" }}>
          <input type="text" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)}
            style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "10px 14px", color: "white", fontSize: "14px", outline: "none" }} />
          <input type="text" placeholder="Tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)}
            style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "10px 14px", color: "white", fontSize: "14px", outline: "none" }} />
        </div>

        {/* TOOLBAR */}
        <div style={{ display: "flex", gap: "6px", padding: "10px 12px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px 10px 0 0", borderBottom: "none", flexWrap: "wrap" }}>
          {[
            { icon: FiBold, action: () => editor?.chain().focus().toggleBold().run(), label: "Bold" },
            { icon: FiItalic, action: () => editor?.chain().focus().toggleItalic().run(), label: "Italic" },
            { icon: FiList, action: () => editor?.chain().focus().toggleBulletList().run(), label: "List" },
            { icon: FiCode, action: () => editor?.chain().focus().toggleCode().run(), label: "Code" },
          ].map((tool) => {
            const Icon = tool.icon;
            return (
              <button key={tool.label} onClick={tool.action} title={tool.label}
                style={{ backgroundColor: "transparent", border: "none", color: "#9ca3af", cursor: "pointer", padding: "8px", borderRadius: "6px", fontSize: "16px" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "white"; e.currentTarget.style.backgroundColor = "rgba(139,92,246,0.2)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#9ca3af"; e.currentTarget.style.backgroundColor = "transparent"; }}>
                <Icon />
              </button>
            );
          })}
        </div>

        {/* EDITOR */}
        <div style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0 0 10px 10px", padding: "20px" }}>
          <EditorContent editor={editor} />
        </div>

      </div>
    </main>
  );
}