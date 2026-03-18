"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebaseClient";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { FiSave, FiPlus, FiTrash } from "react-icons/fi";

export default function CreateCoursePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("beginner");
  const [lessons, setLessons] = useState([{ title: "", content: "", videoUrl: "", duration: "", order: 1 }]);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");

  const addLesson = () => {
    setLessons([...lessons, { title: "", content: "", videoUrl: "", duration: "", order: lessons.length + 1 }]);
  };

  const removeLesson = (index) => {
    setLessons(lessons.filter((_, i) => i !== index));
  };

  const updateLesson = (index, field, value) => {
    const updated = [...lessons];
    updated[index][field] = value;
    setLessons(updated);
  };

  const handlePublish = async () => {
    if (!session) { setError("You must be signed in."); return; }
    if (!title.trim()) { setError("Please add a course title."); return; }
    if (!description.trim()) { setError("Please add a description."); return; }
    if (lessons.some((l) => !l.title.trim())) { setError("All lessons must have a title."); return; }

    setPublishing(true);
    setError("");

    try {
      const courseRef = await addDoc(collection(db, "courses"), {
        title,
        description,
        category,
        difficulty,
        authorId: session.user.id,
        authorName: session.user.name,
        authorImage: session.user.image,
        totalLessons: lessons.length,
        published: true,
        createdAt: serverTimestamp(),
      });

      for (const lesson of lessons) {
        await addDoc(collection(db, "lessons"), {
          courseId: courseRef.id,
          title: lesson.title,
          content: lesson.content,
          videoUrl: lesson.videoUrl,
          duration: lesson.duration ? parseInt(lesson.duration) : null,
          order: lesson.order,
          quiz: [],
        });
      }

      router.push(`/learn/${courseRef.id}`);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setPublishing(false);
    }
  };

  if (!session) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "#080412", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "18px" }}>
        Please sign in to create a course.
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#080412", padding: "40px 24px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>

        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "40px" }}>
          <h1 style={{ color: "white", fontSize: "28px", fontWeight: 700 }}>Create a Course</h1>
          <button onClick={handlePublish} disabled={publishing}
            style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: publishing ? "#6d28d9" : "#7c3aed", color: "white", padding: "10px 24px", borderRadius: "10px", border: "none", fontWeight: 600, fontSize: "14px", cursor: publishing ? "not-allowed" : "pointer", opacity: publishing ? 0.7 : 1 }}>
            <FiSave />
            {publishing ? "Publishing..." : "Publish Course"}
          </button>
        </div>

        {error && (
          <div style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", padding: "12px 16px", borderRadius: "10px", marginBottom: "24px", fontSize: "14px" }}>
            {error}
          </div>
        )}

        {/* COURSE DETAILS */}
        <div style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "32px", marginBottom: "24px" }}>
          <h2 style={{ color: "white", fontSize: "18px", fontWeight: 600, marginBottom: "24px" }}>Course Details</h2>

          <input type="text" placeholder="Course title..." value={title} onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px 16px", color: "white", fontSize: "16px", outline: "none", marginBottom: "16px", boxSizing: "border-box" }} />

          <textarea placeholder="Course description..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
            style={{ width: "100%", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px 16px", color: "white", fontSize: "14px", outline: "none", resize: "vertical", marginBottom: "16px", boxSizing: "border-box" }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <input type="text" placeholder="Category (e.g. Programming)" value={category} onChange={(e) => setCategory(e.target.value)}
              style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px 16px", color: "white", fontSize: "14px", outline: "none" }} />
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
              style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px 16px", color: "white", fontSize: "14px", outline: "none" }}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* LESSONS */}
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ color: "white", fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>Lessons</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {lessons.map((lesson, index) => (
              <div key={index} style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <span style={{ color: "#a78bfa", fontSize: "13px", fontWeight: 600 }}>Lesson {index + 1}</span>
                  {lessons.length > 1 && (
                    <button onClick={() => removeLesson(index)} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: "16px" }}>
                      <FiTrash />
                    </button>
                  )}
                </div>

                <input type="text" placeholder="Lesson title..." value={lesson.title} onChange={(e) => updateLesson(index, "title", e.target.value)}
                  style={{ width: "100%", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "10px 14px", color: "white", fontSize: "14px", outline: "none", marginBottom: "12px", boxSizing: "border-box" }} />

                <textarea placeholder="Lesson content..." value={lesson.content} onChange={(e) => updateLesson(index, "content", e.target.value)} rows={4}
                  style={{ width: "100%", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "10px 14px", color: "white", fontSize: "14px", outline: "none", resize: "vertical", marginBottom: "12px", boxSizing: "border-box" }} />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <input type="text" placeholder="Video URL (YouTube embed)" value={lesson.videoUrl} onChange={(e) => updateLesson(index, "videoUrl", e.target.value)}
                    style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "10px 14px", color: "white", fontSize: "14px", outline: "none" }} />
                  <input type="number" placeholder="Duration (minutes)" value={lesson.duration} onChange={(e) => updateLesson(index, "duration", e.target.value)}
                    style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "10px 14px", color: "white", fontSize: "14px", outline: "none" }} />
                </div>
              </div>
            ))}
          </div>

          <button onClick={addLesson}
            style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "transparent", border: "1px dashed rgba(139,92,246,0.4)", color: "#a78bfa", padding: "14px 24px", borderRadius: "12px", fontWeight: 500, fontSize: "14px", cursor: "pointer", width: "100%", justifyContent: "center", marginTop: "16px" }}>
            <FiPlus />
            Add Lesson
          </button>
        </div>
      </div>
    </main>
  );
}