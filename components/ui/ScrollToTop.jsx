"use client";
import { useEffect, useState } from "react";
import { FiArrowUp, FiArrowDown } from "react-icons/fi";

export default function ScrollToTop() {
  const [showUp, setShowUp] = useState(false);
  const [showDown, setShowDown] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      setShowUp(scrollY > 400);
      setShowDown(scrollY + windowHeight < docHeight - 100);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const scrollToBottom = () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });

  const btnStyle = {
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
  };

  return (
    <div style={{ position: "fixed", bottom: "32px", right: "24px", zIndex: 50, display: "flex", flexDirection: "column", gap: "10px" }}>
      {showUp && (
        <button onClick={scrollToTop} style={btnStyle} title="Scroll to top"
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#6d28d9"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#7c3aed"; e.currentTarget.style.transform = "translateY(0)"; }}>
          <FiArrowUp />
        </button>
      )}
      {showDown && (
        <button onClick={scrollToBottom} style={btnStyle} title="Scroll to bottom"
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#6d28d9"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#7c3aed"; e.currentTarget.style.transform = "translateY(0)"; }}>
          <FiArrowDown />
        </button>
      )}
    </div>
  );
}