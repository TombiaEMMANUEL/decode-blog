
"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { FiBell } from "react-icons/fi";
import { db } from "@/lib/firebaseClient";
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy } from "firebase/firestore";
import { useSession, signOut } from "next-auth/react";
import { FiUser, FiLogOut, FiEdit, FiSearch, FiMenu, FiX, FiBook, FiChevronDown } from "react-icons/fi";

const navItems = [
  { name: "Home", url: "/" },
  { name: "Blog", url: "/blog" },
  { name: "Learn", url: "/learn" },
  { name: "About", url: "/about" },
];

const Navbar = () => {
  const [showNav, setShowNav] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { data: session } = useSession();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
  if (!session?.user?.id) return;
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", session.user.id),
    orderBy("createdAt", "desc")
  );
  const unsubscribe = onSnapshot(q, (snap) => {
    setNotifications(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
  return () => unsubscribe();
}, [session]);

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchTerm.trim())}`;
    }
  };

  const markAllRead = async () => {
  const unread = notifications.filter((n) => !n.read);
  for (const n of unread) {
    await updateDoc(doc(db, "notifications", n.id), { read: true });
  }
};

  return (
    <>
      <div style={{ position: "fixed", top: "16px", left: 0, right: 0, zIndex: 50, display: "flex", justifyContent: "center", padding: "0 16px" }}>
        <nav style={{ width: "100%", maxWidth: "900px", borderRadius: "16px", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: scrolled ? "rgba(15,10,30,0.97)" : "rgba(15,10,30,0.85)", backdropFilter: "blur(12px)", border: "1px solid rgba(139,92,246,0.25)", boxShadow: scrolled ? "0 0 30px rgba(139,92,246,0.15)" : "none", transition: "all 0.3s ease" }}>

          {/* LOGO */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", flexShrink: 0 }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: "14px" }}>D</div>
            <span style={{ color: "white", fontWeight: 700, fontSize: "18px", letterSpacing: "-0.5px" }}>Decode</span>
          </Link>

          {/* DESKTOP NAV ITEMS */}
          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              {navItems.map((item) => (
                <Link key={item.name} href={item.url}
                  style={{ color: "#9ca3af", padding: "8px 14px", borderRadius: "10px", fontSize: "14px", fontWeight: 500, textDecoration: "none", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.target.style.color = "white"; e.target.style.backgroundColor = "rgba(139,92,246,0.2)"; }}
                  onMouseLeave={(e) => { e.target.style.color = "#9ca3af"; e.target.style.backgroundColor = "transparent"; }}>
                  {item.name}
                </Link>
              ))}
            </div>
          )}

          {/* DESKTOP RIGHT */}
          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {/* NOTIFICATIONS */}
              {session && (
                <div style={{ position: "relative" }}>
                  <button onClick={() => { setShowNotifications(!showNotifications); markAllRead(); }}
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#9ca3af", width: "36px", height: "36px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "16px", position: "relative" }}>
                    <FiBell />
                    {unreadCount > 0 && (
                      <span style={{ position: "absolute", top: "-6px", right: "-6px", backgroundColor: "#ef4444", color: "white", borderRadius: "50%", width: "18px", height: "18px", fontSize: "10px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, backgroundColor: "rgba(15,10,30,0.98)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: "16px", padding: "8px", width: "320px", boxShadow: "0 8px 32px rgba(0,0,0,0.4)", zIndex: 60, maxHeight: "400px", overflowY: "auto" }}>
                      <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <p style={{ color: "white", fontSize: "14px", fontWeight: 600 }}>Notifications</p>
                        {unreadCount > 0 && (
                          <span style={{ color: "#a78bfa", fontSize: "12px" }}>{unreadCount} unread</span>
                        )}
                      </div>
                      {notifications.length === 0 ? (
                        <div style={{ padding: "24px", textAlign: "center", color: "#6b7280", fontSize: "14px" }}>
                          No notifications yet
                        </div>
                      ) : (
                        notifications.slice(0, 10).map((n) => (
                          <Link key={n.id} href={`/blog/${n.postSlug}`} onClick={() => setShowNotifications(false)} style={{ textDecoration: "none" }}>
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "10px 12px", borderRadius: "10px", backgroundColor: n.read ? "transparent" : "rgba(139,92,246,0.08)", marginBottom: "4px", transition: "all 0.2s" }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(139,92,246,0.12)"}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = n.read ? "transparent" : "rgba(139,92,246,0.08)"}>
                              {n.fromImage && <img src={n.fromImage} alt={n.fromUser} style={{ width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0 }} />}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ color: "white", fontSize: "13px", lineHeight: 1.4 }}>{n.message}</p>
                                <p style={{ color: "#6b7280", fontSize: "11px", marginTop: "4px" }}>
                                  {n.createdAt?.toDate ? new Date(n.createdAt.toDate()).toLocaleDateString() : "Just now"}
                                </p>
                              </div>
                              {!n.read && (
                                <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#7c3aed", flexShrink: 0, marginTop: "4px" }} />
                              )}
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* SEARCH */}
<div style={{ display: "flex", alignItems: "center", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "8px 12px", borderRadius: "10px", width: "160px" }}></div>
              <div style={{ display: "flex", alignItems: "center", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "8px 12px", borderRadius: "10px", width: "160px" }}>
                <FiSearch style={{ color: "#6b7280", marginRight: "8px", fontSize: "14px" }} />
                <input type="text" placeholder="Search..." style={{ background: "transparent", border: "none", outline: "none", color: "#d1d5db", fontSize: "13px", width: "100%" }}
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={handleSearch} />
              </div>

              {session ? (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Link href="/write" style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#7c3aed", color: "white", padding: "8px 16px", borderRadius: "10px", fontSize: "14px", fontWeight: 500, textDecoration: "none", whiteSpace: "nowrap" }}>
                    <FiEdit style={{ fontSize: "13px" }} />
                    Write
                  </Link>
                  <div ref={dropdownRef} style={{ position: "relative" }}>
                    <button onClick={() => setShowDropdown(!showDropdown)}
                      style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "6px 10px", cursor: "pointer" }}>
                      <img src={session.user.image} alt={session.user.name} style={{ width: "26px", height: "26px", borderRadius: "50%", objectFit: "cover" }} />
                      <FiChevronDown style={{ color: "#9ca3af", fontSize: "13px" }} />
                    </button>
                    {showDropdown && (
                      <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, backgroundColor: "rgba(15,10,30,0.98)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: "12px", padding: "8px", minWidth: "180px", boxShadow: "0 8px 32px rgba(0,0,0,0.4)", zIndex: 60 }}>
                        <div style={{ padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: "6px" }}>
                          <p style={{ color: "white", fontSize: "13px", fontWeight: 600 }}>{session.user.name}</p>
                          <p style={{ color: "#6b7280", fontSize: "11px", marginTop: "2px" }}>{session.user.email}</p>
                        </div>
                        {[
                          { href: `/profile/${session.user.id}`, icon: FiUser, label: "My Profile" },
                          { href: "/create-course", icon: FiBook, label: "Create Course" },
                        ].map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link key={item.label} href={item.href} onClick={() => setShowDropdown(false)}
                              style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", color: "#d1d5db", fontSize: "13px", textDecoration: "none", transition: "all 0.2s" }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(139,92,246,0.15)"; e.currentTarget.style.color = "white"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#d1d5db"; }}>
                              <Icon style={{ fontSize: "14px" }} />
                              {item.label}
                            </Link>
                          );
                        })}
                        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: "6px", paddingTop: "6px" }}>
                          <button onClick={() => signOut()}
                            style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", color: "#f87171", fontSize: "13px", background: "none", border: "none", cursor: "pointer", width: "100%", transition: "all 0.2s" }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.1)"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                            <FiLogOut style={{ fontSize: "14px" }} />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <Link href="/auth/signin" style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#7c3aed", color: "white", padding: "8px 20px", borderRadius: "10px", fontSize: "14px", fontWeight: 500, textDecoration: "none" }}>
                  <FiUser style={{ fontSize: "13px" }} />
                  Get Started
                </Link>
              )}
            </div>
          )}

          {/* MOBILE MENU BUTTON */}
          {isMobile && (
            <button style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "22px", padding: "4px" }} onClick={() => setShowNav(!showNav)}>
              {showNav ? <FiX /> : <FiMenu />}
            </button>
          )}
        </nav>
      </div>

      {/* MOBILE MENU */}
      {isMobile && showNav && (
        <div style={{ position: "fixed", top: "80px", left: "16px", right: "16px", zIndex: 40, backgroundColor: "rgba(15,10,30,0.98)", backdropFilter: "blur(12px)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "14px", boxShadow: "0 0 40px rgba(139,92,246,0.2)" }}>

          {/* MOBILE SEARCH */}
          <div style={{ display: "flex", alignItems: "center", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "10px 14px", borderRadius: "10px" }}>
            <FiSearch style={{ color: "#6b7280", marginRight: "8px" }} />
            <input type="text" placeholder="Search..." style={{ background: "transparent", border: "none", outline: "none", color: "#d1d5db", fontSize: "14px", width: "100%" }}
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={handleSearch} />
          </div>

          {/* MOBILE NAV LINKS */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {navItems.map((item) => (
              <Link key={item.name} href={item.url}
                style={{ color: "#9ca3af", padding: "12px 16px", borderRadius: "10px", fontWeight: 500, textDecoration: "none", fontSize: "15px" }}
                onClick={() => setShowNav(false)}>
                {item.name}
              </Link>
            ))}
          </div>

          {/* MOBILE AUTH */}
          {session ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px" }}>
                <img src={session.user.image} alt={session.user.name} style={{ width: "32px", height: "32px", borderRadius: "50%" }} />
                <div>
                  <p style={{ color: "white", fontSize: "13px", fontWeight: 600 }}>{session.user.name}</p>
                  <p style={{ color: "#6b7280", fontSize: "11px" }}>{session.user.email}</p>
                </div>
              </div>
              {[
                { href: `/profile/${session.user.id}`, icon: FiUser, label: "My Profile", style: { backgroundColor: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "white" } },
                { href: "/create-course", icon: FiBook, label: "Create Course", style: { backgroundColor: "transparent", border: "1px solid rgba(139,92,246,0.3)", color: "#a78bfa" } },
                { href: "/write", icon: FiEdit, label: "Write", style: { backgroundColor: "#7c3aed", border: "none", color: "white" } },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.label} href={item.href}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", borderRadius: "10px", fontWeight: 500, textDecoration: "none", fontSize: "14px", ...item.style }}
                    onClick={() => setShowNav(false)}>
                    <Icon />
                    {item.label}
                  </Link>
                );
              })}
              <button onClick={() => signOut()}
                style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", padding: "12px", borderRadius: "10px", fontWeight: 500, fontSize: "15px" }}>
                Logout
              </button>
            </div>
          ) : (
            <Link href="/auth/signin"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", backgroundColor: "#7c3aed", color: "white", padding: "12px", borderRadius: "10px", fontWeight: 500, textDecoration: "none" }}
              onClick={() => setShowNav(false)}>
              <FiUser />
              Get Started
            </Link>
          )}
        </div>
      )}

      <div style={{ height: "80px" }} />
    </>
  );
};

export default Navbar;