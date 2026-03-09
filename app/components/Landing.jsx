"use client";
import { useState, useEffect } from "react";
const FLOATING_ALBUMS = [
  { bg: "linear-gradient(135deg, #4a7c59, #2d5a3f)", x: 8, y: 12, size: 120, delay: 0 },
  { bg: "linear-gradient(135deg, #c41e3a, #7a1225)", x: 78, y: 8, size: 100, delay: 1.2 },
  { bg: "linear-gradient(135deg, #6a0dad, #3a0870)", x: 22, y: 72, size: 90, delay: 0.6 },
  { bg: "linear-gradient(135deg, #d4a017, #9a7010)", x: 85, y: 65, size: 110, delay: 1.8 },
  { bg: "linear-gradient(135deg, #4169e1, #2040a0)", x: 52, y: 85, size: 80, delay: 2.4 },
  { bg: "linear-gradient(135deg, #1a1a2e, #0d0d1a)", x: 35, y: 18, size: 95, delay: 0.3 },
  { bg: "linear-gradient(135deg, #cc8830, #8a5820)", x: 65, y: 40, size: 85, delay: 1.5 },
  { bg: "linear-gradient(135deg, #708090, #4a5a6a)", x: 12, y: 45, size: 75, delay: 2.1 },
  { bg: "linear-gradient(135deg, #ff4500, #cc2200)", x: 90, y: 35, size: 70, delay: 0.9 },
  { bg: "linear-gradient(135deg, #90ee90, #5aaa5a)", x: 45, y: 55, size: 65, delay: 3.0 },
  { bg: "linear-gradient(135deg, #b8860b, #7a5a08)", x: 5, y: 88, size: 100, delay: 1.0 },
  { bg: "linear-gradient(135deg, #ffb6c1, #cc8090)", x: 72, y: 82, size: 75, delay: 2.7 },
];
export default function Landing() {
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(null);
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 100); return () => clearTimeout(t); }, []);
  return (
    <div style={{ width: "100%", height: "100vh", background: "#050507", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.035, pointerEvents: "none", backgroundImage: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"256\" height=\"256\"><filter id=\"n\"><feTurbulence baseFrequency=\"0.85\" numOctaves=\"4\"/><feColorMatrix type=\"saturate\" values=\"0\"/></filter><rect width=\"256\" height=\"256\" filter=\"url(%23n)\"/></svg>')" }} />
      {FLOATING_ALBUMS.map((album, i) => (<div key={i} style={{ position: "absolute", left: `${album.x}%`, top: `${album.y}%`, width: album.size, height: album.size, background: album.bg, opacity: loaded ? 0.06 : 0, transform: loaded ? `translate(-50%, -50%) rotate(${(i % 2 === 0 ? 1 : -1) * (3 + i * 1.5)}deg)` : "translate(-50%, -50%) scale(0.8)", transition: `all 1.8s cubic-bezier(0.23, 1, 0.32, 1) ${album.delay}s`, borderRadius: 4, pointerEvents: "none" }} />))}
      <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%, -50%)", width: 800, height: 800, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.015) 0%, transparent 60%)", pointerEvents: "none" }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 10, opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(20px)", transition: "all 1.2s cubic-bezier(0.23, 1, 0.32, 1) 0.3s" }}>
        <div style={{ fontSize: 52, fontWeight: 700, letterSpacing: 18, color: "rgba(255,255,255,0.9)", fontFamily: "'Space Mono', monospace", marginBottom: 24, textShadow: "0 0 60px rgba(255,255,255,0.08)" }}>BACKTRACK</div>
        <div style={{ width: 50, height: 1, background: "rgba(255,255,255,0.15)", marginBottom: 28, opacity: loaded ? 1 : 0, transform: loaded ? "scaleX(1)" : "scaleX(0)", transition: "all 1s ease 0.8s" }} />
        <div style={{ fontSize: 18, fontWeight: 300, color: "rgba(255,255,255,0.5)", letterSpacing: 1, marginBottom: 60, textAlign: "center", maxWidth: 400, lineHeight: 1.6, opacity: loaded ? 1 : 0, transition: "all 1s ease 1s" }}>Music was meant to be chosen, not fed to you.</div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, opacity: loaded ? 1 : 0, transition: "all 1s ease 1.3s" }}>
          <button onClick={() => { window.location.href = "/api/auth/login"; }} onMouseEnter={() => setHovered("spotify")} onMouseLeave={() => setHovered(null)} style={{ width: 280, padding: "14px 0", background: hovered === "spotify" ? "#1ed760" : "rgba(30, 215, 96, 0.9)", border: "none", borderRadius: 32, color: "#000", fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", letterSpacing: 0.5, cursor: "pointer", transition: "all 0.3s ease", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: hovered === "spotify" ? "0 0 30px rgba(30, 215, 96, 0.3), 0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.3)", transform: hovered === "spotify" ? "scale(1.02)" : "scale(1)", outline: "none" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
            Sign in with Spotify
          </button>
          <button onMouseEnter={() => setHovered("signin")} onMouseLeave={() => setHovered(null)} style={{ width: 280, padding: "12px 0", background: "transparent", border: `1px solid ${hovered === "signin" ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.12)"}`, borderRadius: 32, color: hovered === "signin" ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.3s ease", outline: "none" }}>Sign In</button>
          <button onMouseEnter={() => setHovered("demo")} onMouseLeave={() => setHovered(null)} style={{ width: 280, padding: "12px 0", background: "transparent", border: "none", color: hovered === "demo" ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)", fontSize: 12, fontWeight: 500, fontFamily: "'Space Mono', monospace", letterSpacing: 2, cursor: "pointer", transition: "all 0.3s ease", outline: "none", textDecoration: hovered === "demo" ? "underline" : "none", textUnderlineOffset: 4 }}>EXPLORE DEMO</button>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.08)", fontSize: 9, letterSpacing: 3, fontFamily: "'Space Mono', monospace", opacity: loaded ? 1 : 0, transition: "all 1s ease 2s" }}>A DIGITAL RITUAL FOR INTENTIONAL LISTENING</div>
    </div>
  );
}
