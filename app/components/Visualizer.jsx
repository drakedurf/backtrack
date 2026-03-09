"use client";
import { useEffect, useRef } from "react";

// Shared audio analysis hook
function useAudioData(isPlaying) {
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const dataRef = useRef(null);
  const connectedRef = useRef(false);

  useEffect(() => {
    if (!isPlaying || connectedRef.current) return;
    const setup = async () => {
      try {
        const els = document.querySelectorAll("audio");
        let target = null;
        for (const el of els) { if (el.src || el.srcObject) { target = el; break; } }
        if (target && !audioCtxRef.current) {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const an = ctx.createAnalyser(); an.fftSize = 256; an.smoothingTimeConstant = 0.7;
          const src = ctx.createMediaElementSource(target);
          src.connect(an); an.connect(ctx.destination);
          audioCtxRef.current = ctx; analyserRef.current = an;
          dataRef.current = new Uint8Array(an.frequencyBinCount);
          connectedRef.current = true;
        }
      } catch (e) { /* fallback */ }
    };
    const t = setTimeout(setup, 1000);
    return () => clearTimeout(t);
  }, [isPlaying]);

  return { analyserRef, dataRef };
}

function getAudioLevels(analyserRef, dataRef, isPlaying, time) {
  let bass = 0, mid = 0, high = 0;
  if (analyserRef.current && dataRef.current && isPlaying) {
    analyserRef.current.getByteFrequencyData(dataRef.current);
    const d = dataRef.current; const len = d.length;
    const bE = Math.floor(len * 0.15);
    let bS = 0; for (let i = 0; i < bE; i++) bS += d[i]; bass = bS / (bE * 255);
    const mE = Math.floor(len * 0.5);
    let mS = 0; for (let i = bE; i < mE; i++) mS += d[i]; mid = mS / ((mE - bE) * 255);
    let hS = 0; for (let i = mE; i < len; i++) hS += d[i]; high = hS / ((len - mE) * 255);
  } else if (isPlaying) {
    const t = time;
    bass = 0.25 + Math.pow(Math.sin(t * 3.5) * 0.5 + 0.5, 2) * 0.55 + Math.pow(Math.max(0, Math.sin(t * 1.1)), 4) * 0.4;
    mid = 0.15 + Math.pow(Math.sin(t * 7.2) * 0.5 + 0.5, 3) * 0.45;
    high = 0.08 + Math.max(0, Math.sin(t * 14) * 0.5) * 0.35;
    if (Math.random() < 0.04) bass = Math.min(1, bass + 0.5);
    if (Math.random() < 0.06) mid = Math.min(1, mid + 0.35);
  }
  return { bass, mid, high };
}

function parseHex(hex) {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

// ─── STYLE 1: WAVES ───
function drawWaves(ctx, w, h, t, sB, sM, sH, c1, c2, prevBass, isPlaying) {
  const [r1, g1, b1] = parseHex(c1);
  const [r2, g2, b2] = parseHex(c2);
  const centerY = h * 0.5;
  const bassHit = sB - prevBass;

  const configs = [
    { ampBase: 30, ampR: 160, freq: 0.0025, sp: 0.6, op: 0.35, yOff: 0, mix: 0, thick: 2.5, r: "b" },
    { ampBase: 25, ampR: 120, freq: 0.003, sp: 0.8, yOff: 15, op: 0.25, mix: 0.2, thick: 2, r: "b" },
    { ampBase: 20, ampR: 90, freq: 0.004, sp: 1.1, yOff: -10, op: 0.2, mix: 0.4, thick: 1.8, r: "m" },
    { ampBase: 15, ampR: 70, freq: 0.005, sp: 1.4, yOff: -25, op: 0.18, mix: 0.6, thick: 1.5, r: "m" },
    { ampBase: 10, ampR: 50, freq: 0.007, sp: 1.8, yOff: 30, op: 0.12, mix: 0.8, thick: 1.2, r: "h" },
    { ampBase: 8, ampR: 35, freq: 0.009, sp: 2.2, yOff: -35, op: 0.08, mix: 1, thick: 1, r: "h" },
  ];

  for (const wv of configs) {
    const rv = wv.r === "b" ? sB : wv.r === "m" ? sM : sH;
    const amp = wv.ampBase + rv * wv.ampR;
    const sp = wv.sp * t;
    const yBase = centerY + wv.yOff;
    const mr = Math.round(r1 + (r2 - r1) * wv.mix);
    const mg = Math.round(g1 + (g2 - g1) * wv.mix);
    const mb = Math.round(b1 + (b2 - b1) * wv.mix);

    ctx.beginPath(); ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 2) {
      ctx.lineTo(x, yBase + Math.sin(x * wv.freq + sp) * amp + Math.sin(x * wv.freq * 2.3 + sp * 0.7) * (amp * 0.35) + Math.sin(x * wv.freq * 0.6 + sp * 1.5) * (amp * 0.25));
    }
    ctx.lineTo(w, h); ctx.closePath();
    const fg = ctx.createLinearGradient(0, yBase - amp, 0, yBase + amp + 100);
    fg.addColorStop(0, `rgba(${mr},${mg},${mb},0)`);
    fg.addColorStop(0.4, `rgba(${mr},${mg},${mb},${wv.op * 0.4})`);
    fg.addColorStop(1, `rgba(${mr},${mg},${mb},0)`);
    ctx.fillStyle = fg; ctx.fill();

    ctx.beginPath();
    for (let x = 0; x <= w; x += 2) {
      const y = yBase + Math.sin(x * wv.freq + sp) * amp + Math.sin(x * wv.freq * 2.3 + sp * 0.7) * (amp * 0.35) + Math.sin(x * wv.freq * 0.6 + sp * 1.5) * (amp * 0.25);
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(${mr},${mg},${mb},${Math.min(wv.op * (1 + rv * 2), 0.9)})`;
    ctx.lineWidth = wv.thick + rv * 3; ctx.stroke();
    ctx.strokeStyle = `rgba(${mr},${mg},${mb},${wv.op * (1 + rv * 2) * 0.3})`;
    ctx.lineWidth = wv.thick + rv * 8; ctx.stroke();
  }

  if (bassHit > 0.03 && sB > 0.35) {
    const fg = ctx.createRadialGradient(w / 2, centerY, 0, w / 2, centerY, w * 0.5);
    fg.addColorStop(0, `rgba(${r1},${g1},${b1},${Math.min(bassHit * 3, 0.15)})`);
    fg.addColorStop(1, `rgba(0,0,0,0)`);
    ctx.fillStyle = fg; ctx.fillRect(0, 0, w, h);
  }
}

// ─── STYLE 2: BARS (Equalizer) ───
function drawBars(ctx, w, h, t, sB, sM, sH, c1, c2, prevBass, isPlaying, analyserRef, dataRef) {
  const [r1, g1, b1] = parseHex(c1);
  const [r2, g2, b2] = parseHex(c2);
  const barCount = 64;
  const gap = 3;
  const barW = (w - gap * barCount) / barCount;
  const maxH = h * 0.7;
  const baseY = h * 0.85;
  const bassHit = sB - prevBass;

  for (let i = 0; i < barCount; i++) {
    let val;
    if (analyserRef.current && dataRef.current && isPlaying) {
      const idx = Math.floor((i / barCount) * dataRef.current.length);
      val = dataRef.current[idx] / 255;
    } else if (isPlaying) {
      const freq = i / barCount;
      if (freq < 0.2) val = sB * (0.7 + Math.sin(t * 3 + i * 0.3) * 0.3);
      else if (freq < 0.5) val = sM * (0.6 + Math.sin(t * 5 + i * 0.4) * 0.4);
      else val = sH * (0.5 + Math.sin(t * 8 + i * 0.5) * 0.5);
    } else {
      val = 0.02 + Math.sin(t * 0.5 + i * 0.2) * 0.02;
    }

    const barH = val * maxH;
    const x = i * (barW + gap) + gap / 2;
    const mix = i / barCount;
    const mr = Math.round(r1 + (r2 - r1) * mix);
    const mg = Math.round(g1 + (g2 - g1) * mix);
    const mb = Math.round(b1 + (b2 - b1) * mix);

    // Bar gradient
    const bg = ctx.createLinearGradient(x, baseY, x, baseY - barH);
    bg.addColorStop(0, `rgba(${mr},${mg},${mb},0.15)`);
    bg.addColorStop(0.5, `rgba(${mr},${mg},${mb},${0.3 + val * 0.5})`);
    bg.addColorStop(1, `rgba(${mr},${mg},${mb},${0.6 + val * 0.4})`);
    ctx.fillStyle = bg;
    ctx.fillRect(x, baseY - barH, barW, barH);

    // Glow
    ctx.shadowColor = `rgba(${mr},${mg},${mb},${val * 0.5})`;
    ctx.shadowBlur = val * 15;
    ctx.fillRect(x, baseY - barH, barW, 2);
    ctx.shadowBlur = 0;

    // Mirror (reflection below)
    const rg = ctx.createLinearGradient(x, baseY, x, baseY + barH * 0.3);
    rg.addColorStop(0, `rgba(${mr},${mg},${mb},0.08)`);
    rg.addColorStop(1, `rgba(${mr},${mg},${mb},0)`);
    ctx.fillStyle = rg;
    ctx.fillRect(x, baseY, barW, barH * 0.3);

    // Peak dot
    ctx.fillStyle = `rgba(${mr},${mg},${mb},${0.7 + val * 0.3})`;
    ctx.fillRect(x, baseY - barH - 4, barW, 2);
  }

  // Bass flash
  if (bassHit > 0.04) {
    ctx.fillStyle = `rgba(${r1},${g1},${b1},${Math.min(bassHit * 2, 0.1)})`;
    ctx.fillRect(0, 0, w, h);
  }
}

// ─── STYLE 3: ORBIT (Circular rings) ───
function drawOrbit(ctx, w, h, t, sB, sM, sH, c1, c2, prevBass, isPlaying) {
  const [r1, g1, b1] = parseHex(c1);
  const [r2, g2, b2] = parseHex(c2);
  const cx = w / 2;
  const cy = h * 0.48;
  const bassHit = sB - prevBass;

  // Multiple rings
  const ringCount = 8;
  for (let i = 0; i < ringCount; i++) {
    const baseR = 40 + i * 40;
    const rv = i < 3 ? sB : i < 6 ? sM : sH;
    const radius = baseR + rv * (50 + i * 10);
    const mix = i / ringCount;
    const mr = Math.round(r1 + (r2 - r1) * mix);
    const mg = Math.round(g1 + (g2 - g1) * mix);
    const mb = Math.round(b1 + (b2 - b1) * mix);
    const opacity = (0.35 - i * 0.03) * (0.5 + rv);

    // Wobbly circle
    ctx.beginPath();
    const segments = 120;
    for (let s = 0; s <= segments; s++) {
      const angle = (s / segments) * Math.PI * 2;
      const wobble = Math.sin(angle * 3 + t * (1 + i * 0.3)) * (rv * 20) +
                     Math.sin(angle * 5 + t * (1.5 + i * 0.2)) * (rv * 10);
      const r = radius + wobble;
      const px = cx + Math.cos(angle + t * 0.1 * (i % 2 === 0 ? 1 : -1)) * r;
      const py = cy + Math.sin(angle + t * 0.1 * (i % 2 === 0 ? 1 : -1)) * r;
      if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.strokeStyle = `rgba(${mr},${mg},${mb},${opacity})`;
    ctx.lineWidth = 1.5 + rv * 2;
    ctx.stroke();

    // Glow
    ctx.strokeStyle = `rgba(${mr},${mg},${mb},${opacity * 0.25})`;
    ctx.lineWidth = 4 + rv * 8;
    ctx.stroke();
  }

  // Center pulse on bass hit
  if (sB > 0.3) {
    const pulseR = 30 + sB * 80;
    const pg = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseR);
    pg.addColorStop(0, `rgba(${r1},${g1},${b1},${sB * 0.2})`);
    pg.addColorStop(0.5, `rgba(${r2},${g2},${b2},${sB * 0.08})`);
    pg.addColorStop(1, `rgba(0,0,0,0)`);
    ctx.fillStyle = pg;
    ctx.fillRect(0, 0, w, h);
  }

  // Expanding ring on bass hit
  if (bassHit > 0.04) {
    ctx.beginPath();
    ctx.arc(cx, cy, 50 + sB * 200, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${r1},${g1},${b1},${bassHit * 2})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

// ─── STYLE 4: PARTICLES ───
const MAX_PARTICLES = 150;
let particles = [];
function initParticles(w, h) {
  particles = [];
  for (let i = 0; i < MAX_PARTICLES; i++) {
    particles.push({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1,
      life: Math.random(),
      freq: Math.random(), // 0=bass, 0.5=mid, 1=high
    });
  }
}

function drawParticles(ctx, w, h, t, sB, sM, sH, c1, c2, prevBass, isPlaying) {
  const [r1, g1, b1] = parseHex(c1);
  const [r2, g2, b2] = parseHex(c2);
  const bassHit = sB - prevBass;

  if (particles.length === 0) initParticles(w, h);

  const cx = w / 2; const cy = h / 2;

  for (const p of particles) {
    const rv = p.freq < 0.3 ? sB : p.freq < 0.6 ? sM : sH;
    const energy = isPlaying ? rv : 0.05;

    // Move particles
    p.vx += (Math.random() - 0.5) * energy * 0.8;
    p.vy += (Math.random() - 0.5) * energy * 0.8;

    // Bass hit: explode outward
    if (bassHit > 0.04 && p.freq < 0.4) {
      const dx = p.x - cx; const dy = p.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      p.vx += (dx / dist) * bassHit * 15;
      p.vy += (dy / dist) * bassHit * 15;
    }

    // Damping
    p.vx *= 0.96; p.vy *= 0.96;

    // Gentle pull toward center when quiet
    if (!isPlaying || energy < 0.15) {
      p.vx += (cx - p.x) * 0.0003;
      p.vy += (cy - p.y) * 0.0003;
    }

    p.x += p.vx; p.y += p.vy;

    // Wrap
    if (p.x < -20) p.x = w + 20;
    if (p.x > w + 20) p.x = -20;
    if (p.y < -20) p.y = h + 20;
    if (p.y > h + 20) p.y = -20;

    const mix = p.freq;
    const mr = Math.round(r1 + (r2 - r1) * mix);
    const mg = Math.round(g1 + (g2 - g1) * mix);
    const mb = Math.round(b1 + (b2 - b1) * mix);
    const size = p.size * (1 + rv * 3);
    const alpha = 0.2 + rv * 0.6;

    // Glow
    const pg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 4);
    pg.addColorStop(0, `rgba(${mr},${mg},${mb},${alpha * 0.3})`);
    pg.addColorStop(1, `rgba(${mr},${mg},${mb},0)`);
    ctx.fillStyle = pg;
    ctx.fillRect(p.x - size * 4, p.y - size * 4, size * 8, size * 8);

    // Core
    ctx.beginPath();
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${mr},${mg},${mb},${alpha})`;
    ctx.fill();
  }

  // Connections between nearby particles
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = dx * dx + dy * dy;
      const maxDist = (80 + sB * 60) ** 2;
      if (dist < maxDist) {
        const alpha = (1 - dist / maxDist) * 0.08 * (1 + sB);
        const mix = (particles[i].freq + particles[j].freq) / 2;
        const mr = Math.round(r1 + (r2 - r1) * mix);
        const mg = Math.round(g1 + (g2 - g1) * mix);
        const mb = Math.round(b1 + (b2 - b1) * mix);
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(${mr},${mg},${mb},${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }

  // Center glow
  if (sB > 0.25) {
    const pg = ctx.createRadialGradient(cx, cy, 0, cx, cy, sB * 250);
    pg.addColorStop(0, `rgba(${r1},${g1},${b1},${sB * 0.08})`);
    pg.addColorStop(1, `rgba(0,0,0,0)`);
    ctx.fillStyle = pg; ctx.fillRect(0, 0, w, h);
  }
}

// ─── MAIN VISUALIZER CANVAS ───
export default function Visualizer({ activeColor, activeColor2, isPlaying, style }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);
  const smoothBassRef = useRef(0);
  const smoothMidRef = useRef(0);
  const smoothHighRef = useRef(0);
  const prevBassRef = useRef(0);
  const { analyserRef, dataRef } = useAudioData(isPlaying);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h;
    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; if (style === "particles") initParticles(w, h); };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      timeRef.current += isPlaying ? 0.018 : 0.005;
      const t = timeRef.current;
      const { bass, mid, high } = getAudioLevels(analyserRef, dataRef, isPlaying, t);
      const sm = isPlaying ? 0.18 : 0.08;
      smoothBassRef.current += (bass - smoothBassRef.current) * sm;
      smoothMidRef.current += (mid - smoothMidRef.current) * sm;
      smoothHighRef.current += (high - smoothHighRef.current) * sm;
      const sB = smoothBassRef.current, sM = smoothMidRef.current, sH = smoothHighRef.current;

      ctx.clearRect(0, 0, w, h);
      const c1 = activeColor || "#ff6b9d";
      const c2 = activeColor2 || "#6a82fb";

      if (style === "waves") drawWaves(ctx, w, h, t, sB, sM, sH, c1, c2, prevBassRef.current, isPlaying);
      else if (style === "bars") drawBars(ctx, w, h, t, sB, sM, sH, c1, c2, prevBassRef.current, isPlaying, analyserRef, dataRef);
      else if (style === "orbit") drawOrbit(ctx, w, h, t, sB, sM, sH, c1, c2, prevBassRef.current, isPlaying);
      else if (style === "particles") drawParticles(ctx, w, h, t, sB, sM, sH, c1, c2, prevBassRef.current, isPlaying);

      prevBassRef.current = sB;
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
  }, [activeColor, activeColor2, isPlaying, style]);

  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }} />;
}
