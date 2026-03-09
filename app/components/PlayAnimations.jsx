"use client";
import { useState, useEffect } from "react";

// ─── CD PLAYER ANIMATION ───
export function CDPlayerAnimation({ album, onComplete }) {
  const [phase, setPhase] = useState(0);
  const cover = album?.cover || album?.coverMedium;
  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2200),
      setTimeout(() => setPhase(4), 3000),
      setTimeout(() => setPhase(5), 3600),
      setTimeout(() => { if (onComplete) onComplete(); }, 4300),
    ];
    return () => t.forEach(clearTimeout);
  }, [onComplete]);

  const ps = 260;
  const discSize = ps * 0.78;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0, position: "relative" }}>

      {/* Jewel case — shows at top, fades away */}
      <div style={{
        width: 160, height: 160,
        opacity: phase >= 2 ? 0 : 1,
        transform: phase >= 2 ? "scale(0.7) translateY(-30px)" : "",
        transition: "all 0.8s ease",
        position: phase >= 2 ? "absolute" : "relative",
        top: phase >= 2 ? -40 : undefined,
        zIndex: 15,
        marginBottom: phase < 2 ? 20 : 0,
      }}>
        <div style={{ width: "100%", height: "100%", background: cover ? `url(${cover}) center/cover` : "#333", boxShadow: "4px 4px 20px rgba(0,0,0,0.5)" }} />
        <div style={{ position: "absolute", left: -4, top: 2, bottom: 2, width: 6, background: "linear-gradient(90deg, #bbb, #eee, #bbb)", borderRadius: "2px 0 0 2px" }} />
      </div>

      {/* Floating disc — only visible phases 1-2, above the player */}
      {phase >= 1 && phase < 3 && (
        <div style={{
          position: "absolute",
          top: 15,
          width: 130, height: 130,
          borderRadius: "50%",
          overflow: "hidden",
          zIndex: 14,
          opacity: 1,
          transition: "all 0.6s ease",
        }}>
          {cover ? <img src={cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} draggable={false} /> : <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#ccc" }} />}
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "conic-gradient(from 0deg, rgba(255,255,255,0.08), rgba(200,220,255,0.05), rgba(255,200,200,0.04), rgba(200,255,200,0.05), rgba(255,255,255,0.08))", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "8%", height: "8%", borderRadius: "50%", background: "rgba(20,20,25,0.85)", border: "2px solid rgba(150,150,160,0.3)" }} />
        </div>
      )}

      {/* CD Player — the main element, centered by flexbox */}
      <div style={{
        width: ps, height: ps,
        borderRadius: 16,
        background: "linear-gradient(135deg, rgba(220,220,225,0.15), rgba(200,200,210,0.08), rgba(180,180,190,0.12))",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
        position: "relative",
        overflow: "hidden",
        opacity: phase >= 2 ? 1 : 0,
        transform: phase >= 2 ? "translateY(0)" : "translateY(60px)",
        transition: "all 0.9s cubic-bezier(0.23, 1, 0.32, 1)",
      }}>
        {/* Lid */}
        <div style={{
          position: "absolute", inset: 0, borderRadius: 16,
          background: "linear-gradient(135deg, rgba(220,220,225,0.2), rgba(200,200,210,0.1))",
          border: "1px solid rgba(255,255,255,0.08)",
          transformOrigin: "top center",
          transform: phase >= 2 && phase < 4 ? "rotateX(55deg) translateY(-60px)" : "rotateX(0deg)",
          opacity: phase >= 2 && phase < 4 ? 0.5 : 0.8,
          transition: "all 0.8s ease",
          zIndex: phase >= 4 ? 8 : 2,
        }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 16, background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%)", pointerEvents: "none" }} />
        </div>

        {/* Disc well */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: ps * 0.82, height: ps * 0.82,
          borderRadius: "50%",
          background: "rgba(30,30,35,0.3)",
          border: "1px solid rgba(255,255,255,0.04)",
        }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 12, height: 12, borderRadius: "50%", background: "linear-gradient(180deg, #aaa, #777)", boxShadow: "0 1px 4px rgba(0,0,0,0.3)", zIndex: 5 }} />
        </div>

        {/* Disc INSIDE player — appears at phase 3, perfectly centered as a child */}
        {phase >= 3 && (
          <div style={{
            position: "absolute",
            top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            width: discSize, height: discSize,
            borderRadius: "50%",
            overflow: "hidden",
            zIndex: 6,
            animation: phase >= 5 ? "cdSpin 3s linear infinite" : "fadeDiscIn 0.5s ease forwards",
          }}>
            {cover ? <img src={cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} draggable={false} /> : <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#ccc" }} />}
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "conic-gradient(from 0deg, rgba(255,255,255,0.08), rgba(200,220,255,0.05), rgba(255,200,200,0.04), rgba(200,255,200,0.05), rgba(255,255,255,0.08))", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "8%", height: "8%", borderRadius: "50%", background: "rgba(20,20,25,0.85)", border: "2px solid rgba(150,150,160,0.3)" }} />
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "20%", height: "20%", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)" }} />
          </div>
        )}

        {/* Corner clasps */}
        {[{t:8,l:8},{t:8,r:8},{b:8,l:8},{b:8,r:8}].map((pos, i) => (
          <div key={i} style={{ position: "absolute", top: pos.t, right: pos.r, bottom: pos.b, left: pos.l, width: 14, height: 14, background: "rgba(200,200,210,0.15)", borderRadius: 3, border: "1px solid rgba(255,255,255,0.06)", zIndex: 9 }} />
        ))}

        {/* Buttons */}
        <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6, zIndex: 9 }}>
          {["◀◀", "▶❚❚", "▶▶"].map((b, i) => (
            <div key={i} style={{ width: 18, height: 10, borderRadius: 2, background: "rgba(200,200,210,0.2)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 4, color: "rgba(255,255,255,0.3)" }}>{b}</div>
          ))}
        </div>

        {/* Headphone jack */}
        <div style={{ position: "absolute", right: -3, top: "50%", transform: "translateY(-50%)", width: 8, height: 8, borderRadius: "50%", background: "#444", border: "1px solid #555", zIndex: 9 }} />
      </div>

      {/* Status */}
      <div style={{ marginTop: 12, color: "rgba(255,255,255,0.2)", fontSize: 9, letterSpacing: 3, fontFamily: "'Space Mono', monospace" }}>
        {phase < 2 ? "" : phase < 3 ? "OPENING LID..." : phase < 4 ? "INSERTING DISC..." : phase < 5 ? "CLOSING LID..." : "PLAYING"}
      </div>

      <style>{`
        @keyframes cdSpin { from { transform: translate(-50%,-50%) rotate(0deg); } to { transform: translate(-50%,-50%) rotate(360deg); } }
        @keyframes fadeDiscIn { from { opacity: 0; transform: translate(-50%,-50%) scale(0.9); } to { opacity: 1; transform: translate(-50%,-50%) scale(1); } }
      `}</style>
    </div>
  );
}

// ─── VINYL TURNTABLE ANIMATION ───
// Key fix: single record element that smoothly moves from floating to on-platter
// Tonearm pivots from top-right, swings LEFT toward the record
export function VinylTurntableAnimation({ album, onComplete }) {
  const [phase, setPhase] = useState(0);
  const cover = album?.cover || album?.coverMedium;
  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 400),    // record slides out of sleeve
      setTimeout(() => setPhase(2), 1400),   // turntable rises, sleeve fades
      setTimeout(() => setPhase(3), 2400),   // record moves down onto platter
      setTimeout(() => setPhase(4), 3200),   // tonearm swings over record
      setTimeout(() => setPhase(5), 3800),   // spinning
      setTimeout(() => { if (onComplete) onComplete(); }, 4500),
    ];
    return () => t.forEach(clearTimeout);
  }, [onComplete]);

  // Layout: container is 340x420
  // Turntable sits at bottom, 280w x 210h, centered
  // Platter center is at approximately: left=22 + 85 = 107 from turntable left edge
  // Turntable left edge = (340-280)/2 = 30, so platter center x = 30+107 = 137
  // Turntable bottom=30 from container bottom, so turntable top = 420-30-210 = 180
  // Platter center y = 180 + 16 + 85 = 281

  // Record positions:
  // Phase 0-1: floating at top, center of container (170, 85)
  // Phase 3+: on platter center (137, 281) — but we use CSS to smoothly transition

  const getRecordStyle = () => {
    const base = {
      position: "absolute",
      width: 156, height: 156, borderRadius: "50%",
      transition: "all 1s cubic-bezier(0.23, 1, 0.32, 1)",
      zIndex: 14,
    };

    if (phase <= 1) {
      // Floating near top, sliding out of sleeve
      return {
        ...base,
        left: 170 - 78, top: 15,
        transform: phase === 0 ? "translateX(15px)" : "translateX(45px)",
        opacity: phase === 0 ? 0.4 : 1,
      };
    }
    if (phase === 2) {
      // Moving down toward platter area
      return {
        ...base,
        left: 170 - 78, top: 100,
        opacity: 1,
      };
    }
    // Phase 3+: on the platter
    return {
      ...base,
      left: 137 - 78, top: 281 - 78,
      opacity: 1,
      animation: phase >= 5 ? "vinylSpin 2.5s linear infinite" : "none",
      transition: phase >= 5 ? "none" : "all 1s cubic-bezier(0.23, 1, 0.32, 1)",
    };
  };

  return (
    <div style={{ width: 340, height: 420, position: "relative" }}>

      {/* Album sleeve - fades and slides away */}
      <div style={{
        position: "absolute", width: 150, height: 150,
        left: 95, top: 10,
        transform: phase >= 2 ? "translateX(-120px) scale(0.6)" : "",
        opacity: phase >= 2 ? 0 : 1,
        transition: "all 0.8s ease",
        zIndex: 15,
      }}>
        <div style={{ width: "100%", height: "100%", background: cover ? `url(${cover}) center/cover` : "#333", boxShadow: "4px 4px 20px rgba(0,0,0,0.5)" }} />
      </div>

      {/* Single record element that smoothly transitions position */}
      <div style={getRecordStyle()}>
        <div style={{
          width: "100%", height: "100%", borderRadius: "50%",
          background: "radial-gradient(circle, #1a1a1a 10%, transparent 11%, transparent 42%, #2a2a2a 42.5%, #1a1a1a 43.5%, transparent 44%, #111 100%)",
          boxShadow: "0 2px 15px rgba(0,0,0,0.5)",
          position: "relative",
        }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "conic-gradient(from 0deg, transparent, rgba(255,255,255,0.03), transparent, rgba(255,255,255,0.02), transparent, rgba(255,255,255,0.03), transparent)" }} />
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "28%", height: "28%", borderRadius: "50%", background: cover ? `url(${cover}) center/cover` : "linear-gradient(135deg, #c41e3a, #7a1225)", boxShadow: "inset 0 0 3px rgba(0,0,0,0.4)" }}>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 5, height: 5, borderRadius: "50%", background: "#0a0a0a" }} />
          </div>
        </div>
      </div>

      {/* Turntable - rises from bottom */}
      <div style={{
        position: "absolute",
        bottom: phase >= 2 ? 30 : -250,
        left: 30,
        opacity: phase >= 2 ? 1 : 0,
        transition: "all 0.9s cubic-bezier(0.23, 1, 0.32, 1)",
        zIndex: 10,
      }}>
        <div style={{
          width: 280, height: 210,
          background: "linear-gradient(180deg, #f0ece4, #e0dcd4, #d8d4cc)",
          borderRadius: 16,
          position: "relative",
          boxShadow: "0 6px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.6)",
        }}>
          {/* Platter */}
          <div style={{
            position: "absolute", top: 16, left: 22,
            width: 170, height: 170, borderRadius: "50%",
            background: "radial-gradient(circle, #aaa 2%, #c0c0c0 3%, #d8d8d8 40%, #c8c8c8 60%, #bbb 100%)",
            boxShadow: "inset 0 2px 8px rgba(0,0,0,0.12)",
          }}>
            <div style={{ position: "absolute", inset: "15%", borderRadius: "50%", border: "1px solid rgba(0,0,0,0.06)" }} />
            <div style={{ position: "absolute", inset: "30%", borderRadius: "50%", border: "1px solid rgba(0,0,0,0.05)" }} />
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 10, height: 10, borderRadius: "50%", background: "linear-gradient(180deg, #ccc, #999)", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
          </div>

          {/* Tonearm - pivots from top-right corner
              Resting: rotated away from record (clockwise, positive angle)
              Playing: rotated toward record (counter-clockwise, over the platter) */}
          <div style={{
            position: "absolute", top: 8, right: 18,
            width: 6, height: 95,
            background: "linear-gradient(90deg, #bbb, #ddd, #bbb)",
            borderRadius: 3,
            transformOrigin: "3px 8px",
            transform: phase >= 4 ? "rotate(45deg)" : "rotate(-5deg)",
            transition: "transform 1s cubic-bezier(0.23, 1, 0.32, 1)",
            boxShadow: "1px 1px 4px rgba(0,0,0,0.2)",
            zIndex: 20,
          }}>
            {/* Pivot point */}
            <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 14, height: 14, borderRadius: "50%", background: "linear-gradient(180deg, #ddd, #aaa)", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
            {/* Headshell + cartridge at bottom */}
            <div style={{ position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%)", width: 12, height: 10, background: "#888", borderRadius: "0 0 3px 3px" }}>
              {/* Red cartridge/stylus */}
              <div style={{ position: "absolute", bottom: -2, left: "50%", transform: "translateX(-50%)", width: 4, height: 5, background: "#cc3333", borderRadius: "0 0 1px 1px" }} />
            </div>
          </div>

          {/* Colored knobs */}
          <div style={{ position: "absolute", bottom: 8, left: 10, display: "flex", gap: 7 }}>
            {["#e07030", "#40a040", "#806030", "#eee"].map((c, i) => (
              <div key={i} style={{ width: 13, height: 13, borderRadius: "50%", background: `radial-gradient(circle at 40% 35%, ${c}cc, ${c})`, boxShadow: "0 1px 3px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.2)" }} />
            ))}
          </div>

          {/* Power LED */}
          <div style={{ position: "absolute", bottom: 10, right: 18, width: 22, height: 9, borderRadius: 5, background: phase >= 5 ? "linear-gradient(90deg, #cc3333, #ee4444)" : "#553333", boxShadow: phase >= 5 ? "0 0 8px rgba(200,50,50,0.5)" : "none", transition: "all 0.5s ease" }} />
        </div>
      </div>

      {/* Status */}
      <div style={{ position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.2)", fontSize: 9, letterSpacing: 3, fontFamily: "'Space Mono', monospace" }}>
        {phase < 2 ? "" : phase <= 3 ? "PLACING RECORD..." : phase < 5 ? "DROPPING NEEDLE..." : "PLAYING"}
      </div>

      <style>{`
        @keyframes vinylSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ─── CASSETTE PLAYER ANIMATION ───
export function CassettePlayerAnimation({ album, onComplete }) {
  const [phase, setPhase] = useState(0);
  const cover = album?.cover || album?.coverMedium;
  useEffect(() => {
    const t = [setTimeout(() => setPhase(1), 300), setTimeout(() => setPhase(2), 1000), setTimeout(() => setPhase(3), 1800), setTimeout(() => setPhase(4), 2600), setTimeout(() => setPhase(5), 3200), setTimeout(() => { if (onComplete) onComplete(); }, 4000)];
    return () => t.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div style={{ width: 360, height: 360, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* J-card fading */}
      <div style={{ position: "absolute", width: 150, height: 100, left: "50%", top: "8%", transform: `translateX(-50%) ${phase >= 2 ? "translateY(-30px) scale(0.7)" : ""}`, opacity: phase >= 2 ? 0 : 1, transition: "all 0.6s ease", zIndex: 5, background: "#1a1a1a", borderRadius: 4, boxShadow: "3px 3px 15px rgba(0,0,0,0.4)", overflow: "hidden" }}>
        {cover && <img src={cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} draggable={false} />}
      </div>
      {/* Cassette tape */}
      <div style={{ position: "absolute", width: 140, height: 88, left: "50%", top: phase >= 3 ? "42%" : "10%", transform: `translateX(-50%) ${phase >= 3 ? "scale(0.8)" : ""}`, opacity: phase === 0 ? 0.3 : phase >= 4 ? 0 : 1, transition: "all 0.8s cubic-bezier(0.23, 1, 0.32, 1)", zIndex: phase >= 3 ? 12 : 6, background: "linear-gradient(180deg, #e8e4d8, #d8d0c4)", borderRadius: 4, border: "1px solid rgba(0,0,0,0.1)" }}>
        <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", width: "60%", height: 24, background: "rgba(60,40,20,0.15)", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 20, border: "1px solid rgba(0,0,0,0.06)" }}>
          {[0, 1].map(i => <div key={i} style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(0,0,0,0.12)", background: "#c8c0b0" }} />)}
        </div>
        <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", width: "80%", height: 18, background: "rgba(255,255,255,0.5)", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 5, color: "rgba(0,0,0,0.4)", fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}>{album?.title?.substring(0, 22)}</div>
        </div>
      </div>
      {/* Classic Walkman F1 — horizontal */}
      <div style={{ position: "absolute", bottom: phase >= 2 ? 30 : -300, left: "50%", transform: "translateX(-50%)", opacity: phase >= 2 ? 1 : 0, transition: "all 0.8s cubic-bezier(0.23, 1, 0.32, 1)", zIndex: 10 }}>
        <div style={{ width: 240, height: 156, background: "linear-gradient(180deg, #d0ccc4, #c8c4bc, #bbb8b0, #c0bcb4)", borderRadius: 6, position: "relative", boxShadow: "0 6px 28px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.5)", border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden" }}>
          {/* Top dark strip */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: "linear-gradient(180deg, #3a3a50, #2a2a3a)", borderRadius: "6px 6px 0 0" }} />
          {/* SONY */}
          <div style={{ position: "absolute", top: 12, left: 14, fontSize: 9, fontWeight: 700, color: "#2a2a60", fontFamily: "'Space Mono', monospace", letterSpacing: 2 }}>SONY</div>
          {/* Tape window — right side, no red */}
          <div style={{ position: "absolute", top: 20, right: 18, width: 120, height: 80, background: "#1a1a1a", borderRadius: 4, border: "2px solid #888", overflow: "hidden", boxShadow: "inset 0 1px 4px rgba(0,0,0,0.4)" }}>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
              {phase >= 4 && [0, 1].map(i => (
                <div key={i} style={{ width: 26, height: 26, borderRadius: "50%", background: "#111", border: "2px solid #333", position: "relative", animation: phase >= 5 ? `reelSpin ${1.6 + i * 0.5}s linear infinite` : "none" }}>
                  {[0, 1, 2, 3, 4, 5].map(s => <div key={s} style={{ position: "absolute", top: "50%", left: "50%", width: "70%", height: 1, background: "rgba(255,255,255,0.12)", transform: `translate(-50%,-50%) rotate(${s * 60}deg)` }} />)}
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "35%", height: "35%", borderRadius: "50%", background: "#222", border: "1px solid #444" }} />
                </div>
              ))}
            </div>
            {/* Tape between reels */}
            <div style={{ position: "absolute", top: "50%", left: "20%", right: "20%", height: 1, background: "rgba(139,90,43,0.3)" }} />
          </div>
          {/* Door overlay */}
          <div style={{ position: "absolute", top: 18, right: 16, width: 124, height: phase >= 4 ? 0 : 84, background: "linear-gradient(180deg, #c8c4bc, #b8b4ac)", borderRadius: 4, transition: "height 0.5s ease", overflow: "hidden", zIndex: 11, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }} />
          {/* Volume slider */}
          <div style={{ position: "absolute", left: 70, top: 24, width: 3, height: 60, background: "linear-gradient(180deg, #999, #aaa, #999)", borderRadius: 2 }}>
            <div style={{ position: "absolute", top: "35%", left: "50%", transform: "translateX(-50%)", width: 9, height: 5, borderRadius: 1, background: "linear-gradient(180deg, #ddd, #bbb)", boxShadow: "0 1px 2px rgba(0,0,0,0.3)" }} />
          </div>
          {/* Headphone jack */}
          <div style={{ position: "absolute", left: 30, top: 55, width: 6, height: 6, borderRadius: "50%", background: "#666", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.4)" }} />
          {/* Arrow */}
          <div style={{ position: "absolute", left: 34, top: 38, fontSize: 9, color: "rgba(0,0,0,0.1)" }}>↓</div>
          {/* WALKMAN branding */}
          <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", textAlign: "center", whiteSpace: "nowrap" }}>
            <div style={{ fontSize: 4, color: "rgba(0,0,50,0.18)", fontFamily: "'Space Mono', monospace", letterSpacing: 1, marginBottom: 1 }}>FM STEREO</div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 3 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#2a2a60", fontFamily: "'Space Mono', monospace", letterSpacing: 2 }}>WALKMAN</span>
              <span style={{ fontSize: 7, color: "rgba(0,0,50,0.25)", fontFamily: "'Space Mono', monospace" }}>F1</span>
            </div>
          </div>
          {/* Side buttons — left edge */}
          <div style={{ position: "absolute", left: -5, top: 30, display: "flex", flexDirection: "column", gap: 4 }}>
            {[0, 1, 2].map(i => <div key={i} style={{ width: 10, height: 18, borderRadius: "3px 0 0 3px", background: "linear-gradient(90deg, #777, #aaa, #999)", boxShadow: "-1px 0 3px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)" }} />)}
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.2)", fontSize: 9, letterSpacing: 3, fontFamily: "'Space Mono', monospace" }}>
        {phase < 2 ? "" : phase < 4 ? "INSERTING TAPE..." : phase < 5 ? "PRESS PLAY..." : "PLAYING"}
      </div>
      <style>{`@keyframes reelSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── STREAMING ANIMATION ───
export function StreamingAnimation({ album, onComplete }) {
  const [phase, setPhase] = useState(0);
  const cover = album?.cover || album?.coverMedium;
  useEffect(() => { const t = [setTimeout(() => setPhase(1), 200), setTimeout(() => setPhase(2), 800), setTimeout(() => { if (onComplete) onComplete(); }, 1500)]; return () => t.forEach(clearTimeout); }, [onComplete]);
  return (
    <div style={{ width: 300, height: 300, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: phase >= 1 ? 240 : 160, height: phase >= 1 ? 240 : 160, borderRadius: phase >= 2 ? 6 : 4, overflow: "hidden", transition: "all 0.8s cubic-bezier(0.23, 1, 0.32, 1)", boxShadow: phase >= 1 ? "0 8px 40px rgba(0,0,0,0.5)" : "0 4px 20px rgba(0,0,0,0.3)" }}>
        {cover && <img src={cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} draggable={false} />}
      </div>
      <div style={{ position: "absolute", inset: -30, background: cover ? `url(${cover}) center/cover` : "transparent", filter: "blur(50px)", opacity: phase >= 1 ? 0.2 : 0, transition: "opacity 1s ease", zIndex: -1 }} />
    </div>
  );
}
