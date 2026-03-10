"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import AlbumArt, { getEraFormat, getEraLabel } from "./AlbumArt";
import { CDPlayerAnimation, VinylTurntableAnimation, CassettePlayerAnimation, StreamingAnimation } from "./PlayAnimations";
import { TurntablePlaying, CDPlayerPlaying, WalkmanPlaying } from "./NowPlayingDevices";
import ModernView from "./ModernView";

function formatMs(ms) {
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

// ─── SAMPLE ALBUMS ACROSS ALL ERAS ───
const DEMO_ALBUMS = {
  1969: [{
    id: "abbey-road", title: "Abbey Road", artist: "The Beatles",
    cover: "https://i.scdn.co/image/ab67616d0000b273dc30583ba717007b00cceb25",
    uri: "spotify:album:0ETFjACtuP2ADo6LFhL6HN", totalTracks: 17,
    tracks: [
      { id: "t1", name: "Come Together", number: 1, duration: 259000, uri: "t1" },
      { id: "t2", name: "Something", number: 2, duration: 182000, uri: "t2" },
      { id: "t3", name: "Maxwell's Silver Hammer", number: 3, duration: 207000, uri: "t3" },
      { id: "t4", name: "Oh! Darling", number: 4, duration: 207000, uri: "t4" },
      { id: "t5", name: "Octopus's Garden", number: 5, duration: 171000, uri: "t5" },
      { id: "t6", name: "Here Comes the Sun", number: 6, duration: 185000, uri: "t6" },
    ],
  }],
  1971: [{
    id: "whats-going-on", title: "What's Going On", artist: "Marvin Gaye",
    cover: "https://i.scdn.co/image/ab67616d0000b273922a72840ccc4a93080ee1da",
    uri: "spotify:album:2v6ANhWhZBUKkg6pJJBs3B", totalTracks: 9,
    tracks: [
      { id: "t7", name: "What's Going On", number: 1, duration: 233000, uri: "t7" },
      { id: "t8", name: "What's Happening Brother", number: 2, duration: 175000, uri: "t8" },
      { id: "t9", name: "Mercy Mercy Me", number: 3, duration: 210000, uri: "t9" },
      { id: "t10", name: "Inner City Blues", number: 4, duration: 214000, uri: "t10" },
    ],
  }],
  1977: [{
    id: "rumours", title: "Rumours", artist: "Fleetwood Mac",
    cover: "https://i.scdn.co/image/ab67616d0000b273e52a59a28efa4773dd2bfe1b",
    uri: "spotify:album:1bt6q2SruMsBtcerNVtpZB", totalTracks: 11,
    tracks: [
      { id: "t11", name: "Dreams", number: 1, duration: 254000, uri: "t11" },
      { id: "t12", name: "Go Your Own Way", number: 2, duration: 217000, uri: "t12" },
      { id: "t13", name: "The Chain", number: 3, duration: 270000, uri: "t13" },
      { id: "t14", name: "Don't Stop", number: 4, duration: 195000, uri: "t14" },
      { id: "t15", name: "Gold Dust Woman", number: 5, duration: 290000, uri: "t15" },
    ],
  }],
  1980: [{
    id: "back-in-black", title: "Back in Black", artist: "AC/DC",
    cover: "https://i.scdn.co/image/ab67616d0000b2734a052b99c042dc15f933145b",
    uri: "spotify:album:6mUdeDZCsEXnCCFt12oXbZ", totalTracks: 10,
    tracks: [
      { id: "t16", name: "Hells Bells", number: 1, duration: 312000, uri: "t16" },
      { id: "t17", name: "Shoot to Thrill", number: 2, duration: 317000, uri: "t17" },
      { id: "t18", name: "Back in Black", number: 3, duration: 255000, uri: "t18" },
      { id: "t19", name: "You Shook Me All Night Long", number: 4, duration: 210000, uri: "t19" },
    ],
  }],
  1982: [{
    id: "thriller", title: "Thriller", artist: "Michael Jackson",
    cover: "https://i.scdn.co/image/ab67616d0000b2734121faee8df82c526cbab2be",
    uri: "spotify:album:2ANVost0y2y52ema1E9xAZ", totalTracks: 9,
    tracks: [
      { id: "t20", name: "Wanna Be Startin' Somethin'", number: 1, duration: 363000, uri: "t20" },
      { id: "t21", name: "Thriller", number: 2, duration: 358000, uri: "t21" },
      { id: "t22", name: "Beat It", number: 3, duration: 258000, uri: "t22" },
      { id: "t23", name: "Billie Jean", number: 4, duration: 294000, uri: "t23" },
    ],
  }],
  1991: [{
    id: "nevermind", title: "Nevermind", artist: "Nirvana",
    cover: "https://i.scdn.co/image/ab67616d0000b2731b6e7b446e0a4ef993d2af12",
    uri: "spotify:album:2UJcKiJxNryhL050F5Z1Fk", totalTracks: 12,
    tracks: [
      { id: "t24", name: "Smells Like Teen Spirit", number: 1, duration: 301000, uri: "t24" },
      { id: "t25", name: "In Bloom", number: 2, duration: 254000, uri: "t25" },
      { id: "t26", name: "Come as You Are", number: 3, duration: 219000, uri: "t26" },
      { id: "t27", name: "Lithium", number: 4, duration: 257000, uri: "t27" },
    ],
  }],
  1995: [{
    id: "mellon-collie", title: "Mellon Collie and the Infinite Sadness", artist: "The Smashing Pumpkins",
    cover: "https://i.scdn.co/image/ab67616d0000b273547a92fbbe2e31206a1894e7",
    uri: "spotify:album:55RhFRyQFihIyGjLRm119t", totalTracks: 28,
    tracks: [
      { id: "t28", name: "Tonight, Tonight", number: 1, duration: 255000, uri: "t28" },
      { id: "t29", name: "Bullet with Butterfly Wings", number: 2, duration: 257000, uri: "t29" },
      { id: "t30", name: "1979", number: 3, duration: 264000, uri: "t30" },
      { id: "t31", name: "Zero", number: 4, duration: 161000, uri: "t31" },
    ],
  }],
  1999: [{
    id: "slim-shady", title: "The Slim Shady LP", artist: "Eminem",
    cover: "https://i.scdn.co/image/ab67616d0000b273469fec25fcd39a12e2cad430",
    uri: "spotify:album:3JBgJmGVtRBCfSJaRbFn9B", totalTracks: 20,
    tracks: [
      { id: "t32", name: "My Name Is", number: 1, duration: 268000, uri: "t32" },
      { id: "t33", name: "Guilty Conscience", number: 2, duration: 201000, uri: "t33" },
      { id: "t34", name: "Brain Damage", number: 3, duration: 224000, uri: "t34" },
      { id: "t35", name: "Role Model", number: 4, duration: 210000, uri: "t35" },
    ],
  }],
  2003: [{
    id: "get-rich", title: "Get Rich or Die Tryin'", artist: "50 Cent",
    cover: "https://i.scdn.co/image/ab67616d0000b2731ec66ef0ee826866b tried.jpg",
    uri: "spotify:album:7bCR0w2MWMNia3Ywxi1xS0", totalTracks: 19,
    tracks: [
      { id: "t36", name: "In Da Club", number: 1, duration: 193000, uri: "t36" },
      { id: "t37", name: "Many Men", number: 2, duration: 249000, uri: "t37" },
      { id: "t38", name: "21 Questions", number: 3, duration: 260000, uri: "t38" },
      { id: "t39", name: "P.I.M.P.", number: 4, duration: 227000, uri: "t39" },
    ],
  }],
  2010: [{
    id: "recovery", title: "Recovery", artist: "Eminem",
    cover: "https://i.scdn.co/image/ab67616d0000b273c08d5fa5c0f1a834acef5100",
    uri: "spotify:album:47BiFcV59TQi2s9SkBo2pb", totalTracks: 17,
    tracks: [
      { id: "t40", name: "Not Afraid", number: 1, duration: 248000, uri: "t40" },
      { id: "t41", name: "Love the Way You Lie", number: 2, duration: 263000, uri: "t41" },
      { id: "t42", name: "No Love", number: 3, duration: 290000, uri: "t42" },
      { id: "t43", name: "Space Bound", number: 4, duration: 273000, uri: "t43" },
    ],
  }],
  2019: [{
    id: "igor", title: "IGOR", artist: "Tyler, The Creator",
    cover: "https://i.scdn.co/image/ab67616d0000b273b1f1c1f1c1f1c1f1c1f1c1f1",
    uri: "spotify:album:5zi7WsKlIiUXv09tbGLKsE", totalTracks: 12,
    tracks: [
      { id: "t44", name: "IGOR'S THEME", number: 1, duration: 190000, uri: "t44" },
      { id: "t45", name: "EARFQUAKE", number: 2, duration: 190000, uri: "t45" },
      { id: "t46", name: "I THINK", number: 3, duration: 210000, uri: "t46" },
      { id: "t47", name: "NEW MAGIC WAND", number: 4, duration: 195000, uri: "t47" },
    ],
  }],
  2022: [{
    id: "midnights", title: "Midnights", artist: "Taylor Swift",
    cover: "https://i.scdn.co/image/ab67616d0000b273bb54dde68cd23e2a268ae0f5",
    uri: "spotify:album:151w1FgRZfnKZA9FEcg9Z3", totalTracks: 13,
    tracks: [
      { id: "t48", name: "Lavender Haze", number: 1, duration: 202000, uri: "t48" },
      { id: "t49", name: "Anti-Hero", number: 2, duration: 200000, uri: "t49" },
      { id: "t50", name: "Midnight Rain", number: 3, duration: 174000, uri: "t50" },
      { id: "t51", name: "Karma", number: 4, duration: 204000, uri: "t51" },
    ],
  }],
};

// ─── MODE TOGGLE ───
function ModeToggle({ mode, onToggle }) {
  return (
    <div onClick={onToggle} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "5px 14px", borderRadius: 20, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", transition: "all 0.3s ease", position: "relative", zIndex: 50 }}>
      <div style={{ fontSize: 9, letterSpacing: 2, fontFamily: "'Space Mono', monospace", fontWeight: 600, color: mode === "throwback" ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.25)", transition: "color 0.3s ease" }}>THROWBACK</div>
      <div style={{ width: 32, height: 16, borderRadius: 8, background: mode === "throwback" ? "rgba(255,200,100,0.3)" : "rgba(100,200,255,0.3)", position: "relative", transition: "background 0.3s ease" }}>
        <div style={{ position: "absolute", top: 2, left: mode === "throwback" ? 2 : 16, width: 12, height: 12, borderRadius: "50%", background: mode === "throwback" ? "#ffcc66" : "#66ccff", transition: "all 0.3s cubic-bezier(0.23, 1, 0.32, 1)", boxShadow: `0 0 6px ${mode === "throwback" ? "rgba(255,200,100,0.4)" : "rgba(100,200,255,0.4)"}` }} />
      </div>
      <div style={{ fontSize: 9, letterSpacing: 2, fontFamily: "'Space Mono', monospace", fontWeight: 600, color: mode === "modern" ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.25)", transition: "color 0.3s ease" }}>MODERN</div>
    </div>
  );
}

export default function DemoTimeline() {
  const [yearIndex, setYearIndex] = useState(0);
  const [albumIndex, setAlbumIndex] = useState(0);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [playState, setPlayState] = useState("browsing");
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [trackList, setTrackList] = useState([]);
  const [mode, setMode] = useState("throwback");
  const containerRef = useRef(null);
  const touchStart = useRef({ x: 0, y: 0 });
  const lastScroll = useRef(0);
  const progressInterval = useRef(null);

  const albums = DEMO_ALBUMS;
  const allYears = Object.keys(albums).map(Number).sort((a, b) => a - b);
  const selectedYear = allYears[yearIndex];
  const yearAlbums = albums[selectedYear] || [];
  const selectedAlbum = yearAlbums[albumIndex];
  const format = selectedYear ? getEraFormat(selectedYear) : "cd";
  const isIpodEra = format === "ipod";

  useEffect(() => { setAlbumIndex(0); }, [yearIndex]);

  // Simulated playback timer
  useEffect(() => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    if ((playState === "playing" || playState === "ipod") && !isPaused && duration > 0) {
      progressInterval.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= duration) { setIsPaused(true); return duration; }
          return prev + 1000;
        });
      }, 1000);
    }
    return () => { if (progressInterval.current) clearInterval(progressInterval.current); };
  }, [playState, isPaused, duration]);

  const throttledNav = useCallback((action) => { const now = Date.now(); if (now - lastScroll.current < 280) return; lastScroll.current = now; action(); }, []);
  const navYear = useCallback((dir) => { throttledNav(() => setYearIndex(prev => Math.max(0, Math.min(allYears.length - 1, prev + dir)))); }, [throttledNav, allYears.length]);
  const navAlbum = useCallback((dir) => { throttledNav(() => setAlbumIndex(prev => { const len = yearAlbums.length; return len === 0 ? 0 : (prev + dir + len) % len; })); }, [throttledNav, yearAlbums.length]);

  useEffect(() => {
    const h = (e) => { if (mode !== "throwback" || showYearPicker || playState !== "browsing") return; if (e.key === "ArrowLeft") navYear(-1); if (e.key === "ArrowRight") navYear(1); if (e.key === "ArrowUp") { e.preventDefault(); navAlbum(-1); } if (e.key === "ArrowDown") { e.preventDefault(); navAlbum(1); } };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [navYear, navAlbum, showYearPicker, playState, mode]);

  useEffect(() => {
    const el = containerRef.current;
    const h = (e) => { if (mode !== "throwback" || showYearPicker || playState !== "browsing") return; e.preventDefault(); if (Math.abs(e.deltaX) > Math.abs(e.deltaY) + 3) navYear(e.deltaX > 0 ? 1 : -1); else if (Math.abs(e.deltaY) > Math.abs(e.deltaX) + 3) navAlbum(e.deltaY > 0 ? 1 : -1); else navYear(e.deltaY > 0 ? 1 : -1); };
    if (el) el.addEventListener("wheel", h, { passive: false }); return () => { if (el) el.removeEventListener("wheel", h); };
  }, [navYear, navAlbum, showYearPicker, playState, mode]);

  const handleTouchStart = (e) => { touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const handleTouchEnd = (e) => { const dx = touchStart.current.x - e.changedTouches[0].clientX; const dy = touchStart.current.y - e.changedTouches[0].clientY; if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) navYear(dx > 0 ? 1 : -1); else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 40) navAlbum(dy > 0 ? 1 : -1); };

  const visibleYears = [];
  for (let i = -3; i <= 3; i++) { const idx = yearIndex + i; if (idx >= 0 && idx < allYears.length) visibleYears.push({ year: allYears[idx], offset: i }); }

  // ─── DEMO PLAYBACK ───
  const startDemoPlay = (album, trackIdx = 0) => {
    const tracks = album.tracks || [];
    setTrackList(tracks);
    setCurrentTrackIndex(trackIdx);
    setDuration(tracks[trackIdx]?.duration || 200000);
    setProgress(0);
    setIsPaused(false);
  };

  const handlePlayAlbum = () => {
    if (!selectedAlbum) return;
    if (isIpodEra) {
      setPlayState("animating");
      setTimeout(() => { startDemoPlay(selectedAlbum); setPlayState("ipod"); }, 800);
    } else {
      setPlayState("animating");
    }
  };

  const handleAnimationComplete = () => {
    if (!selectedAlbum) return;
    startDemoPlay(selectedAlbum);
    setPlayState("playing");
  };

  const handleIpodPlayTrack = (trackUri, index) => {
    if (!selectedAlbum) return;
    startDemoPlay(selectedAlbum, index);
  };
  const handleTogglePlay = () => setIsPaused(prev => !prev);
  const handleNextTrack = () => {
    if (trackList.length === 0) return;
    const next = (currentTrackIndex + 1) % trackList.length;
    setCurrentTrackIndex(next);
    setDuration(trackList[next]?.duration || 200000);
    setProgress(0);
    setIsPaused(false);
  };
  const handlePrevTrack = () => {
    if (trackList.length === 0) return;
    const prev = (currentTrackIndex - 1 + trackList.length) % trackList.length;
    setCurrentTrackIndex(prev);
    setDuration(trackList[prev]?.duration || 200000);
    setProgress(0);
    setIsPaused(false);
  };
  const handlePlayTrack = (trackUri, index) => {
    setCurrentTrackIndex(index);
    setDuration(trackList[index]?.duration || 200000);
    setProgress(0);
    setIsPaused(false);
  };
  const handleBack = () => { setPlayState("browsing"); setProgress(0); setIsPaused(true); };

  const noise = "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"256\" height=\"256\"><filter id=\"n\"><feTurbulence baseFrequency=\"0.85\" numOctaves=\"4\"/><feColorMatrix type=\"saturate\" values=\"0\"/></filter><rect width=\"256\" height=\"256\" filter=\"url(%23n)\"/></svg>')";
  const noiseBg = <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: noise, pointerEvents: "none" }} />;
  const backBtn = <div onClick={handleBack} style={{ position: "absolute", top: 28, left: 28, zIndex: 50, color: "rgba(255,255,255,0.3)", fontSize: 10, letterSpacing: 2, fontFamily: "'Space Mono', monospace", cursor: "pointer", padding: "6px 14px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)" }}>← BACK</div>;

  // ─── DEMO BANNER ───
  const demoBanner = <div style={{ position: "absolute", bottom: 80, left: "50%", transform: "translateX(-50%)", zIndex: 60, background: "rgba(255,200,50,0.15)", border: "1px solid rgba(255,200,50,0.3)", borderRadius: 20, padding: "6px 20px", fontSize: 10, color: "rgba(255,200,50,0.7)", fontFamily: "'Space Mono', monospace", letterSpacing: 2 }}>DEMO MODE — VISUAL PREVIEW ONLY</div>;

  // ═══ MODERN MODE ═══
  if (mode === "modern") {
    const handleModernStart = async (uri, did) => {
      const yearKeys = Object.keys(albums);
      for (const y of yearKeys) { const found = albums[y].find(a => a.uri === uri); if (found) { startDemoPlay(found); return; } }
    };
    const handleModernTrack = async (uri, did, trackUri) => {
      const yearKeys = Object.keys(albums);
      for (const y of yearKeys) { const found = albums[y].find(a => a.uri === uri); if (found) { const idx = found.tracks?.findIndex(t => t.uri === trackUri); startDemoPlay(found, idx >= 0 ? idx : 0); return; } }
    };
    return (
      <div style={{ width: "100%", height: "100vh", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 40, padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(180deg, rgba(10,10,12,1) 0%, rgba(10,10,12,0.95) 70%, transparent 100%)" }}>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, letterSpacing: 6, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>BACKTRACK</div>
          <ModeToggle mode={mode} onToggle={() => { setMode("throwback"); setPlayState("browsing"); }} />
          <div onClick={() => { window.location.href = "/"; }} style={{ color: "rgba(255,255,255,0.2)", fontSize: 9, letterSpacing: 2, fontFamily: "'Space Mono', monospace", cursor: "pointer", padding: "6px 12px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.06)", transition: "all 0.2s ease" }} onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }} onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.2)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}>EXIT DEMO</div>
        </div>
        <ModernView albums={albums} deviceId="demo" player={null} onPlayTrack={handleModernTrack} onStartPlayback={handleModernStart} isPaused={isPaused} progress={progress} duration={duration} currentTrackIndex={currentTrackIndex} trackList={trackList} onTogglePlay={handleTogglePlay} onNextTrack={handleNextTrack} onPrevTrack={handlePrevTrack} />
        {demoBanner}
      </div>
    );
  }

  // ═══ THROWBACK: ANIMATION ═══
  if (playState === "animating" && !isIpodEra) {
    return (
      <div style={{ width: "100%", height: "100vh", background: "#070709", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", fontFamily: "'DM Sans', sans-serif" }}>
        {noiseBg}
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, letterSpacing: 6, fontWeight: 700, fontFamily: "'Space Mono', monospace", marginBottom: 30 }}>BACKTRACK</div>
        {format === "cd" && <CDPlayerAnimation album={selectedAlbum} onComplete={handleAnimationComplete} />}
        {format === "vinyl" && <VinylTurntableAnimation album={selectedAlbum} onComplete={handleAnimationComplete} />}
        {format === "cassette" && <CassettePlayerAnimation album={selectedAlbum} onComplete={handleAnimationComplete} />}
        {format === "streaming" && <StreamingAnimation album={selectedAlbum} onComplete={handleAnimationComplete} />}
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 16, fontWeight: 700 }}>{selectedAlbum?.title}</div>
          <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 4 }}>{selectedAlbum?.artist} — {selectedYear}</div>
        </div>
      </div>
    );
  }

  // ═══ THROWBACK: iPod ═══
  if (playState === "ipod" || (playState === "animating" && isIpodEra)) {
    const ipodProps = { onPlayTrack: handleIpodPlayTrack, onTogglePlay: handleTogglePlay, onNextTrack: handleNextTrack, onPrevTrack: handlePrevTrack, isPaused, progress, duration, currentTrackIndex, isPlaying: playState === "ipod" };
    return (
      <div style={{ width: "100%", height: "100vh", background: "#070709", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", fontFamily: "'DM Sans', sans-serif" }}>
        {noiseBg}{backBtn}
        <div style={{ animation: "ipodSlideUp 0.6s cubic-bezier(0.23, 1, 0.32, 1)" }}>
          <AlbumArt album={selectedAlbum} year={selectedYear} size={280} ipodProps={ipodProps} />
        </div>
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 17, fontWeight: 700 }}>{selectedAlbum?.title}</div>
          <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 4 }}>{selectedAlbum?.artist} — {selectedYear}</div>
        </div>
        {demoBanner}
        <style>{`@keyframes ipodSlideUp { from { opacity: 0; transform: translateY(40px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }`}</style>
      </div>
    );
  }

  // ═══ THROWBACK: NOW PLAYING ═══
  if (playState === "playing") {
    const renderDevice = () => {
      if (format === "vinyl") return <TurntablePlaying album={selectedAlbum} size={300} />;
      if (format === "cd") return <CDPlayerPlaying album={selectedAlbum} size={300} />;
      if (format === "cassette") return <WalkmanPlaying album={selectedAlbum} size={300} />;
      const cover = selectedAlbum?.cover || selectedAlbum?.coverMedium;
      return cover ? <img src={cover} alt="" style={{ width: 240, height: 240, objectFit: "cover", borderRadius: 6, boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }} draggable={false} /> : null;
    };
    return (
      <div style={{ width: "100%", height: "100vh", background: "#070709", display: "flex", flexDirection: "column", alignItems: "center", overflow: "hidden", position: "relative", fontFamily: "'DM Sans', sans-serif" }}>
        {noiseBg}{backBtn}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, width: "100%", gap: 60, padding: "0 40px", maxWidth: 1100 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, animation: "fadeIn 0.5s ease" }}>
            {renderDevice()}
            <div style={{ textAlign: "center", marginTop: 20 }}>
              <div style={{ color: "rgba(255,255,255,0.15)", fontSize: 9, letterSpacing: 3, fontFamily: "'Space Mono', monospace", marginBottom: 8 }}>NOW PLAYING</div>
              <div style={{ color: "rgba(255,255,255,0.9)", fontSize: 18, fontWeight: 700 }}>{selectedAlbum?.title}</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 4 }}>{selectedAlbum?.artist} — {selectedYear}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 20 }}>
              <div onClick={handlePrevTrack} style={{ color: "rgba(255,255,255,0.4)", fontSize: 20, cursor: "pointer" }}>⏮</div>
              <div onClick={handleTogglePlay} style={{ width: 48, height: 48, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18, color: "rgba(255,255,255,0.8)" }}>{isPaused ? "▶" : "⏸"}</div>
              <div onClick={handleNextTrack} style={{ color: "rgba(255,255,255,0.4)", fontSize: 20, cursor: "pointer" }}>⏭</div>
            </div>
            {duration > 0 && <div style={{ width: 260, marginTop: 14 }}>
              <div style={{ width: "100%", height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}><div style={{ width: `${(progress / duration) * 100}%`, height: "100%", background: "rgba(255,255,255,0.5)", transition: "width 1s linear" }} /></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, color: "rgba(255,255,255,0.2)", fontSize: 9, fontFamily: "'Space Mono', monospace" }}><span>{formatMs(progress)}</span><span>{formatMs(duration)}</span></div>
            </div>}
          </div>
          {trackList.length > 0 && <div style={{ flex: 1, maxWidth: 340, maxHeight: 480, overflowY: "auto", animation: "fadeIn 0.6s ease 0.3s both" }}>
            <div style={{ color: "rgba(255,255,255,0.15)", fontSize: 9, letterSpacing: 3, fontFamily: "'Space Mono', monospace", marginBottom: 14 }}>TRACKLIST</div>
            {trackList.map((track, i) => {
              const cur = i === currentTrackIndex;
              return (<div key={track.id || i} onClick={() => handlePlayTrack(track.uri, i)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 12px", borderRadius: 8, background: cur ? "rgba(255,255,255,0.06)" : "transparent", cursor: "pointer", marginBottom: 2 }}>
                <div style={{ width: 24, textAlign: "center", color: cur ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.2)", fontSize: 11, fontFamily: "'Space Mono', monospace" }}>{cur && !isPaused ? "♪" : (track.number || i + 1)}</div>
                <div style={{ flex: 1, overflow: "hidden" }}><div style={{ color: cur ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: cur ? 600 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{track.name}</div></div>
                <div style={{ color: "rgba(255,255,255,0.15)", fontSize: 10, fontFamily: "'Space Mono', monospace" }}>{track.duration ? formatMs(track.duration) : ""}</div>
              </div>);
            })}
          </div>}
        </div>
        {demoBanner}
        <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
      </div>
    );
  }

  // ═══ THROWBACK: BROWSING ═══
  return (
    <div ref={containerRef} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} style={{ width: "100%", height: "100vh", background: "#070709", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden", userSelect: "none", position: "relative", fontFamily: "'DM Sans', sans-serif" }}>
      {noiseBg}
      <div style={{ position: "absolute", top: "15%", left: "50%", transform: "translate(-50%, 0)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(120,100,80,0.06), transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 20, left: 0, right: 0, display: "flex", alignItems: "center", padding: "0 28px", zIndex: 40 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, letterSpacing: 6, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>BACKTRACK</div>
        </div>
        <ModeToggle mode={mode} onToggle={() => setMode("modern")} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10 }}>
          <div onClick={() => setShowYearPicker(true)} style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.35)", fontSize: 10, letterSpacing: 2, fontFamily: "'Space Mono', monospace", cursor: "pointer", padding: "6px 14px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>SKIP TO YEAR
          </div>
          <div onClick={() => { window.location.href = "/"; }} style={{ color: "rgba(255,255,255,0.2)", fontSize: 9, letterSpacing: 2, fontFamily: "'Space Mono', monospace", cursor: "pointer", padding: "6px 12px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.06)", transition: "all 0.2s ease" }} onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }} onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.2)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}>EXIT DEMO</div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 52, left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.2)", fontSize: 10, letterSpacing: 4, fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>{getEraLabel(format)}</div>

      {showYearPicker && <div onClick={() => setShowYearPicker(false)} style={{ position: "absolute", inset: 0, zIndex: 100, background: "rgba(7,7,9,0.92)", backdropFilter: "blur(20px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, letterSpacing: 4, fontFamily: "'Space Mono', monospace", fontWeight: 700, marginBottom: 32 }}>SELECT A YEAR</div>
        <div onClick={e => e.stopPropagation()} style={{ display: "grid", gridTemplateColumns: "repeat(5, 76px)", gap: 10, maxHeight: "70vh", overflowY: "auto", padding: "4px 20px" }}>
          {allYears.map(y => { const a = y === selectedYear; return (<div key={y} onClick={() => { setYearIndex(allYears.indexOf(y)); setShowYearPicker(false); }} style={{ height: 48, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: a ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.04)", border: a ? "1px solid rgba(255,255,255,0.45)" : "1px solid rgba(255,255,255,0.06)", color: a ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.5)", fontSize: 15, fontWeight: a ? 700 : 500, cursor: "pointer" }}>{y}</div>); })}
        </div>
      </div>}

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 440, position: "relative", width: "100%" }}>
        {selectedAlbum && <>
          <div style={{ position: "relative", width: "100%", height: 300, perspective: "1000px", perspectiveOrigin: "50% 50%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            {yearAlbums.map((alb, i) => {
              const off = i - albumIndex; const abs = Math.abs(off); if (abs > 3) return null; const c = off === 0;
              return (<div key={`f-${selectedYear}-${i}`} onClick={() => { if (!c) setAlbumIndex(i); }} style={{ position: "absolute", transform: `translateX(${c ? 0 : off * 160}px) translateZ(${c ? 60 : -(abs * 40)}px) rotateY(${c ? 0 : (off < 0 ? 45 : -45)}deg) scale(${c ? 1 : 0.75})`, zIndex: c ? 20 : 10 - abs, opacity: c ? 1 : Math.max(0.15, 0.7 - abs * 0.2), transition: "all 0.5s cubic-bezier(0.23, 1, 0.32, 1)", cursor: c ? "default" : "pointer", transformStyle: "preserve-3d", filter: c ? "none" : `brightness(${0.65 - abs * 0.08})` }}>
                <AlbumArt album={alb} year={selectedYear} size={c ? 250 : 220} />
              </div>);
            })}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: "linear-gradient(0deg, #070709 0%, transparent 100%)", pointerEvents: "none", zIndex: 25 }} />
          </div>
          {yearAlbums.length > 1 && <>
            <div onClick={() => navAlbum(-1)} style={{ position: "absolute", left: "calc(50% - 200px)", top: "42%", transform: "translateY(-50%)", zIndex: 30, width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.35)", fontSize: 18 }}>‹</div>
            <div onClick={() => navAlbum(1)} style={{ position: "absolute", right: "calc(50% - 200px)", top: "42%", transform: "translateY(-50%)", zIndex: 30, width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.35)", fontSize: 18 }}>›</div>
          </>}
          <div style={{ textAlign: "center", marginTop: -10, position: "relative", zIndex: 26 }}>
            <div style={{ color: "rgba(255,255,255,0.92)", fontSize: 20, fontWeight: 700, maxWidth: 340, margin: "0 auto" }}>{selectedAlbum.title}</div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 5 }}>{selectedAlbum.artist}</div>
            <div style={{ color: "rgba(255,255,255,0.18)", fontSize: 9, marginTop: 10, fontFamily: "'Space Mono', monospace", letterSpacing: 2 }}>{albumIndex + 1} OF {yearAlbums.length}</div>
          </div>
        </>}
      </div>

      <div style={{ position: "relative", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", marginTop: 8 }}>
        <div style={{ width: "85%", height: 2, background: "rgba(255,255,255,0.1)", position: "relative" }}>
          <div style={{ position: "absolute", left: "50%", top: -7, transform: "translateX(-50%)", width: 14, height: 14, borderRadius: "50%", background: "rgba(255,255,255,0.85)", boxShadow: "0 0 14px rgba(255,255,255,0.5), 0 0 35px rgba(255,255,255,0.2)" }} />
        </div>
        <div style={{ position: "relative", width: "85%", height: 80, marginTop: 16, overflow: "hidden" }}>
          {visibleYears.map(({ year, offset }) => {
            const s = offset === 0; const d = Math.abs(offset);
            return (<div key={year} onClick={() => setYearIndex(allYears.indexOf(year))} style={{ position: "absolute", left: "50%", transform: `translateX(calc(-50% + ${s ? 0 : offset * 90}px))`, display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", transition: "all 0.5s cubic-bezier(0.23, 1, 0.32, 1)" }}>
              <div style={{ width: s ? 0 : 6, height: s ? 0 : 6, borderRadius: "50%", background: `rgba(255,255,255,${Math.max(0.08, 0.4 - d * 0.12)})`, marginBottom: 10, transition: "all 0.4s ease" }} />
              <div style={{ color: s ? "rgba(255,255,255,0.95)" : `rgba(255,255,255,${Math.max(0.06, 0.3 - d * 0.09)})`, fontSize: s ? 46 : 20, fontWeight: s ? 700 : 400, letterSpacing: s ? -1 : 1, transition: "all 0.5s cubic-bezier(0.23, 1, 0.32, 1)", textShadow: s ? "0 0 28px rgba(255,255,255,0.3)" : "none", whiteSpace: "nowrap" }}>{year}</div>
            </div>);
          })}
        </div>
      </div>

      <button onClick={handlePlayAlbum} style={{ position: "absolute", bottom: 28, background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.45)", padding: "10px 36px", borderRadius: 28, fontSize: 11, letterSpacing: 3, fontFamily: "'Space Mono', monospace", cursor: "pointer", transition: "all 0.3s ease", outline: "none" }}>PLAY ALBUM</button>
      {demoBanner}
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
