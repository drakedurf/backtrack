"use client";
import { useState, useMemo, useRef } from "react";
import { getEraFormat } from "./AlbumArt";
import Visualizer from "./Visualizer";

function formatMs(ms) {
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

const ERA_SECTIONS = [
  { key: "vinyl", label: "Vinyl Era", sub: "Pre-1978", range: [0, 1977], color: "#ff6b9d", color2: "#ff3366" },
  { key: "cassette", label: "Cassette Era", sub: "1978–1991", range: [1978, 1991], color: "#c471ed", color2: "#9b30ff" },
  { key: "cd", label: "CD Era", sub: "1992–2000", range: [1992, 2000], color: "#6a82fb", color2: "#4158d0" },
  { key: "ipod", label: "iPod Era", sub: "2001–2015", range: [2001, 2015], color: "#38c8f0", color2: "#0088cc" },
  { key: "streaming", label: "Streaming", sub: "2016+", range: [2016, 2099], color: "#4aeadc", color2: "#00b894" },
];

const VIZ_STYLES = [
  { key: "waves", label: "WAVES", icon: "〰" },
  { key: "bars", label: "BARS", icon: "▮▮▮" },
  { key: "orbit", label: "ORBIT", icon: "◎" },
  { key: "particles", label: "PARTICLES", icon: "✦" },
];

export default function ModernView({
  albums, deviceId, player, onPlayTrack, onStartPlayback,
  isPaused, progress, duration, currentTrackIndex, trackList,
  onTogglePlay, onNextTrack, onPrevTrack,
}) {
  const [search, setSearch] = useState("");
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [playingAlbumId, setPlayingAlbumId] = useState(null);
  const [hoveredAlbum, setHoveredAlbum] = useState(null);
  const [activeEra, setActiveEra] = useState(null);
  const [vizStyle, setVizStyle] = useState("waves");
  const [showTracks, setShowTracks] = useState(false);
  const seekBarRef = useRef(null);
  const [isSeeking, setIsSeeking] = useState(false);

  const allYears = useMemo(() => Object.keys(albums).map(Number).sort((a, b) => a - b), [albums]);

  const eraAlbums = useMemo(() => {
    const result = {};
    ERA_SECTIONS.forEach((era) => {
      const eraList = [];
      allYears.forEach((year) => {
        if (year >= era.range[0] && year <= era.range[1]) {
          const filtered = search.trim()
            ? (albums[year] || []).filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.artist.toLowerCase().includes(search.toLowerCase()))
            : albums[year] || [];
          filtered.forEach((a) => eraList.push({ ...a, year }));
        }
      });
      if (eraList.length > 0) result[era.key] = eraList;
    });
    return result;
  }, [albums, allYears, search]);

  const activeEraData = useMemo(() => {
    if (activeEra) return ERA_SECTIONS.find(e => e.key === activeEra);
    if (playingAlbumId && selectedAlbum) {
      const year = selectedAlbum.year || selectedAlbum.releaseDate?.substring(0, 4);
      const fmt = getEraFormat(Number(year) || 2020);
      return ERA_SECTIONS.find(e => e.key === fmt);
    }
    return ERA_SECTIONS[2];
  }, [activeEra, playingAlbumId, selectedAlbum]);

  const handlePlayAlbum = async (album) => {
    if (!deviceId) return;
    setPlayingAlbumId(album.id); setSelectedAlbum(album);
    setShowTracks(false);
    await onStartPlayback(album.uri, deviceId);
  };

  const handlePlayAlbumTrack = async (trackUri, index) => {
    if (!selectedAlbum || !deviceId) return;
    await onPlayTrack(selectedAlbum.uri, deviceId, trackUri);
  };

  const handleSeek = (e) => {
    if (!seekBarRef.current || !duration || !player) return;
    const rect = seekBarRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const pct = x / rect.width;
    const seekMs = Math.floor(pct * duration);
    player.seek(seekMs);
  };

  const handleSeekMouseDown = (e) => {
    setIsSeeking(true);
    handleSeek(e);
    const onMove = (ev) => handleSeek(ev);
    const onUp = () => { setIsSeeking(false); window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const currentTrack = trackList?.[currentTrackIndex];

  return (
    <div style={{ width: "100%", height: "100vh", background: "#030305", position: "relative", fontFamily: "'DM Sans', sans-serif", overflow: "hidden" }}>
      <Visualizer
        activeColor={activeEraData?.color || "#6a82fb"}
        activeColor2={activeEraData?.color2 || "#4158d0"}
        isPlaying={!!playingAlbumId && !isPaused}
        style={vizStyle}
      />

      <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Top bar: search + viz switcher */}
        <div style={{ padding: "70px 36px 0", flexShrink: 0, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ flex: 1, maxWidth: 400, position: "relative" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search albums, artists..."
              style={{ width: "100%", padding: "11px 16px 11px 40px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 24, color: "rgba(255,255,255,0.85)", fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none", backdropFilter: "blur(10px)" }} />
          </div>

          {/* Visualizer style switcher */}
          <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.03)", borderRadius: 20, padding: 3, border: "1px solid rgba(255,255,255,0.06)" }}>
            {VIZ_STYLES.map((vs) => (
              <div key={vs.key} onClick={() => setVizStyle(vs.key)}
                style={{
                  padding: "6px 12px", borderRadius: 16, cursor: "pointer",
                  background: vizStyle === vs.key ? "rgba(255,255,255,0.1)" : "transparent",
                  color: vizStyle === vs.key ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.25)",
                  fontSize: 9, fontFamily: "'Space Mono', monospace", letterSpacing: 1, fontWeight: 600,
                  transition: "all 0.2s ease",
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                <span style={{ fontSize: 11 }}>{vs.icon}</span>
                {vs.label}
              </div>
            ))}
          </div>
        </div>

        {/* Main content area — shelves on left, track list on right */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Era shelves */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 0 120px" }}>
          {ERA_SECTIONS.map((era) => {
            const items = eraAlbums[era.key];
            if (!items || items.length === 0) return null;
            return (
              <div key={era.key} style={{ marginBottom: 36 }} onMouseEnter={() => setActiveEra(era.key)} onMouseLeave={() => setActiveEra(null)}>
                <div style={{ padding: "0 36px", marginBottom: 14, display: "flex", alignItems: "baseline", gap: 10 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>{era.label}</div>
                  <div style={{ fontSize: 11, color: era.color, opacity: 0.6, fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}>{era.sub}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.15)", marginLeft: "auto", fontFamily: "'Space Mono', monospace" }}>{items.length} album{items.length !== 1 ? "s" : ""}</div>
                </div>
                <div style={{ display: "flex", gap: 16, overflowX: "auto", padding: "0 36px 8px", scrollbarWidth: "none" }}>
                  {items.map((album, i) => {
                    const cover = album.cover || album.coverMedium;
                    const isThisPlaying = playingAlbumId === album.id;
                    const isHovered = hoveredAlbum === `${era.key}-${i}`;
                    return (
                      <div key={album.id || i} onClick={() => handlePlayAlbum(album)} onMouseEnter={() => setHoveredAlbum(`${era.key}-${i}`)} onMouseLeave={() => setHoveredAlbum(null)}
                        style={{ flexShrink: 0, width: 150, cursor: "pointer", transition: "transform 0.2s ease", transform: isHovered ? "translateY(-4px)" : "translateY(0)" }}>
                        <div style={{
                          width: 150, height: 150, borderRadius: 6, overflow: "hidden", position: "relative", background: "#1a1a1e",
                          boxShadow: isThisPlaying ? `0 4px 24px ${era.color}44, 0 0 0 2px ${era.color}88` : isHovered ? "0 8px 28px rgba(0,0,0,0.6)" : "0 2px 12px rgba(0,0,0,0.3)",
                          transition: "box-shadow 0.2s ease",
                        }}>
                          {cover && <img src={cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: isThisPlaying && !isPaused ? 0.65 : 1, transition: "opacity 0.2s ease" }} draggable={false} />}
                          {(isHovered || isThisPlaying) && (
                            <div style={{ position: "absolute", inset: 0, background: isThisPlaying ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", opacity: isHovered || (isThisPlaying && !isPaused) ? 1 : 0, transition: "opacity 0.2s ease" }}>
                              {isThisPlaying && !isPaused ? (
                                <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 24 }}>
                                  {[0, 1, 2, 3].map(b => <div key={b} style={{ width: 3.5, borderRadius: 1, background: era.color, animation: `eqBar 0.65s ease infinite ${b * 0.1}s` }} />)}
                                </div>
                              ) : (
                                <div style={{ width: 42, height: 42, borderRadius: "50%", background: era.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#000", boxShadow: `0 2px 16px ${era.color}66` }}>▶</div>
                              )}
                            </div>
                          )}
                          <div style={{ position: "absolute", bottom: 6, left: 6, fontSize: 9, color: "rgba(255,255,255,0.6)", fontFamily: "'Space Mono', monospace", background: "rgba(0,0,0,0.65)", padding: "2px 6px", borderRadius: 3 }}>{album.year}</div>
                        </div>
                        <div style={{ marginTop: 8, padding: "0 2px" }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: isThisPlaying ? era.color : "rgba(255,255,255,0.8)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{album.title}</div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{album.artist}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {Object.keys(eraAlbums).length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,0.2)", fontSize: 14 }}>
              {search ? "No albums match your search" : "Your library is empty"}
            </div>
          )}
          </div>

          {/* Right sidebar — track list */}
          {playingAlbumId && selectedAlbum && (selectedAlbum.tracks?.length > 0) && (
            <div style={{
              width: 280, flexShrink: 0,
              borderLeft: `1px solid ${activeEraData?.color || "#6a82fb"}15`,
              background: "rgba(6,6,10,0.5)",
              backdropFilter: "blur(16px)",
              overflowY: "auto",
              padding: "16px 0 120px",
              animation: "sidebarSlide 0.3s ease",
            }}>
              {/* Album info header */}
              <div style={{ padding: "0 18px 14px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  {(selectedAlbum.cover || selectedAlbum.coverMedium) && (
                    <img src={selectedAlbum.cover || selectedAlbum.coverMedium} alt=""
                      style={{ width: 40, height: 40, borderRadius: 4, objectFit: "cover" }} draggable={false} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{selectedAlbum.title}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>{selectedAlbum.artist}</div>
                  </div>
                </div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.15)", fontFamily: "'Space Mono', monospace", letterSpacing: 2 }}>
                  NOW PLAYING · {selectedAlbum.tracks.length} TRACKS
                </div>
              </div>

              {/* Track list */}
              <div style={{ padding: "8px 0" }}>
                {selectedAlbum.tracks.map((track, i) => {
                  const isCurrent = i === currentTrackIndex;
                  const eraColor = activeEraData?.color || "#6a82fb";
                  return (
                    <div key={track.id || i} onClick={() => handlePlayAlbumTrack(track.uri, i)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "8px 18px", cursor: "pointer",
                        background: isCurrent ? `${eraColor}12` : "transparent",
                        borderLeft: isCurrent ? `2px solid ${eraColor}` : "2px solid transparent",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => { if (!isCurrent) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                      onMouseLeave={(e) => { if (!isCurrent) e.currentTarget.style.background = "transparent"; }}
                    >
                      <div style={{
                        width: 20, textAlign: "center", fontSize: 10,
                        color: isCurrent ? eraColor : "rgba(255,255,255,0.15)",
                        fontFamily: "'Space Mono', monospace",
                        flexShrink: 0,
                      }}>
                        {isCurrent && !isPaused ? "♪" : (track.number || i + 1)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 12, fontWeight: isCurrent ? 600 : 400,
                          color: isCurrent ? eraColor : "rgba(255,255,255,0.5)",
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>{track.name}</div>
                      </div>
                      <div style={{
                        fontSize: 9, color: "rgba(255,255,255,0.1)",
                        fontFamily: "'Space Mono', monospace", flexShrink: 0,
                      }}>{track.duration ? formatMs(track.duration) : ""}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Now playing bar */}
      {playingAlbumId && selectedAlbum && (
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 86, zIndex: 50,
          background: "linear-gradient(180deg, rgba(6,6,8,0.85), rgba(3,3,5,0.95))",
          borderTop: `1px solid ${activeEraData?.color || "#6a82fb"}33`,
          backdropFilter: "blur(24px)",
          display: "flex", flexDirection: "column",
        }}>
          {/* Seek bar — full width at top of bar */}
          <div
            ref={seekBarRef}
            onMouseDown={handleSeekMouseDown}
            style={{
              width: "100%", height: 14, cursor: "pointer",
              display: "flex", alignItems: "center",
              padding: "0 28px", marginTop: -4,
              position: "relative",
            }}
          >
            {/* Track */}
            <div style={{ width: "100%", height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, position: "relative", overflow: "visible" }}>
              {/* Progress fill */}
              <div style={{
                width: duration > 0 ? `${(progress / duration) * 100}%` : "0%",
                height: "100%", borderRadius: 2,
                background: `linear-gradient(90deg, ${activeEraData?.color || "#6a82fb"}88, ${activeEraData?.color || "#6a82fb"})`,
                transition: isSeeking ? "none" : "width 1s linear",
                position: "relative",
              }}>
                {/* Scrubber handle */}
                <div style={{
                  position: "absolute", right: -6, top: "50%", transform: "translateY(-50%)",
                  width: 12, height: 12, borderRadius: "50%",
                  background: activeEraData?.color || "#6a82fb",
                  boxShadow: `0 0 8px ${activeEraData?.color || "#6a82fb"}66`,
                  opacity: isSeeking ? 1 : 0,
                  transition: "opacity 0.15s ease",
                }} />
              </div>
            </div>
          </div>

          {/* Bottom row: info, controls, time */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "0 28px", gap: 16, position: "relative" }}>
            {/* Left: album art + info */}
            {(selectedAlbum.cover || selectedAlbum.coverMedium) && (
              <img src={selectedAlbum.cover || selectedAlbum.coverMedium} alt=""
                style={{ width: 46, height: 46, borderRadius: 4, objectFit: "cover", boxShadow: `0 0 12px ${activeEraData?.color || "#6a82fb"}33` }} draggable={false} />
            )}
            <div style={{ flex: "0 1 180px", minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.9)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentTrack?.name || selectedAlbum.title}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>{selectedAlbum.artist}</div>
            </div>

            {/* Center: controls + time — absolutely centered */}
            <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div onClick={onPrevTrack} style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, cursor: "pointer", padding: 4 }}>⏮</div>
                <div onClick={onTogglePlay} style={{ width: 36, height: 36, borderRadius: "50%", background: activeEraData?.color || "#6a82fb", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 13, color: "#000", boxShadow: `0 0 16px ${activeEraData?.color || "#6a82fb"}44` }}>{isPaused ? "▶" : "❚❚"}</div>
                <div onClick={onNextTrack} style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, cursor: "pointer", padding: 4 }}>⏭</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", fontFamily: "'Space Mono', monospace" }}>{formatMs(progress)}</span>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.1)" }}>/</span>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", fontFamily: "'Space Mono', monospace" }}>{formatMs(duration)}</span>
              </div>
            </div>

            {/* Right: track count */}
            <div style={{ marginLeft: "auto" }}>
              {selectedAlbum.tracks?.length > 0 && (
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", fontFamily: "'Space Mono', monospace" }}>
                  {(currentTrackIndex + 1)}/{selectedAlbum.tracks.length}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes eqBar { 0%, 100% { height: 4px; } 50% { height: 20px; } }
        @keyframes sidebarSlide { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes trackListSlide { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        input::placeholder { color: rgba(255,255,255,0.2); }
        div::-webkit-scrollbar { display: none; }
        [data-seekbar]:hover [data-handle] { opacity: 1 !important; }
        [data-seekbar]:hover [data-track] { height: 6px !important; }
      `}</style>
    </div>
  );
}
