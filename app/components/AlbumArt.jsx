"use client";
import IPod from "./IPod";

export function getEraFormat(year) {
  if (year < 1978) return "vinyl";
  if (year <= 1991) return "cassette";
  if (year <= 2000) return "cd";
  if (year <= 2015) return "ipod";
  return "streaming";
}

export function getEraLabel(format) {
  return { vinyl: "VINYL", cassette: "CASSETTE", cd: "COMPACT DISC", ipod: "iPod", streaming: "STREAMING" }[format] || "DIGITAL";
}

function FallbackCover({ album, size }) {
  return (
    <div style={{ width: size, height: size, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: size * 0.1, background: "linear-gradient(135deg, #333, #1a1a1a)" }}>
      <div style={{ color: "rgba(255,255,255,0.9)", fontSize: Math.max(size * 0.07, 11), fontWeight: 700, textAlign: "center", lineHeight: 1.3 }}>{album.title}</div>
      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: Math.max(size * 0.045, 9), marginTop: 6, textAlign: "center" }}>{album.artist}</div>
    </div>
  );
}

function VinylSleeve({ album, size }) {
  const cover = album.cover || album.coverMedium;
  const discSize = size * 0.92;
  const peekAmount = size * 0.18;
  return (
    <div style={{ position: "relative", width: size + peekAmount, height: size }}>
      <div style={{ position: "absolute", right: 0, top: (size - discSize) / 2, width: discSize, height: discSize, borderRadius: "50%", background: "radial-gradient(circle at 50% 50%, #1a1a1a 10%, transparent 11%), radial-gradient(circle at 50% 50%, #333 12%, transparent 13%), radial-gradient(circle at 50% 50%, transparent 42%, #2a2a2a 42.5%, #1a1a1a 43.5%, transparent 44%), radial-gradient(circle at 50% 50%, #111 0%, #1a1a1a 100%)", boxShadow: "4px 2px 20px rgba(0,0,0,0.6)" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: discSize * 0.28, height: discSize * 0.28, borderRadius: "50%", background: cover ? `url(${cover}) center/cover` : "linear-gradient(135deg, #c41e3a, #7a1225)", boxShadow: "inset 0 0 4px rgba(0,0,0,0.4)" }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: discSize * 0.04, height: discSize * 0.04, borderRadius: "50%", background: "#0a0a0a" }} />
        </div>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "conic-gradient(from 0deg, transparent, rgba(255,255,255,0.02), transparent, rgba(255,255,255,0.015), transparent)", pointerEvents: "none" }} />
      </div>
      <div style={{ position: "relative", width: size, height: size, zIndex: 2, boxShadow: "6px 4px 28px rgba(0,0,0,0.7)", overflow: "hidden" }}>
        {cover ? <img src={cover} alt="" style={{ width: size, height: size, objectFit: "cover" }} draggable={false} /> : <FallbackCover album={album} size={size} />}
        <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 12, background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.15))", pointerEvents: "none" }} />
      </div>
    </div>
  );
}

function CassetteTape({ album, size }) {
  const cover = album.cover || album.coverMedium;
  const caseHeight = size * 0.68;
  const tapeHeight = size * 0.15;
  return (
    <div style={{ position: "relative", width: size, height: caseHeight + tapeHeight * 0.6 }}>
      {/* Cassette peeking from top - realistic cream/white */}
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: size * 0.88, height: tapeHeight + caseHeight * 0.1, background: "linear-gradient(180deg, #e8e4d8, #d8d0c4, #e0dcd0)", borderRadius: "4px 4px 0 0", zIndex: 1, boxShadow: "0 -2px 12px rgba(0,0,0,0.4)", border: "1px solid rgba(0,0,0,0.08)" }}>
        <div style={{ position: "absolute", top: 6, left: "50%", transform: "translateX(-50%)", width: size * 0.5, height: tapeHeight * 0.55, background: "rgba(60,40,20,0.15)", borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", gap: size * 0.12, border: "1px solid rgba(0,0,0,0.08)" }}>
          {[0, 1].map(idx => <div key={idx} style={{ width: tapeHeight * 0.35, height: tapeHeight * 0.35, borderRadius: "50%", border: "2px solid rgba(0,0,0,0.15)", background: "radial-gradient(circle, #c8c0b0 35%, #a09880 100%)" }} />)}
        </div>
        <div style={{ position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)", color: "rgba(0,0,0,0.2)", fontSize: 5, letterSpacing: 2, fontFamily: "'Space Mono', monospace" }}>TYPE II HIGH BIAS</div>
      </div>
      {/* J-card case */}
      <div style={{ position: "absolute", bottom: 0, left: 0, width: size, height: caseHeight, background: "linear-gradient(180deg, #1a1a1a, #111)", borderRadius: 4, boxShadow: "4px 4px 24px rgba(0,0,0,0.7)", overflow: "hidden", zIndex: 2 }}>
        <div style={{ margin: size * 0.035, borderRadius: 2, overflow: "hidden", height: "70%" }}>
          {cover ? <img src={cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} draggable={false} /> : <FallbackCover album={album} size={size * 0.6} />}
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "22%", display: "flex", alignItems: "center", justifyContent: "center", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ color: "rgba(255,255,255,0.35)", fontSize: Math.max(size * 0.035, 8), fontFamily: "'Space Mono', monospace", letterSpacing: 1, textTransform: "uppercase" }}>{album.artist}</div>
        </div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.02) 100%)", pointerEvents: "none" }} />
      </div>
    </div>
  );
}

function CDCase({ album, size }) {
  const cover = album.cover || album.coverMedium;
  const discPeek = size * 0.12;
  return (
    <div style={{ position: "relative", width: size, height: size + discPeek * 0.7 }}>
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: size * 0.7, height: size * 0.7, borderRadius: "50%", background: "conic-gradient(from 0deg, rgba(200,200,220,0.9), rgba(180,180,210,0.7), rgba(220,220,240,0.9), rgba(190,190,220,0.7), rgba(200,200,220,0.9))", boxShadow: "0 -2px 15px rgba(0,0,0,0.3)", zIndex: 1 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "conic-gradient(from 45deg, rgba(255,0,0,0.05), rgba(255,165,0,0.05), rgba(255,255,0,0.05), rgba(0,128,0,0.05), rgba(0,0,255,0.05), rgba(128,0,128,0.05), rgba(255,0,0,0.05))", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: size * 0.18, height: size * 0.18, borderRadius: "50%", background: cover ? `url(${cover}) center/cover` : "#aaa", border: "2px solid rgba(200,200,200,0.5)" }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: size * 0.035, height: size * 0.035, borderRadius: "50%", border: "1px solid rgba(150,150,150,0.5)" }} />
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, width: size, height: size, boxShadow: "4px 4px 28px rgba(0,0,0,0.7)", zIndex: 2 }}>
        <div style={{ position: "absolute", left: -5, top: 3, bottom: 3, width: 8, background: "linear-gradient(90deg, #bbb, #f0f0f0, #ccc, #eee, #bbb)", borderRadius: "2px 0 0 2px" }} />
        <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
          {cover ? <img src={cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} draggable={false} /> : <FallbackCover album={album} size={size} />}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.08) 100%)", pointerEvents: "none" }} />
        </div>
      </div>
    </div>
  );
}

function StreamingCover({ album, size }) {
  const cover = album.cover || album.coverMedium;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {cover ? <img src={cover} alt="" style={{ width: size, height: size, objectFit: "cover", borderRadius: 6, boxShadow: "0 8px 40px rgba(0,0,0,0.6)" }} draggable={false} /> : <FallbackCover album={album} size={size} />}
      <div style={{ position: "absolute", inset: -20, background: cover ? `url(${cover}) center/cover` : "transparent", filter: "blur(40px)", opacity: 0.15, zIndex: -1, borderRadius: 20 }} />
    </div>
  );
}

export default function AlbumArt({ album, year, size = 250, ipodProps }) {
  const format = getEraFormat(year);
  if (format === "vinyl") return <VinylSleeve album={album} size={size} />;
  if (format === "cassette") return <CassetteTape album={album} size={size} />;
  if (format === "cd") return <CDCase album={album} size={size} />;
  if (format === "ipod") {
    // Show iPod only when playing (ipodProps passed), otherwise show album cover
    if (ipodProps) return <IPod album={album} year={year} size={size} {...ipodProps} />;
    return <StreamingCover album={album} size={size} />;
  }
  if (format === "streaming") return <StreamingCover album={album} size={size} />;
  return null;
}
