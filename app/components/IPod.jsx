"use client";
import { useState, useEffect, useCallback } from "react";

function formatMs(ms) {
  if (!ms) return "0:00";
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export function getIpodModel(year) {
  if (year <= 2004) return "gen3";
  if (year <= 2007) return "mini";
  if (year <= 2012) return "classic";
  return "nano7";
}

export default function IPod({
  album,
  year,
  size = 250,
  onPlayTrack,
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  isPaused,
  progress,
  duration,
  currentTrackIndex,
  isPlaying,
}) {
  const [screen, setScreen] = useState("tracklist"); // tracklist | nowplaying
  const [highlightIndex, setHighlightIndex] = useState(0);
  const tracks = album?.tracks || [];
  const model = getIpodModel(year);

  // Sync highlight with current track when playing
  useEffect(() => {
    if (isPlaying && currentTrackIndex >= 0) {
      setHighlightIndex(currentTrackIndex);
      setScreen("nowplaying");
    }
  }, [currentTrackIndex, isPlaying]);

  const handleScrollUp = useCallback(() => {
    if (screen === "tracklist") {
      setHighlightIndex((prev) => Math.max(0, prev - 1));
    }
  }, [screen]);

  const handleScrollDown = useCallback(() => {
    if (screen === "tracklist") {
      setHighlightIndex((prev) => Math.min(tracks.length - 1, prev + 1));
    }
  }, [screen, tracks.length]);

  const handleCenter = useCallback(() => {
    if (screen === "tracklist" && tracks[highlightIndex]) {
      onPlayTrack?.(tracks[highlightIndex].uri, highlightIndex);
      setScreen("nowplaying");
    } else if (screen === "nowplaying") {
      onTogglePlay?.();
    }
  }, [screen, highlightIndex, tracks, onPlayTrack, onTogglePlay]);

  const handleMenu = useCallback(() => {
    if (screen === "nowplaying") {
      setScreen("tracklist");
    }
  }, [screen]);

  const handlePlay = useCallback(() => {
    if (screen === "tracklist" && tracks[highlightIndex]) {
      onPlayTrack?.(tracks[highlightIndex].uri, highlightIndex);
      setScreen("nowplaying");
    } else {
      onTogglePlay?.();
    }
  }, [screen, highlightIndex, tracks, onPlayTrack, onTogglePlay]);

  const handleNext = useCallback(() => {
    if (screen === "nowplaying") {
      onNextTrack?.();
    } else {
      handleScrollDown();
    }
  }, [screen, onNextTrack, handleScrollDown]);

  const handlePrev = useCallback(() => {
    if (screen === "nowplaying") {
      onPrevTrack?.();
    } else {
      handleScrollUp();
    }
  }, [screen, onPrevTrack, handleScrollUp]);

  const currentTrack = tracks[currentTrackIndex] || tracks[highlightIndex];
  const cover = album?.cover || album?.coverMedium;

  // ─── SCREEN CONTENT ───
  const renderTrackList = (screenW, screenH, colors) => {
    const itemH = Math.max(screenH / 7.5, 12);
    const visibleCount = Math.floor(screenH / itemH) - 1;
    const scrollStart = Math.max(
      0,
      Math.min(highlightIndex - Math.floor(visibleCount / 2), tracks.length - visibleCount)
    );
    const visibleTracks = tracks.slice(scrollStart, scrollStart + visibleCount);

    return (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div
          style={{
            padding: `${screenH * 0.03}px ${screenW * 0.06}px`,
            background: colors.headerBg,
            borderBottom: `1px solid ${colors.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: Math.max(screenW * 0.08, 6),
              fontWeight: 700,
              color: colors.headerText,
              fontFamily: "'Space Mono', monospace",
            }}
          >
            {album?.title || "Album"}
          </div>
          <div
            style={{
              fontSize: Math.max(screenW * 0.06, 4),
              color: colors.headerTextDim,
              fontFamily: "'Space Mono', monospace",
            }}
          >
            {tracks.length} songs
          </div>
        </div>
        {/* Track list */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          {visibleTracks.map((track, vi) => {
            const actualIndex = scrollStart + vi;
            const isHighlighted = actualIndex === highlightIndex;
            return (
              <div
                key={track.id || actualIndex}
                onClick={() => {
                  setHighlightIndex(actualIndex);
                  onPlayTrack?.(track.uri, actualIndex);
                  setScreen("nowplaying");
                }}
                style={{
                  height: itemH,
                  display: "flex",
                  alignItems: "center",
                  padding: `0 ${screenW * 0.06}px`,
                  background: isHighlighted ? colors.highlight : "transparent",
                  cursor: "pointer",
                  gap: screenW * 0.03,
                }}
              >
                <div
                  style={{
                    fontSize: Math.max(screenW * 0.06, 4),
                    color: isHighlighted ? colors.highlightText : colors.dimText,
                    fontFamily: "'Space Mono', monospace",
                    width: screenW * 0.1,
                    textAlign: "right",
                  }}
                >
                  {track.number || actualIndex + 1}
                </div>
                <div
                  style={{
                    flex: 1,
                    fontSize: Math.max(screenW * 0.07, 5),
                    color: isHighlighted ? colors.highlightText : colors.text,
                    fontWeight: isHighlighted ? 700 : 400,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {track.name}
                </div>
                <div
                  style={{
                    fontSize: Math.max(screenW * 0.05, 4),
                    color: isHighlighted ? colors.highlightTextDim : colors.dimText,
                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  {formatMs(track.duration)}
                </div>
              </div>
            );
          })}
        </div>
        {/* Scrollbar indicator */}
        {tracks.length > visibleCount && (
          <div
            style={{
              position: "absolute",
              right: 2,
              top: itemH + 4,
              bottom: 4,
              width: 2,
              background: colors.scrollBg,
              borderRadius: 1,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: `${(scrollStart / Math.max(1, tracks.length - visibleCount)) * 100}%`,
                width: "100%",
                height: `${(visibleCount / tracks.length) * 100}%`,
                background: colors.scrollThumb,
                borderRadius: 1,
                minHeight: 6,
              }}
            />
          </div>
        )}
      </div>
    );
  };

  const renderNowPlaying = (screenW, screenH, colors) => {
    const progressPct = duration > 0 ? (progress / duration) * 100 : 0;
    return (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div
          style={{
            padding: `${screenH * 0.03}px ${screenW * 0.06}px`,
            background: colors.headerBg,
            borderBottom: `1px solid ${colors.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: Math.max(screenW * 0.07, 5),
              color: colors.headerTextDim,
              fontFamily: "'Space Mono', monospace",
              cursor: "pointer",
            }}
          >
            ◀ Menu
          </div>
          <div
            style={{
              fontSize: Math.max(screenW * 0.07, 5),
              fontWeight: 700,
              color: colors.headerText,
              fontFamily: "'Space Mono', monospace",
            }}
          >
            Now Playing
          </div>
          <div style={{ width: screenW * 0.15 }} />
        </div>
        {/* Album art + info */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            padding: `${screenH * 0.04}px ${screenW * 0.06}px`,
            gap: screenW * 0.06,
          }}
        >
          {cover && (
            <img
              src={cover}
              alt=""
              style={{
                width: screenW * 0.38,
                height: screenW * 0.38,
                objectFit: "cover",
                borderRadius: 2,
                boxShadow: `0 1px 4px ${colors.shadow}`,
              }}
              draggable={false}
            />
          )}
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div
              style={{
                fontSize: Math.max(screenW * 0.08, 6),
                color: colors.text,
                fontWeight: 700,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineHeight: 1.3,
              }}
            >
              {currentTrack?.name || "Unknown"}
            </div>
            <div
              style={{
                fontSize: Math.max(screenW * 0.06, 5),
                color: colors.dimText,
                marginTop: 2,
              }}
            >
              {album?.artist}
            </div>
            <div
              style={{
                fontSize: Math.max(screenW * 0.05, 4),
                color: colors.dimText,
                marginTop: 1,
              }}
            >
              {album?.title}
            </div>
            {/* Play/Pause indicator */}
            <div
              style={{
                fontSize: Math.max(screenW * 0.07, 6),
                color: colors.accent,
                marginTop: 4,
              }}
            >
              {isPaused ? "❚❚ Paused" : "▶ Playing"}
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ padding: `0 ${screenW * 0.06}px ${screenH * 0.06}px` }}>
          <div
            style={{
              width: "100%",
              height: Math.max(3, screenH * 0.02),
              background: colors.progressBg,
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progressPct}%`,
                height: "100%",
                background: colors.accent,
                borderRadius: 2,
                transition: "width 1s linear",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 2,
              fontSize: Math.max(screenW * 0.05, 4),
              color: colors.dimText,
              fontFamily: "'Space Mono', monospace",
            }}
          >
            <span>{formatMs(progress)}</span>
            <span>{formatMs(duration)}</span>
          </div>
        </div>
      </div>
    );
  };

  // ─── iPod HARDWARE SHELLS ───

  // Shared button hover style
  const btnStyle = (base) => ({
    ...base,
    cursor: "pointer",
    transition: "all 0.15s ease",
    userSelect: "none",
  });

  // ─── 2001-2004: 3rd Gen iPod ───
  if (model === "gen3") {
    const w = size * 0.62;
    const h = size * 1.15;
    const screenW = w * 0.82;
    const screenH = h * 0.32;
    const colors = {
      headerBg: "linear-gradient(180deg, #8090a0, #607080)",
      headerText: "#fff",
      headerTextDim: "#c0d0e0",
      border: "#506070",
      text: "#1a2a1a",
      dimText: "#5a6a5a",
      highlight: "#3060a0",
      highlightText: "#fff",
      highlightTextDim: "#b0c0d0",
      accent: "#3060a0",
      progressBg: "#a0b0a0",
      scrollBg: "rgba(0,0,0,0.1)",
      scrollThumb: "rgba(0,0,0,0.3)",
      shadow: "rgba(0,0,0,0.2)",
      screenBg: "#b8c8a0",
    };

    return (
      <div
        style={{
          width: w,
          height: h,
          background: "linear-gradient(180deg, #f5f5f0, #e8e8e0, #ddd8d0)",
          borderRadius: w * 0.08,
          boxShadow:
            "6px 6px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.05)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: `${w * 0.06}px ${w * 0.08}px`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Screen */}
        <div
          style={{
            width: screenW,
            height: screenH,
            background: colors.screenBg,
            borderRadius: 4,
            border: "2px solid #a0a098",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {screen === "tracklist"
            ? renderTrackList(screenW, screenH, colors)
            : renderNowPlaying(screenW, screenH, colors)}
        </div>

        {/* 4 buttons in a row (Gen 3 style) */}
        <div
          style={{
            display: "flex",
            gap: w * 0.03,
            marginTop: h * 0.03,
            width: screenW,
            justifyContent: "center",
          }}
        >
          {[
            { label: "◀◀", action: handlePrev },
            { label: "MENU", action: handleMenu },
            { label: "▶ ❚❚", action: handlePlay },
            { label: "▶▶", action: handleNext },
          ].map((btn, i) => (
            <div
              key={i}
              onClick={btn.action}
              style={btnStyle({
                flex: 1,
                height: h * 0.045,
                background: "linear-gradient(180deg, #e8e4dc, #d8d4cc)",
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: btn.label === "MENU" ? 5.5 : 6,
                color: "#666",
                fontFamily: "'Space Mono', monospace",
                fontWeight: 700,
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.5)",
                letterSpacing: btn.label === "MENU" ? 1 : 0,
              })}
            >
              {btn.label}
            </div>
          ))}
        </div>

        {/* Scroll wheel */}
        <div
          style={{
            width: w * 0.62,
            aspectRatio: "1/1",
            borderRadius: "50%",
            background: "linear-gradient(180deg, #e4e0d8, #ccc8c0)",
            marginTop: "auto",
            marginBottom: w * 0.04,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow:
              "inset 0 2px 8px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)",
            position: "relative",
          }}
        >
          {/* Scroll zones */}
          <div
            onClick={handleScrollUp}
            style={btnStyle({
              position: "absolute",
              top: 0,
              left: "20%",
              right: "20%",
              height: "30%",
              borderRadius: "50% 50% 0 0",
            })}
          />
          <div
            onClick={handleScrollDown}
            style={btnStyle({
              position: "absolute",
              bottom: 0,
              left: "20%",
              right: "20%",
              height: "30%",
              borderRadius: "0 0 50% 50%",
            })}
          />
          {/* Center button */}
          <div
            onClick={handleCenter}
            style={btnStyle({
              width: "38%",
              height: "38%",
              borderRadius: "50%",
              background: "linear-gradient(180deg, #f0ece4, #e0dcd4)",
              boxShadow:
                "inset 0 1px 3px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.9)",
            })}
          />
        </div>
      </div>
    );
  }

  // ─── 2005-2007: iPod Mini/Nano ───
  if (model === "mini") {
    const w = size * 0.48;
    const h = size * 1.02;
    const screenW = w * 0.84;
    const screenH = h * 0.3;
    const yearColors = {
      2005: "#c0c0c0",
      2006: "#2a2a2a",
      2007: "#c0c0c0",
    };
    const bodyColor = yearColors[year] || "#c0c0c0";
    const isDark = bodyColor === "#2a2a2a";
    const colors = {
      headerBg: "linear-gradient(180deg, #3a3a5a, #2a2a4a)",
      headerText: "#fff",
      headerTextDim: "#8a8acc",
      border: "#222244",
      text: "#fff",
      dimText: "#8888aa",
      highlight: "#4466cc",
      highlightText: "#fff",
      highlightTextDim: "#b0b0dd",
      accent: "#6688ff",
      progressBg: "#333355",
      scrollBg: "rgba(255,255,255,0.05)",
      scrollThumb: "rgba(255,255,255,0.2)",
      shadow: "rgba(0,0,0,0.3)",
      screenBg: "#111122",
    };

    return (
      <div
        style={{
          width: w,
          height: h,
          background: `linear-gradient(180deg, ${bodyColor}, ${bodyColor}dd, ${bodyColor}bb)`,
          borderRadius: w * 0.1,
          boxShadow: `6px 6px 28px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,${isDark ? 0.1 : 0.4})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: `${w * 0.08}px`,
          position: "relative",
        }}
      >
        {/* Screen */}
        <div
          style={{
            width: screenW,
            height: screenH,
            background: colors.screenBg,
            borderRadius: 4,
            border: `1px solid ${isDark ? "#444" : "#999"}`,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {screen === "tracklist"
            ? renderTrackList(screenW, screenH, colors)
            : renderNowPlaying(screenW, screenH, colors)}
        </div>

        {/* Click wheel */}
        <div
          style={{
            width: w * 0.72,
            aspectRatio: "1/1",
            borderRadius: "50%",
            background: isDark
              ? "linear-gradient(180deg, #444, #333)"
              : `linear-gradient(180deg, rgba(255,255,255,0.2), rgba(0,0,0,0.05))`,
            marginTop: "auto",
            marginBottom: w * 0.06,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "inset 0 1px 5px rgba(0,0,0,0.15)",
            position: "relative",
            border: `1px solid rgba(${isDark ? "255,255,255,0.05" : "0,0,0,0.08"})`,
          }}
        >
          {/* Scroll zones */}
          <div onClick={handleScrollUp} style={btnStyle({ position: "absolute", top: 0, left: "20%", right: "20%", height: "30%", borderRadius: "50% 50% 0 0" })} />
          <div onClick={handleScrollDown} style={btnStyle({ position: "absolute", bottom: 0, left: "20%", right: "20%", height: "30%", borderRadius: "0 0 50% 50%" })} />

          {/* Labels */}
          <div style={{ position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", fontSize: 5, color: isDark ? "#888" : "rgba(0,0,0,0.35)", fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>MENU</div>
          <div onClick={handleMenu} style={btnStyle({ position: "absolute", top: "5%", left: "50%", transform: "translateX(-50%)", width: "50%", height: "18%" })} />
          <div style={{ position: "absolute", left: "10%", top: "50%", transform: "translateY(-50%)", fontSize: 6, color: isDark ? "#777" : "rgba(0,0,0,0.25)" }}>◀◀</div>
          <div onClick={handlePrev} style={btnStyle({ position: "absolute", left: 0, top: "30%", width: "30%", height: "40%" })} />
          <div style={{ position: "absolute", right: "10%", top: "50%", transform: "translateY(-50%)", fontSize: 6, color: isDark ? "#777" : "rgba(0,0,0,0.25)" }}>▶▶</div>
          <div onClick={handleNext} style={btnStyle({ position: "absolute", right: 0, top: "30%", width: "30%", height: "40%" })} />
          <div style={{ position: "absolute", bottom: "10%", left: "50%", transform: "translateX(-50%)", fontSize: 6, color: isDark ? "#777" : "rgba(0,0,0,0.25)" }}>▶❚❚</div>
          <div onClick={handlePlay} style={btnStyle({ position: "absolute", bottom: "5%", left: "50%", transform: "translateX(-50%)", width: "50%", height: "18%" })} />

          {/* Center button */}
          <div
            onClick={handleCenter}
            style={btnStyle({
              width: "34%",
              height: "34%",
              borderRadius: "50%",
              background: isDark
                ? "linear-gradient(180deg, #555, #444)"
                : `${bodyColor}`,
              boxShadow: `inset 0 1px 2px rgba(0,0,0,0.1), 0 1px 0 rgba(255,255,255,${isDark ? 0.05 : 0.3})`,
            })}
          />
        </div>
      </div>
    );
  }

  // ─── 2008-2012: iPod Classic Silver ───
  if (model === "classic") {
    const w = size * 0.58;
    const h = size * 1.08;
    const screenW = w * 0.86;
    const screenH = h * 0.38;
    const colors = {
      headerBg: "linear-gradient(180deg, #3a3a4a, #2a2a3a)",
      headerText: "#fff",
      headerTextDim: "#999",
      border: "#333",
      text: "#fff",
      dimText: "#777",
      highlight: "#2060cc",
      highlightText: "#fff",
      highlightTextDim: "#aac",
      accent: "#4488ff",
      progressBg: "#333",
      scrollBg: "rgba(255,255,255,0.05)",
      scrollThumb: "rgba(255,255,255,0.15)",
      shadow: "rgba(0,0,0,0.3)",
      screenBg: "#111",
    };

    return (
      <div
        style={{
          width: w,
          height: h,
          background: "linear-gradient(180deg, #e0e0e0, #c8c8c8, #b8b8b8)",
          borderRadius: w * 0.06,
          boxShadow:
            "6px 6px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.6)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: `${w * 0.06}px`,
          position: "relative",
          border: "1px solid rgba(0,0,0,0.1)",
        }}
      >
        {/* Brushed metal texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: w * 0.06,
            background:
              "repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(255,255,255,0.03) 1px, rgba(255,255,255,0.03) 2px)",
            pointerEvents: "none",
          }}
        />

        {/* Screen */}
        <div
          style={{
            width: screenW,
            height: screenH,
            background: colors.screenBg,
            borderRadius: 4,
            border: "1px solid #444",
            overflow: "hidden",
            position: "relative",
            zIndex: 1,
          }}
        >
          {screen === "tracklist"
            ? renderTrackList(screenW, screenH, colors)
            : renderNowPlaying(screenW, screenH, colors)}
        </div>

        {/* Dark click wheel */}
        <div
          style={{
            width: w * 0.7,
            aspectRatio: "1/1",
            borderRadius: "50%",
            background: "linear-gradient(180deg, #3a3a3a, #2a2a2a)",
            marginTop: "auto",
            marginBottom: w * 0.04,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow:
              "inset 0 2px 8px rgba(0,0,0,0.3), 0 1px 2px rgba(255,255,255,0.1)",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div onClick={handleScrollUp} style={btnStyle({ position: "absolute", top: 0, left: "20%", right: "20%", height: "30%", borderRadius: "50% 50% 0 0" })} />
          <div onClick={handleScrollDown} style={btnStyle({ position: "absolute", bottom: 0, left: "20%", right: "20%", height: "30%", borderRadius: "0 0 50% 50%" })} />

          <div style={{ position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", fontSize: 5.5, color: "#999", fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>MENU</div>
          <div onClick={handleMenu} style={btnStyle({ position: "absolute", top: "5%", left: "50%", transform: "translateX(-50%)", width: "50%", height: "18%" })} />
          <div style={{ position: "absolute", left: "10%", top: "50%", transform: "translateY(-50%)", fontSize: 6, color: "#777" }}>◀◀</div>
          <div onClick={handlePrev} style={btnStyle({ position: "absolute", left: 0, top: "30%", width: "30%", height: "40%" })} />
          <div style={{ position: "absolute", right: "10%", top: "50%", transform: "translateY(-50%)", fontSize: 6, color: "#777" }}>▶▶</div>
          <div onClick={handleNext} style={btnStyle({ position: "absolute", right: 0, top: "30%", width: "30%", height: "40%" })} />
          <div style={{ position: "absolute", bottom: "10%", left: "50%", transform: "translateX(-50%)", fontSize: 6, color: "#777" }}>▶ ❚❚</div>
          <div onClick={handlePlay} style={btnStyle({ position: "absolute", bottom: "5%", left: "50%", transform: "translateX(-50%)", width: "50%", height: "18%" })} />

          <div
            onClick={handleCenter}
            style={btnStyle({
              width: "34%",
              height: "34%",
              borderRadius: "50%",
              background: "linear-gradient(180deg, #555, #444)",
              boxShadow:
                "inset 0 1px 2px rgba(0,0,0,0.2), 0 1px 0 rgba(255,255,255,0.08)",
            })}
          />
        </div>
      </div>
    );
  }

  // ─── 2013-2015: iPod Nano 7th Gen ───
  const w = size * 0.42;
  const h = size * 0.98;
  const screenW = w * 0.88;
  const screenH = h * 0.62;
  const nanoColors = { 2013: "#e84040", 2014: "#38c870", 2015: "#4090e8" };
  const bodyColor = nanoColors[year] || "#888";
  const colors = {
    headerBg: "linear-gradient(180deg, rgba(0,0,0,0.6), rgba(0,0,0,0.4))",
    headerText: "#fff",
    headerTextDim: "rgba(255,255,255,0.5)",
    border: "rgba(255,255,255,0.1)",
    text: "#fff",
    dimText: "rgba(255,255,255,0.45)",
    highlight: "rgba(255,255,255,0.15)",
    highlightText: "#fff",
    highlightTextDim: "rgba(255,255,255,0.5)",
    accent: "#fff",
    progressBg: "rgba(255,255,255,0.15)",
    scrollBg: "rgba(255,255,255,0.05)",
    scrollThumb: "rgba(255,255,255,0.2)",
    shadow: "rgba(0,0,0,0.3)",
    screenBg: "#111",
  };

  return (
    <div
      style={{
        width: w,
        height: h,
        background: `linear-gradient(180deg, ${bodyColor}, ${bodyColor}dd)`,
        borderRadius: w * 0.12,
        boxShadow:
          "6px 6px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.3)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: `${w * 0.08}px`,
        position: "relative",
      }}
    >
      {/* Large touchscreen */}
      <div
        style={{
          width: screenW,
          height: screenH,
          background: colors.screenBg,
          borderRadius: 5,
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.2)",
          position: "relative",
        }}
      >
        {screen === "tracklist"
          ? renderTrackList(screenW, screenH, colors)
          : renderNowPlaying(screenW, screenH, colors)}
      </div>

      {/* Physical controls at bottom */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: w * 0.1,
          marginTop: "auto",
          marginBottom: w * 0.04,
        }}
      >
        <div
          onClick={handlePrev}
          style={btnStyle({
            fontSize: 7,
            color: "rgba(255,255,255,0.45)",
            padding: "4px 6px",
          })}
        >
          ◀◀
        </div>
        <div
          onClick={handlePlay}
          style={btnStyle({
            width: w * 0.18,
            height: w * 0.18,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 7,
            color: "rgba(255,255,255,0.7)",
          })}
        >
          {isPaused ? "▶" : "❚❚"}
        </div>
        <div
          onClick={handleNext}
          style={btnStyle({
            fontSize: 7,
            color: "rgba(255,255,255,0.45)",
            padding: "4px 6px",
          })}
        >
          ▶▶
        </div>
      </div>
      {/* Menu button */}
      <div
        onClick={handleMenu}
        style={btnStyle({
          fontSize: 5,
          color: "rgba(255,255,255,0.25)",
          fontFamily: "'Space Mono', monospace",
          letterSpacing: 1,
          marginBottom: w * 0.02,
        })}
      >
        MENU
      </div>
    </div>
  );
}
