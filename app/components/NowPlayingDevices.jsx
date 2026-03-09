"use client";

// ─── SPINNING TURNTABLE (Now Playing for vinyl era) ───
export function TurntablePlaying({ album, size = 280 }) {
  const cover = album?.cover || album?.coverMedium;
  const w = size;
  const h = size * 0.75;

  return (
    <div style={{ width: w, height: h, position: "relative" }}>
      {/* Turntable base */}
      <div style={{
        width: w, height: h,
        background: "linear-gradient(180deg, #f0ece4, #e0dcd4, #d8d4cc)",
        borderRadius: 16,
        position: "relative",
        boxShadow: "0 6px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.6)",
        overflow: "hidden",
      }}>
        {/* Platter with spinning record */}
        <div style={{
          position: "absolute", top: h * 0.06, left: w * 0.06,
          width: w * 0.65, height: w * 0.65, borderRadius: "50%",
          background: "radial-gradient(circle, #aaa 2%, #c0c0c0 3%, #d8d8d8 40%, #c8c8c8 60%, #bbb 100%)",
          boxShadow: "inset 0 2px 8px rgba(0,0,0,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {/* Vinyl record on platter - spinning */}
          <div style={{
            width: "92%", height: "92%", borderRadius: "50%",
            background: `
              radial-gradient(circle, #1a1a1a 10%, transparent 11%),
              radial-gradient(circle, #333 12%, transparent 13%),
              radial-gradient(circle, transparent 42%, #2a2a2a 42.5%, #1a1a1a 43.5%, transparent 44%),
              radial-gradient(circle, #111 0%, #1a1a1a 100%)
            `,
            animation: "recordSpin 2.5s linear infinite",
            position: "relative",
          }}>
            {/* Grooves shimmer */}
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "conic-gradient(from 0deg, transparent, rgba(255,255,255,0.03), transparent, rgba(255,255,255,0.02), transparent, rgba(255,255,255,0.03), transparent)" }} />
            {/* Center label with album art */}
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "30%", height: "30%", borderRadius: "50%", background: cover ? `url(${cover}) center/cover` : "linear-gradient(135deg, #c41e3a, #7a1225)", boxShadow: "inset 0 0 3px rgba(0,0,0,0.4)" }}>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 4, height: 4, borderRadius: "50%", background: "#0a0a0a" }} />
            </div>
          </div>
        </div>

        {/* Tonearm - in playing position */}
        <div style={{
          position: "absolute", top: h * 0.03, right: w * 0.07,
          width: 6, height: h * 0.55,
          background: "linear-gradient(90deg, #bbb, #ddd, #bbb)",
          borderRadius: 3,
          transformOrigin: "3px 8px",
          transform: "rotate(45deg)",
          boxShadow: "1px 1px 4px rgba(0,0,0,0.2)",
          zIndex: 5,
        }}>
          <div style={{ position: "absolute", top: -5, left: "50%", transform: "translateX(-50%)", width: 14, height: 14, borderRadius: "50%", background: "linear-gradient(180deg, #ddd, #aaa)", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
          <div style={{ position: "absolute", bottom: -3, left: "50%", transform: "translateX(-50%)", width: 10, height: 8, background: "#999", borderRadius: "0 0 2px 2px" }}>
            <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, background: "#cc3333", borderRadius: 1 }} />
          </div>
        </div>

        {/* Colored knobs */}
        <div style={{ position: "absolute", bottom: h * 0.06, left: w * 0.04, display: "flex", gap: 8 }}>
          {["#e07030", "#40a040", "#806030", "#eee"].map((c, i) => (
            <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: `radial-gradient(circle at 40% 35%, ${c}cc, ${c})`, boxShadow: "0 1px 3px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.2)" }} />
          ))}
        </div>

        {/* Power LED */}
        <div style={{ position: "absolute", bottom: h * 0.08, right: w * 0.06, width: 22, height: 9, borderRadius: 5, background: "linear-gradient(90deg, #cc3333, #ee4444)", boxShadow: "0 0 8px rgba(200,50,50,0.5)" }} />
      </div>

      <style>{`@keyframes recordSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── TRANSPARENT CD PLAYER (Now Playing for CD era) ───
// Based on clear portable CD players — disc with album art spins visible through transparent lid
export function CDPlayerPlaying({ album, size = 280 }) {
  const cover = album?.cover || album?.coverMedium;
  const s = size;

  return (
    <div style={{ width: s, height: s, position: "relative" }}>
      {/* Player body — square with rounded corners, transparent look */}
      <div style={{
        width: s, height: s,
        borderRadius: 16,
        background: "linear-gradient(135deg, rgba(220,220,225,0.15), rgba(200,200,210,0.08), rgba(180,180,190,0.12))",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.1)",
        position: "relative",
        overflow: "hidden",
        backdropFilter: "blur(2px)",
      }}>
        {/* Transparent plastic texture */}
        <div style={{ position: "absolute", inset: 0, borderRadius: 16, background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.03) 100%)", pointerEvents: "none" }} />

        {/* Spinning disc with album art */}
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: s * 0.78, height: s * 0.78,
          borderRadius: "50%",
          animation: "discSpin 3s linear infinite",
          overflow: "hidden",
        }}>
          {/* Album art fills the disc */}
          {cover ? (
            <img src={cover} alt="" style={{
              width: "100%", height: "100%", objectFit: "cover",
              borderRadius: "50%",
            }} draggable={false} />
          ) : (
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "conic-gradient(from 0deg, #ddd, #bbb, #ddd, #ccc, #ddd)" }} />
          )}

          {/* CD surface overlay — rainbow refraction */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: "conic-gradient(from 0deg, rgba(255,255,255,0.08), rgba(200,220,255,0.06), rgba(255,200,200,0.04), rgba(200,255,200,0.06), rgba(255,255,255,0.08))",
            pointerEvents: "none",
          }} />

          {/* Center hole */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: s * 0.08, height: s * 0.08,
            borderRadius: "50%",
            background: "rgba(20,20,25,0.8)",
            border: "2px solid rgba(150,150,160,0.3)",
            boxShadow: "0 0 8px rgba(0,0,0,0.3)",
          }} />

          {/* Inner ring */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: s * 0.2, height: s * 0.2,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.1)",
          }} />
        </div>

        {/* Transparent lid highlight */}
        <div style={{
          position: "absolute", inset: 0, borderRadius: 16,
          background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.04) 100%)",
          pointerEvents: "none", zIndex: 3,
        }} />

        {/* Spindle in center */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: s * 0.05, height: s * 0.05,
          borderRadius: "50%",
          background: "linear-gradient(180deg, #aaa, #777)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
          zIndex: 4,
        }} />

        {/* Corner clasps / latches */}
        {[[8, 8], [8, null, null, 8], [null, null, 8, 8], [null, 8, 8, null]].map((pos, i) => (
          <div key={i} style={{
            position: "absolute",
            top: pos[0] != null ? pos[0] : undefined,
            right: pos[1] != null ? pos[1] : undefined,
            bottom: pos[2] != null ? pos[2] : undefined,
            left: pos[3] != null ? pos[3] : undefined,
            width: 14, height: 14,
            background: "rgba(200,200,210,0.15)",
            borderRadius: 3,
            border: "1px solid rgba(255,255,255,0.08)",
            zIndex: 5,
          }} />
        ))}

        {/* Headphone jack on side */}
        <div style={{
          position: "absolute", right: -3, top: "50%", transform: "translateY(-50%)",
          width: 8, height: 8, borderRadius: "50%",
          background: "#444", border: "1px solid #555", zIndex: 5,
        }} />

        {/* Small buttons on front edge */}
        <div style={{
          position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)",
          display: "flex", gap: 6, zIndex: 5,
        }}>
          {["◀◀", "▶❚❚", "▶▶", "■"].map((b, i) => (
            <div key={i} style={{
              width: 18, height: 10, borderRadius: 2,
              background: "rgba(200,200,210,0.2)",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 4, color: "rgba(255,255,255,0.3)",
            }}>{b}</div>
          ))}
        </div>
      </div>

      <style>{`@keyframes discSpin { from { transform: translate(-50%,-50%) rotate(0deg); } to { transform: translate(-50%,-50%) rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── CLASSIC WALKMAN (Now Playing for cassette era) ───
// Horizontal Sony Walkman F1 — silver body, tape window, side buttons
export function WalkmanPlaying({ album, size = 280 }) {
  const w = size;
  const h = size * 0.65;

  return (
    <div style={{ width: w, height: h, position: "relative" }}>
      <div style={{
        width: w, height: h,
        background: "linear-gradient(180deg, #d0ccc4, #c8c4bc, #bbb8b0, #c0bcb4)",
        borderRadius: 6,
        position: "relative",
        boxShadow: "0 6px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.5), inset -1px 0 0 rgba(255,255,255,0.2)",
        border: "1px solid rgba(0,0,0,0.08)",
        overflow: "hidden",
      }}>
        {/* Brushed metal texture */}
        <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.015) 1px, rgba(255,255,255,0.015) 2px)", pointerEvents: "none" }} />

        {/* Top dark strip */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: h * 0.04, background: "linear-gradient(180deg, #3a3a50, #2a2a3a)", borderRadius: "6px 6px 0 0" }} />

        {/* SONY branding - top left area */}
        <div style={{ position: "absolute", top: h * 0.08, left: w * 0.06, fontSize: 10, fontWeight: 700, color: "#2a2a60", fontFamily: "'Space Mono', monospace", letterSpacing: 3 }}>SONY</div>

        {/* Tape window — right side of body, no red */}
        <div style={{
          position: "absolute",
          top: h * 0.15, right: w * 0.08,
          width: w * 0.5, height: h * 0.52,
          background: "#1a1a1a",
          borderRadius: 4,
          border: "2px solid #888",
          overflow: "hidden",
          boxShadow: "inset 0 1px 4px rgba(0,0,0,0.4)",
        }}>
          {/* Spinning reels */}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: w * 0.08 }}>
            {[0, 1].map(i => (
              <div key={i} style={{
                width: h * 0.22, height: h * 0.22, borderRadius: "50%",
                background: "#111",
                border: "2px solid #333",
                position: "relative",
                animation: `reelSpin ${1.6 + i * 0.5}s linear infinite`,
              }}>
                {[0, 1, 2, 3, 4, 5].map(s => (
                  <div key={s} style={{
                    position: "absolute", top: "50%", left: "50%",
                    width: "70%", height: 1,
                    background: "rgba(255,255,255,0.12)",
                    transform: `translate(-50%,-50%) rotate(${s * 60}deg)`,
                  }} />
                ))}
                <div style={{
                  position: "absolute", top: "50%", left: "50%",
                  transform: "translate(-50%,-50%)",
                  width: "35%", height: "35%", borderRadius: "50%",
                  background: "#222", border: "1px solid #444",
                }} />
              </div>
            ))}
          </div>
          {/* Tape between reels */}
          <div style={{ position: "absolute", top: "50%", left: "20%", right: "20%", height: 1, background: "rgba(139,90,43,0.3)" }} />
        </div>

        {/* Volume slider — left of tape window */}
        <div style={{
          position: "absolute", left: w * 0.32, top: h * 0.18,
          width: 3, height: h * 0.45,
          background: "linear-gradient(180deg, #999, #aaa, #999)",
          borderRadius: 2,
          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.15)",
        }}>
          <div style={{
            position: "absolute", top: "35%", left: "50%", transform: "translateX(-50%)",
            width: 9, height: 6, borderRadius: 2,
            background: "linear-gradient(180deg, #ddd, #bbb)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
          }} />
        </div>
        {/* Scale markings next to slider */}
        <div style={{ position: "absolute", left: w * 0.26, top: h * 0.18, fontSize: 4, color: "rgba(0,0,0,0.15)", fontFamily: "'Space Mono', monospace" }}>10</div>
        <div style={{ position: "absolute", left: w * 0.27, top: h * 0.57, fontSize: 4, color: "rgba(0,0,0,0.15)", fontFamily: "'Space Mono', monospace" }}>0</div>

        {/* Arrow indicator */}
        <div style={{ position: "absolute", left: w * 0.15, top: h * 0.4, fontSize: 10, color: "rgba(0,0,0,0.1)" }}>↓</div>

        {/* Headphone jack */}
        <div style={{ position: "absolute", left: w * 0.12, top: h * 0.55, width: 6, height: 6, borderRadius: "50%", background: "#666", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.4)" }} />

        {/* FM STEREO WALKMAN branding — bottom */}
        <div style={{ position: "absolute", bottom: h * 0.06, left: "50%", transform: "translateX(-50%)", textAlign: "center", whiteSpace: "nowrap" }}>
          <div style={{ fontSize: 5, color: "rgba(0,0,50,0.2)", fontFamily: "'Space Mono', monospace", letterSpacing: 1, marginBottom: 1 }}>FM STEREO</div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#2a2a60", fontFamily: "'Space Mono', monospace", letterSpacing: 2 }}>WALKMAN</span>
            <span style={{ fontSize: 8, color: "rgba(0,0,50,0.3)", fontFamily: "'Space Mono', monospace" }}>F1</span>
          </div>
        </div>

        {/* Side buttons — left edge, protruding */}
        <div style={{
          position: "absolute", left: -5, top: h * 0.25,
          display: "flex", flexDirection: "column", gap: 4,
        }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 10, height: 20, borderRadius: "3px 0 0 3px",
              background: "linear-gradient(90deg, #777, #aaa, #999)",
              boxShadow: "-1px 0 3px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)",
            }} />
          ))}
        </div>

        {/* Subtle wear marks */}
        <div style={{ position: "absolute", top: h * 0.35, left: w * 0.08, width: 15, height: 1, background: "rgba(255,255,255,0.04)", transform: "rotate(-8deg)" }} />
      </div>

      <style>{`@keyframes reelSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
