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

// ─── MODE TOGGLE COMPONENT ───
function ModeToggle({ mode, onToggle }) {
  return (
    <div onClick={onToggle} style={{
      display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
      padding: "5px 14px", borderRadius: 20,
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      transition: "all 0.3s ease",
      position: "relative", zIndex: 50,
    }}>
      <div style={{
        fontSize: 9, letterSpacing: 2, fontFamily: "'Space Mono', monospace", fontWeight: 600,
        color: mode === "throwback" ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.25)",
        transition: "color 0.3s ease",
      }}>THROWBACK</div>
      {/* Toggle track */}
      <div style={{
        width: 32, height: 16, borderRadius: 8,
        background: mode === "throwback" ? "rgba(255,200,100,0.3)" : "rgba(100,200,255,0.3)",
        position: "relative", transition: "background 0.3s ease",
      }}>
        <div style={{
          position: "absolute", top: 2,
          left: mode === "throwback" ? 2 : 16,
          width: 12, height: 12, borderRadius: "50%",
          background: mode === "throwback" ? "#ffcc66" : "#66ccff",
          transition: "all 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
          boxShadow: `0 0 6px ${mode === "throwback" ? "rgba(255,200,100,0.4)" : "rgba(100,200,255,0.4)"}`,
        }} />
      </div>
      <div style={{
        fontSize: 9, letterSpacing: 2, fontFamily: "'Space Mono', monospace", fontWeight: 600,
        color: mode === "modern" ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.25)",
        transition: "color 0.3s ease",
      }}>MODERN</div>
    </div>
  );
}

export default function Timeline() {
  const [albums, setAlbums] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [yearIndex, setYearIndex] = useState(0);
  const [albumIndex, setAlbumIndex] = useState(0);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [playState, setPlayState] = useState("browsing");
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [trackList, setTrackList] = useState([]);
  const [mode, setMode] = useState("throwback"); // throwback | modern
  const containerRef = useRef(null);
  const touchStart = useRef({ x: 0, y: 0 });
  const lastScroll = useRef(0);
  const progressInterval = useRef(null);

  useEffect(() => {
    async function fetchAlbums() {
      try {
        const res = await fetch("/api/albums");
        if (res.status === 401) { window.location.href = "/"; return; }
        const data = await res.json();
        if (data.error) setError(data.error); else setAlbums(data.albums);
      } catch { setError("Failed to load your albums."); }
      finally { setLoading(false); }
    }
    fetchAlbums();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.Spotify) { setSdkReady(true); return; }
    const s = document.createElement('script'); s.src = 'https://sdk.scdn.co/spotify-player.js'; s.async = true; document.body.appendChild(s);
    window.onSpotifyWebPlaybackSDKReady = () => { console.log('[BT] SDK Ready'); setSdkReady(true); };
    return () => { if (s.parentNode) s.parentNode.removeChild(s); };
  }, []);

  useEffect(() => {
    if (!sdkReady) return;
    async function init() {
      try {
        const t = await fetch('/api/token'); const td = await t.json(); if (!td.access_token) return;
        const p = new window.Spotify.Player({ name: 'Backtrack', getOAuthToken: cb => { fetch('/api/token').then(r => r.json()).then(d => cb(d.access_token)); }, volume: 0.8 });
        p.addListener('ready', ({ device_id }) => { console.log('[BT] Ready:', device_id); setDeviceId(device_id); });
        p.addListener('not_ready', ({ device_id }) => console.log('[BT] Not ready:', device_id));
        p.addListener('player_state_changed', state => {
          if (!state) return; setIsPaused(state.paused); setProgress(state.position); setDuration(state.duration);
          const uri = state.track_window.current_track.uri;
          setTrackList(prev => { const idx = prev.findIndex(t => t.uri === uri); if (idx >= 0) setCurrentTrackIndex(idx); return prev; });
        });
        p.addListener('initialization_error', ({ message }) => console.error('[BT] Init err:', message));
        p.addListener('authentication_error', ({ message }) => console.error('[BT] Auth err:', message));
        p.addListener('account_error', ({ message }) => console.error('[BT] Acct err:', message));
        await p.connect(); setPlayer(p);
      } catch (e) { console.error('[BT] Init err:', e); }
    }
    init();
  }, [sdkReady]);

  useEffect(() => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    if ((playState === "playing" || playState === "ipod") && !isPaused) {
      progressInterval.current = setInterval(() => { setProgress(prev => Math.min(prev + 1000, duration)); }, 1000);
    }
    return () => { if (progressInterval.current) clearInterval(progressInterval.current); };
  }, [playState, isPaused, duration]);

  // Also run progress for modern mode
  useEffect(() => {
    if (mode !== "modern" || isPaused) return;
    const iv = setInterval(() => { setProgress(prev => Math.min(prev + 1000, duration)); }, 1000);
    return () => clearInterval(iv);
  }, [mode, isPaused, duration]);

  const allYears = Object.keys(albums).map(Number).sort((a, b) => a - b);
  const selectedYear = allYears[yearIndex];
  const yearAlbums = albums[selectedYear] || [];
  const selectedAlbum = yearAlbums[albumIndex];
  const format = selectedYear ? getEraFormat(selectedYear) : "cd";
  const isIpodEra = format === "ipod";

  useEffect(() => { setAlbumIndex(0); }, [yearIndex]);

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

  // ─── PLAYBACK ───
  const startPlayback = async (uri, did, trackUri) => {
    try { const r = await fetch('/api/play', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ album_uri: uri, device_id: did, track_uri: trackUri || undefined }) }); console.log('[BT] Play:', await r.json()); } catch (e) { console.error('[BT] Play err:', e); }
  };

  const handlePlayAlbum = async () => {
    if (!selectedAlbum || !deviceId) return;
    setTrackList(selectedAlbum.tracks || []); setCurrentTrackIndex(0);
    if (isIpodEra) { setPlayState("animating"); setTimeout(async () => { await startPlayback(selectedAlbum.uri, deviceId); setPlayState("ipod"); }, 800); }
    else { setPlayState("animating"); }
  };

  const handleAnimationComplete = async () => { if (!selectedAlbum || !deviceId) return; await startPlayback(selectedAlbum.uri, deviceId); setPlayState("playing"); };

  const handleIpodPlayTrack = async (trackUri, index) => { if (!selectedAlbum || !deviceId) return; setTrackList(selectedAlbum.tracks || []); setCurrentTrackIndex(index); await startPlayback(selectedAlbum.uri, deviceId, trackUri); };
  const handleIpodToggle = () => { if (player) player.togglePlay(); };
  const handleIpodNext = () => { if (player) player.nextTrack(); };
  const handleIpodPrev = () => { if (player) player.previousTrack(); };

  const handlePlayTrack = async (trackUri, index) => { if (!selectedAlbum || !deviceId) return; setCurrentTrackIndex(index); await startPlayback(selectedAlbum.uri, deviceId, trackUri); };
  const handleTogglePlay = () => { if (player) player.togglePlay(); };
  const handleNextTrack = () => { if (player) player.nextTrack(); };
  const handlePrevTrack = () => { if (player) player.previousTrack(); };
  const handleBack = () => { if (player) player.pause(); setPlayState("browsing"); setProgress(0); };

  // Modern mode playback handlers
  const handleModernStartPlayback = async (albumUri, did) => {
    const yearKeys = Object.keys(albums);
    let targetAlbum = null;
    for (const y of yearKeys) {
      const found = albums[y].find(a => a.uri === albumUri);
      if (found) { targetAlbum = found; break; }
    }
    if (targetAlbum) setTrackList(targetAlbum.tracks || []);
    setCurrentTrackIndex(0);
    await startPlayback(albumUri, did);
  };

  const handleModernPlayTrack = async (albumUri, did, trackUri) => {
    const yearKeys = Object.keys(albums);
    let targetAlbum = null;
    for (const y of yearKeys) {
      const found = albums[y].find(a => a.uri === albumUri);
      if (found) { targetAlbum = found; break; }
    }
    if (targetAlbum) {
      setTrackList(targetAlbum.tracks || []);
      const idx = targetAlbum.tracks?.findIndex(t => t.uri === trackUri);
      if (idx >= 0) setCurrentTrackIndex(idx);
    }
    await startPlayback(albumUri, did, trackUri);
  };

  const noise = "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"256\" height=\"256\"><filter id=\"n\"><feTurbulence baseFrequency=\"0.85\" numOctaves=\"4\"/><feColorMatrix type=\"saturate\" values=\"0\"/></filter><rect width=\"256\" height=\"256\" filter=\"url(%23n)\"/></svg>')";
  const noiseBg = <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: noise, pointerEvents: "none" }} />;
  const backBtn = <div onClick={handleBack} style={{ position: "absolute", top: 28, left: 28, zIndex: 50, color: "rgba(255,255,255,0.3)", fontSize: 10, letterSpacing: 2, fontFamily: "'Space Mono', monospace", cursor: "pointer", padding: "6px 14px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)" }}>← BACK</div>;

  // ─── LOADING / ERROR ───
  if (loading) return (<div style={{ width: "100%", height: "100vh", background: "#070709", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}><div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, letterSpacing: 6, fontWeight: 700, fontFamily: "'Space Mono', monospace", marginBottom: 20 }}>BACKTRACK</div><div style={{ color: "rgba(255,255,255,0.2)", fontSize: 12, fontFamily: "'Space Mono', monospace", letterSpacing: 2 }}>LOADING YOUR LIBRARY...</div></div>);
  if (error) return (<div style={{ width: "100%", height: "100vh", background: "#070709", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}><div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, letterSpacing: 6, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>BACKTRACK</div><div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>{error}</div></div>);
  if (allYears.length === 0) return (<div style={{ width: "100%", height: "100vh", background: "#070709", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}><div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, letterSpacing: 6, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>BACKTRACK</div><div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Your Spotify library is empty.</div></div>);

  // ═══ MODERN MODE ═══
  if (mode === "modern") {
    return (
      <div style={{ width: "100%", height: "100vh", position: "relative" }}>
        {/* Header with branding + toggle */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 40, padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(180deg, rgba(10,10,12,1) 0%, rgba(10,10,12,0.95) 70%, transparent 100%)" }}>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, letterSpacing: 6, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>BACKTRACK</div>
          <ModeToggle mode={mode} onToggle={() => { setMode("throwback"); setPlayState("browsing"); }} />
          <div onClick={() => { window.location.href = "/api/auth/signout"; }} style={{ color: "rgba(255,255,255,0.2)", fontSize: 9, letterSpacing: 2, fontFamily: "'Space Mono', monospace", cursor: "pointer", padding: "6px 12px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.06)", transition: "all 0.2s ease" }} onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }} onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.2)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}>SIGN OUT</div>
        </div>
        <ModernView
          albums={albums}
          deviceId={deviceId}
          player={player}
          onPlayTrack={handleModernPlayTrack}
          onStartPlayback={handleModernStartPlayback}
          isPaused={isPaused}
          progress={progress}
          duration={duration}
          currentTrackIndex={currentTrackIndex}
          trackList={trackList}
          onTogglePlay={handleTogglePlay}
          onNextTrack={handleNextTrack}
          onPrevTrack={handlePrevTrack}
        />
      </div>
    );
  }

  // ═══ THROWBACK MODE ═══

  // ─── ANIMATION SCREEN (non-iPod) ───
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

  // ─── iPod SCREEN ───
  if (playState === "ipod" || (playState === "animating" && isIpodEra)) {
    const ipodProps = { onPlayTrack: handleIpodPlayTrack, onTogglePlay: handleIpodToggle, onNextTrack: handleIpodNext, onPrevTrack: handleIpodPrev, isPaused, progress, duration, currentTrackIndex, isPlaying: playState === "ipod" };
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
        <style>{`@keyframes ipodSlideUp { from { opacity: 0; transform: translateY(40px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }`}</style>
      </div>
    );
  }

  // ─── NOW PLAYING (non-iPod) ───
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
        <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
      </div>
    );
  }

  // ─── MAIN TIMELINE (BROWSING) ───
  return (
    <div ref={containerRef} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} style={{ width: "100%", height: "100vh", background: "#070709", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden", userSelect: "none", position: "relative", fontFamily: "'DM Sans', sans-serif" }}>
      {noiseBg}
      <div style={{ position: "absolute", top: "15%", left: "50%", transform: "translate(-50%, 0)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(120,100,80,0.06), transparent 65%)", pointerEvents: "none" }} />

      {/* Header */}
      <div style={{ position: "absolute", top: 20, left: 0, right: 0, display: "flex", alignItems: "center", padding: "0 28px", zIndex: 40 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, letterSpacing: 6, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>BACKTRACK</div>
        </div>
        <ModeToggle mode={mode} onToggle={() => setMode("modern")} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10 }}>
          <div onClick={() => setShowYearPicker(true)} style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.35)", fontSize: 10, letterSpacing: 2, fontFamily: "'Space Mono', monospace", cursor: "pointer", padding: "6px 14px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>SKIP TO YEAR
          </div>
          <div onClick={() => { window.location.href = "/api/auth/signout"; }} style={{ color: "rgba(255,255,255,0.2)", fontSize: 9, letterSpacing: 2, fontFamily: "'Space Mono', monospace", cursor: "pointer", padding: "6px 12px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.06)", transition: "all 0.2s ease" }} onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }} onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.2)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}>SIGN OUT</div>
        </div>
      </div>

      <div style={{ position: "absolute", top: 52, left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.2)", fontSize: 10, letterSpacing: 4, fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>{getEraLabel(format)}</div>
      {!deviceId && <div style={{ position: "absolute", top: 68, left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.12)", fontSize: 8, letterSpacing: 2, fontFamily: "'Space Mono', monospace" }}>CONNECTING PLAYER...</div>}

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

      <button onClick={handlePlayAlbum} style={{ position: "absolute", bottom: 28, background: "transparent", border: `1px solid ${deviceId ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)"}`, color: deviceId ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.15)", padding: "10px 36px", borderRadius: 28, fontSize: 11, letterSpacing: 3, fontFamily: "'Space Mono', monospace", cursor: deviceId ? "pointer" : "default", transition: "all 0.3s ease", outline: "none" }}>
        {deviceId ? "PLAY ALBUM" : "CONNECTING..."}
      </button>

      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
