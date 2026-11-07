/**
 * particleIntro.js – canvas engine for the IGNITRON 2K26 intro
 * createParticleIntro(canvas) -> { explode(), destroy() }
 */
export const FONT = '"Cinzel", "Times New Roman", serif';
const PALETTE = ["#ffffff", "#e6fff6", "#9bffd9", "#4dffc3", "#22e6d6", "#19d3ff"];

function buildTargets(w, h) {
  const off = document.createElement("canvas");
  off.width = w;
  off.height = h;
  const c = off.getContext("2d", { willReadFrequently: true });
  c.fillStyle = "#fff";
  c.textAlign = "center";
  c.textBaseline = "middle";

  let fs = Math.min(w * 0.15, 200);
  c.font = `700 ${fs}px ${FONT}`;
  const maxW = w * 0.88;
  const m = c.measureText("IGNITRON").width;
  if (m > maxW) fs *= maxW / m;

  const cy = h * 0.32;
  c.font = `700 ${fs}px ${FONT}`;
  c.fillText("IGNITRON", w / 2, cy - fs * 0.3);
  c.font = `700 ${fs * 0.85}px ${FONT}`;
  c.fillText("2K26", w / 2, cy + fs * 0.7);

  const gap = w < 700 ? 3 : Math.max(3, Math.round(fs / 40));
  const data = c.getImageData(0, 0, w, h).data;
  let pts = [];
  for (let y = 0; y < h; y += gap) {
    for (let x = 0; x < w; x += gap) {
      if (data[(y * w + x) * 4 + 3] > 128) pts.push({ x, y });
    }
  }
  const MAX = w < 700 ? 4500 : 10000;
  if (pts.length > MAX) {
    pts.sort(() => Math.random() - 0.5);
    pts = pts.slice(0, MAX);
  }
  return { pts, size: Math.max(1.7, gap - 1.1), cy: cy + fs * 0.2 };
}

export function createParticleIntro(canvas, opts = {}) {
  const hold = opts.hold || 0; // ms to wait (typography plays) before particles start forming
  const ctx = canvas.getContext("2d");
  let w = 0, h = 0, size = 2, cy = 0;
  let particles = [], stars = [], embers = [], rings = [];
  let raf = 0, t0 = 0, cancelled = false, exiting = false, kicked = false;
  const mouse = { x: -9999, y: -9999 };

  const newEmber = (init) => ({
    x: Math.random() * w,
    y: init ? Math.random() * h : h + 10,
    vy: 0.4 + Math.random() * 1.3,
    sw: Math.random() * 6.28,
    s: 1 + Math.random() * 2.4,
    c: Math.random() < 0.35 ? "25,211,255" : "60,255,190",
  });

  function setup() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const t = buildTargets(w, h);
    size = t.size;
    cy = t.cy;
    const old = particles;
    particles = t.pts.map((p, i) => {
      const o = old[i];
      const ang = Math.random() * Math.PI * 2;
      const rad = Math.max(w, h) * (0.6 + Math.random() * 0.6);
      return {
        x: o ? o.x : w / 2 + Math.cos(ang) * rad,
        y: o ? o.y : h / 2 + Math.sin(ang) * rad,
        vx: 0, vy: 0,
        tx: p.x, ty: p.y,
        k: 0.03 + Math.random() * 0.05,
        ph: Math.random() * 6.28,
        ci: Math.floor(Math.random() * PALETTE.length),
        delay: (p.x / w) * 900 + Math.random() * 400,
      };
    });
    stars = Array.from({ length: 60 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      v: 0.1 + Math.random() * 0.3, a: 0.2 + Math.random() * 0.5, s: 1 + Math.random() * 1.5,
    }));
    embers = Array.from({ length: w < 700 ? 45 : 100 }, () => newEmber(true));
  }

  function loop(now) {
    if (cancelled) return;
    const el = now - t0 - hold;

    if (exiting) {
      // fade instead of clear -> leaves streaking trails while particles fly out
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.fillRect(0, 0, w, h);
    } else {
      ctx.clearRect(0, 0, w, h);
    }
    ctx.globalCompositeOperation = "lighter";

    // stars
    for (const s of stars) {
      s.y += s.v;
      if (s.y > h) s.y = 0;
      ctx.fillStyle = `rgba(150,255,220,${s.a})`;
      ctx.fillRect(s.x, s.y, s.s, s.s);
    }

    // rising sparks
    if (!exiting) {
      for (let i = 0; i < embers.length; i++) {
        const e = embers[i];
        e.y -= e.vy;
        e.sw += 0.03;
        e.x += Math.sin(e.sw) * 0.6;
        if (e.y < -10) embers[i] = newEmber(false);
        const a = Math.max(0, Math.min(1, e.y / h)) * 0.85;
        ctx.fillStyle = `rgba(${e.c},${a})`;
        ctx.fillRect(e.x, e.y, e.s, e.s * 2.2);
      }
    }

    // shockwave when the text has formed
    if (!kicked && el > 2400 && !exiting) {
      kicked = true;
      rings.push({ r: 0, a: 1 }, { r: -90, a: 0.7 });
      for (const p of particles) {
        const dx = p.x - w / 2, dy = p.y - cy;
        const d = Math.hypot(dx, dy) || 1;
        const f = 3 + Math.random() * 5;
        p.vx += (dx / d) * f;
        p.vy += (dy / d) * f;
      }
    }
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i];
      r.r += 13;
      r.a -= 0.012;
      if (r.a <= 0) { rings.splice(i, 1); continue; }
      if (r.r > 0) {
        ctx.strokeStyle = `rgba(80,255,210,${r.a})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(w / 2, cy, r.r, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // light sweep across the letters
    const span = w + h * 0.4 + 800;
    const sweep = el > 2900 && !exiting ? (((el - 2900) * 0.45) % span) - 200 : -9999;

    // glow pass
    ctx.fillStyle = "rgba(40,255,180,0.09)";
    for (let i = 0; i < particles.length && el > 0; i += 3) {
      const p = particles[i];
      ctx.fillRect(p.x - size, p.y - size, size * 3, size * 3);
    }

    // main pass
    for (const p of particles) {
      if (el < 0 && !exiting) continue;
      if (exiting) {
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.985; p.vy *= 0.985;
      } else if (el > p.delay) {
        const fx = p.tx + Math.sin(el * 0.002 + p.ph) * 0.9;
        const fy = p.ty + Math.cos(el * 0.0023 + p.ph) * 0.9;
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 10000) {
          const d = Math.sqrt(d2) || 1;
          const f = (1 - d / 100) * 5.5;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }
        p.vx += (fx - p.x) * p.k;
        p.vy += (fy - p.y) * p.k;
        p.vx *= 0.82; p.vy *= 0.82;
        p.x += p.vx; p.y += p.vy;
      } else {
        p.x += (w / 2 - p.x) * 0.0015;
        p.y += (h / 2 - p.y) * 0.0015;
      }

      const dv = Math.abs(p.x + p.y * 0.4 - sweep);
      if (dv < 70) {
        const b = 1 - dv / 70;
        const s = size * (1 + b * 0.9);
        ctx.fillStyle = "#fff";
        ctx.fillRect(p.x - (s - size) / 2, p.y - (s - size) / 2, s, s);
      } else {
        ctx.fillStyle = PALETTE[p.ci];
        ctx.fillRect(p.x, p.y, size, size);
      }
    }
    raf = requestAnimationFrame(loop);
  }

  const onMove = (e) => {
    const pt = e.touches ? e.touches[0] : e;
    mouse.x = pt.clientX;
    mouse.y = pt.clientY;
  };
  let rt;
  const onResize = () => {
    clearTimeout(rt);
    rt = setTimeout(() => !exiting && setup(), 200);
  };

  (async () => {
    try { await document.fonts.load(`700 100px ${FONT}`); } catch (_) {}
    if (cancelled) return;
    setup();
    t0 = performance.now();
    raf = requestAnimationFrame(loop);
  })();

  window.addEventListener("mousemove", onMove);
  window.addEventListener("touchmove", onMove, { passive: true });
  window.addEventListener("resize", onResize);

  return {
    explode() {
      for (const p of particles) {
        const dx = p.x - w / 2, dy = p.y - cy;
        const d = Math.hypot(dx, dy) || 1;
        const sp = 7 + Math.random() * 24;
        p.vx = (dx / d) * sp + (Math.random() - 0.5) * 6;
        p.vy = (dy / d) * sp + (Math.random() - 0.5) * 6;
      }
      exiting = true;
    },
    destroy() {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("resize", onResize);
    },
  };
}
