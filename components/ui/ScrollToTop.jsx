"use client";
import { useEffect, useState } from "react";
import { FiArrowUp } from "react-icons/fi";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      style={{
        position: "fixed",
        bottom: "32px",
        right: "24px",
        zIndex: 50,
        width: "44px",
        height: "44px",
        borderRadius: "50%",
        backgroundColor: "#7c3aed",
        border: "none",
        color: "white",
        fontSize: "18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#6d28d9"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#7c3aed"; e.currentTarget.style.transform = "translateY(0)"; }}
      title="Scroll to top"
    >
      <FiArrowUp />
    </button>
  );
}