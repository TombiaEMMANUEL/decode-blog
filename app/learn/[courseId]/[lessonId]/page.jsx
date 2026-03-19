"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebaseClient";
import { doc, getDoc, collection, query, where, getDocs, orderBy, updateDoc, arrayUnion } from "firebase/firestore";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FiArrowLeft, FiArrowRight, FiCheckCircle, FiClock, FiList, FiX } from "react-icons/fi";

export default function LessonPage() {
  const { courseId, lessonId } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [lesson, setLesson] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const lessonRef = doc(db, "lessons", lessonId);
        const lessonSnap = await getDoc(lessonRef);
        if (lessonSnap.exists()) setLesson({ id: lessonSnap.id, ...lessonSnap.data() });

        const courseRef = doc(db, "courses", courseId);
        const courseSnap = await getDoc(courseRef);
        if (courseSnap.exists()) setCourse({ id: courseSnap.id, ...courseSnap.data() });

        const lessonsQ = query(collection(db, "lessons"), where("courseId", "==", courseId), orderBy("order", "asc"));
        const lessonsSnap = await getDocs(lessonsQ);
        setLessons(lessonsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        if (session?.user?.id) {
          const progressRef = doc(db, "progress", `${session.user.id}_${courseId}`);
          const progressSnap = await getDoc(progressRef);
          if (progressSnap.exists()) {
            setCompleted(progressSnap.data().completedLessons?.includes(lessonId));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (courseId && lessonId) fetchData();
  }, [courseId, lessonId, session]);

  const handleComplete = async () => {
    if (!session) return;
    try {
      const progressRef = doc(db, "progress", `${session.user.id}_${courseId}`);
      await updateDoc(progressRef, {
        completedLessons: arrayUnion(lessonId),
        lastAccessedAt: new Date(),
      }).catch(async () => {
        const { setDoc } = await import("firebase/firestore");
        await setDoc(progressRef, {
          userId: session.user.id, courseId,
          completedLessons: [lessonId],
          lastAccessedAt: new Date(),
        });
      });
      setCompleted(true);
    } catch (err) {
      console.error(err);
    }
  };

  const currentIndex = lessons.findIndex((l) => l.id === lessonId);
  const prevLesson = lessons[currentIndex - 1];
  const nextLesson = lessons[currentIndex + 1];

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "#080412", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#9ca3af" }}>Loading...</div>
      </main>
    );
  }

  if (!lesson) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "#080412", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "white", fontSize: "24px", fontWeight: 700, marginBottom: "16px" }}>Lesson not found</p>
          <button onClick={() => router.push(`/learn/${courseId}`)} style={{ color: "#a78bfa", background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}>Back to Course</button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#080412" }}>
      <div style={{ display: "flex", maxWidth: "1200px", margin: "0 auto", padding: "32px 20px", gap: "28px", position: "relative" }}>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* TOP BAR */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px", gap: "12px" }}>
            <button onClick={() => router.push(`/learn/${courseId}`)} style={{ display: "flex", alignItems: "center", gap: "8px", color: "#9ca3af", background: "none", border: "none", cursor: "pointer", fontSize: "14px", padding: 0, flexShrink: 0 }}>
              <FiArrowLeft />
              <span style={{ display: "none" }} className="sm-show">{course?.title || "Back"}</span>
              <span>Back</span>
            </button>
            {/* MOBILE SIDEBAR TOGGLE */}
            <button onClick={() => setShowSidebar(true)}
              style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#9ca3af", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>
              <FiList style={{ fontSize: "14px" }} />
              Contents
            </button>
          </div>

          {/* VIDEO */}
          {lesson.videoUrl && (
            <div style={{ width: "100%", aspectRatio: "16/9", backgroundColor: "rgba(0,0,0,0.5)", borderRadius: "16px", overflow: "hidden", marginBottom: "28px" }}>
              <iframe src={lesson.videoUrl} style={{ width: "100%", height: "100%", border: "none" }} allowFullScreen title={lesson.title} />
            </div>
          )}

          {/* LESSON HEADER */}
          <div style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px", flexWrap: "wrap" }}>
              <span style={{ color: "#a78bfa", fontSize: "13px", fontWeight: 500 }}>
                Lesson {currentIndex + 1} of {lessons.length}
              </span>
              {lesson.duration && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6b7280", fontSize: "13px" }}>
                  <FiClock style={{ fontSize: "12px" }} />
                  {lesson.duration} min
                </div>
              )}
            </div>
            <h1 style={{ fontSize: "clamp(22px, 5vw, 36px)", fontWeight: 800, color: "white", lineHeight: 1.2, letterSpacing: "-0.5px" }}>
              {lesson.title}
            </h1>
          </div>

          {/* CONTENT */}
          <div className="post-content" dangerouslySetInnerHTML={{ __html: lesson.content }}
            style={{ color: "#d1d5db", fontSize: "16px", lineHeight: 1.8, marginBottom: "40px" }} />

          {/* QUIZ */}
          {lesson.quiz?.length > 0 && (
            <div style={{ backgroundColor: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: "16px", padding: "28px", marginBottom: "40px" }}>
              <h3 style={{ color: "white", fontSize: "18px", fontWeight: 700, marginBottom: "20px" }}>Quick Quiz</h3>
              {lesson.quiz.map((q, i) => (
                <div key={i} style={{ marginBottom: "20px" }}>
                  <p style={{ color: "white", fontSize: "15px", fontWeight: 600, marginBottom: "10px" }}>{i + 1}. {q.question}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {q.options.map((opt, j) => (
                      <div key={j} style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px 14px", color: "#9ca3af", fontSize: "14px", cursor: "pointer" }}>
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* NAVIGATION */}
          <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.08)", flexWrap: "wrap" }}>
            {prevLesson ? (
              <Link href={`/learn/${courseId}/${prevLesson.id}`} style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "10px 18px", borderRadius: "10px", fontWeight: 500, fontSize: "14px", textDecoration: "none" }}>
                <FiArrowLeft />
                Previous
              </Link>
            ) : <div />}

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {!completed && session && (
                <button onClick={handleComplete} style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#4ade80", padding: "10px 18px", borderRadius: "10px", fontWeight: 500, fontSize: "14px", cursor: "pointer" }}>
                  <FiCheckCircle />
                  Mark Complete
                </button>
              )}
              {completed && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#4ade80", fontSize: "14px", fontWeight: 500 }}>
                  <FiCheckCircle />
                  Completed
                </div>
              )}
              {nextLesson && (
                <Link href={`/learn/${courseId}/${nextLesson.id}`} style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#7c3aed", color: "white", padding: "10px 18px", borderRadius: "10px", fontWeight: 500, fontSize: "14px", textDecoration: "none" }}>
                  Next
                  <FiArrowRight />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* DESKTOP SIDEBAR */}
        <div style={{ width: "260px", flexShrink: 0, display: "none" }} className="lg-show">
          <div style={{ position: "sticky", top: "100px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "20px" }}>
            <h3 style={{ color: "white", fontSize: "14px", fontWeight: 600, marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <FiList />
              Course Content
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {lessons.map((l, index) => (
                <Link key={l.id} href={`/learn/${courseId}/${l.id}`} style={{ textDecoration: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", backgroundColor: l.id === lessonId ? "rgba(139,92,246,0.15)" : "transparent", border: l.id === lessonId ? "1px solid rgba(139,92,246,0.3)" : "1px solid transparent" }}>
                    <span style={{ color: l.id === lessonId ? "#a78bfa" : "#6b7280", fontSize: "12px", fontWeight: 600, width: "16px", flexShrink: 0 }}>{index + 1}</span>
                    <span style={{ color: l.id === lessonId ? "white" : "#9ca3af", fontSize: "13px", lineHeight: 1.4 }}>{l.title}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE SIDEBAR OVERLAY */}
      {showSidebar && (
        <div style={{ position: "fixed", inset: 0, zIndex: 60, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }} onClick={() => setShowSidebar(false)}>
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "min(300px, 85vw)", backgroundColor: "#0f0a1e", borderLeft: "1px solid rgba(139,92,246,0.3)", padding: "24px 20px", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ color: "white", fontSize: "16px", fontWeight: 600 }}>Course Content</h3>
              <button onClick={() => setShowSidebar(false)} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "20px" }}>
                <FiX />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {lessons.map((l, index) => (
                <Link key={l.id} href={`/learn/${courseId}/${l.id}`} style={{ textDecoration: "none" }} onClick={() => setShowSidebar(false)}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", borderRadius: "8px", backgroundColor: l.id === lessonId ? "rgba(139,92,246,0.15)" : "transparent", border: l.id === lessonId ? "1px solid rgba(139,92,246,0.3)" : "1px solid transparent" }}>
                    <span style={{ color: l.id === lessonId ? "#a78bfa" : "#6b7280", fontSize: "12px", fontWeight: 600, width: "20px", flexShrink: 0 }}>{index + 1}</span>
                    <span style={{ color: l.id === lessonId ? "white" : "#9ca3af", fontSize: "14px" }}>{l.title}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}