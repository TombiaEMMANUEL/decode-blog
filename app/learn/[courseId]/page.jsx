"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebaseClient";
import { doc, getDoc, collection, query, where, getDocs, orderBy, deleteDoc } from "firebase/firestore";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FiArrowLeft, FiBook, FiClock, FiUser, FiTag, FiZap, FiCheckCircle } from "react-icons/fi";

const difficultyColors = {
  beginner: { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.2)", text: "#4ade80" },
  intermediate: { bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.2)", text: "#fbbf24" },
  advanced: { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.2)", text: "#f87171" },
};

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseRef = doc(db, "courses", courseId);
        const courseSnap = await getDoc(courseRef);
        if (courseSnap.exists()) setCourse({ id: courseSnap.id, ...courseSnap.data() });
        const lessonsQ = query(collection(db, "lessons"), where("courseId", "==", courseId), orderBy("order", "asc"));
        const lessonsSnap = await getDocs(lessonsQ);
        setLessons(lessonsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (courseId) fetchCourse();
  }, [courseId]);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this course?")) {
      await deleteDoc(doc(db, "courses", courseId));
      router.push("/learn");
    }
  };

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "#080412", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#9ca3af" }}>Loading...</div>
      </main>
    );
  }

  if (!course) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "#080412", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "white", fontSize: "24px", fontWeight: 700, marginBottom: "16px" }}>Course not found</p>
          <button onClick={() => router.push("/learn")} style={{ color: "#a78bfa", background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}>Back to Courses</button>
        </div>
      </main>
    );
  }

  const diff = difficultyColors[course.difficulty] || difficultyColors.beginner;
  const isAuthor = session?.user?.name === course.authorName;

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#080412", padding: "40px 20px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* TOP BAR */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
          <button onClick={() => router.push("/learn")} style={{ display: "flex", alignItems: "center", gap: "8px", color: "#9ca3af", background: "none", border: "none", cursor: "pointer", fontSize: "14px", padding: 0 }}>
            <FiArrowLeft />
            Back to Courses
          </button>
          {isAuthor && (
            <button onClick={handleDelete}
              style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", padding: "8px 16px", borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: 500 }}>
              Delete Course
            </button>
          )}
        </div>

        {/* COURSE HEADER */}
        <div style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "28px 24px", marginBottom: "28px" }}>
          <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
            {course.category && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", color: "#a78bfa", padding: "4px 12px", borderRadius: "100px", fontSize: "12px", fontWeight: 500 }}>
                <FiTag style={{ fontSize: "10px" }} />
                {course.category}
              </div>
            )}
            {course.difficulty && (
              <div style={{ display: "inline-flex", alignItems: "center", backgroundColor: diff.bg, border: `1px solid ${diff.border}`, color: diff.text, padding: "4px 12px", borderRadius: "100px", fontSize: "12px", fontWeight: 500 }}>
                {course.difficulty}
              </div>
            )}
          </div>

          <h1 style={{ fontSize: "clamp(24px, 5vw, 40px)", fontWeight: 800, color: "white", lineHeight: 1.2, letterSpacing: "-1px", marginBottom: "14px" }}>
            {course.title}
          </h1>
          <p style={{ color: "#9ca3af", fontSize: "15px", lineHeight: 1.7, marginBottom: "20px" }}>{course.description}</p>

          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#6b7280", fontSize: "14px" }}>
              <FiUser style={{ fontSize: "14px" }} />
              {course.authorName}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#6b7280", fontSize: "14px" }}>
              <FiBook style={{ fontSize: "14px" }} />
              {lessons.length} lessons
            </div>
          </div>

          {lessons.length > 0 && (
            <Link href={`/learn/${courseId}/${lessons[0].id}`}
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "#7c3aed", color: "white", padding: "12px 24px", borderRadius: "12px", fontWeight: 600, fontSize: "15px", textDecoration: "none", marginTop: "24px" }}>
              <FiZap />
              Start Learning
            </Link>
          )}
        </div>

        {/* LESSONS LIST */}
        <div>
          <h2 style={{ color: "white", fontSize: "20px", fontWeight: 700, marginBottom: "16px" }}>Course Content</h2>
          {lessons.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px" }}>
              <p style={{ color: "#6b7280", fontSize: "14px" }}>No lessons yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {lessons.map((lesson, index) => (
                <Link key={lesson.id} href={`/learn/${courseId}/${lesson.id}`} style={{ textDecoration: "none" }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: "14px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "14px 18px", transition: "all 0.2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.border = "1px solid rgba(139,92,246,0.3)"; e.currentTarget.style.backgroundColor = "rgba(139,92,246,0.05)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.07)"; e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)"; }}>
                    <div style={{ width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#a78bfa", fontSize: "12px", fontWeight: 700, flexShrink: 0 }}>
                      {index + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: "white", fontSize: "14px", fontWeight: 500 }}>{lesson.title}</p>
                      {lesson.duration && (
                        <p style={{ color: "#6b7280", fontSize: "12px", marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
                          <FiClock style={{ fontSize: "11px" }} />
                          {lesson.duration} min
                        </p>
                      )}
                    </div>
                    <FiCheckCircle style={{ color: "rgba(255,255,255,0.1)", fontSize: "16px", flexShrink: 0 }} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}