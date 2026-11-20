#!/usr/bin/env node
/**
 * Ignitron 2K26 - Render Keep-Alive Auto-Pinger
 * Prevents Render.com free-tier Web Services from sleeping after 15 minutes of inactivity.
 *
 * Usage:
 *   node scripts/keepAlivePinger.js [URL]
 *
 * Example:
 *   node scripts/keepAlivePinger.js https://ignitron2k26-backend.onrender.com
 */

const targetUrl = process.argv[2] || process.env.TARGET_URL || process.env.RENDER_EXTERNAL_URL || 'https://ignitron2k26-backend.onrender.com';
const healthEndpoint = `${targetUrl.replace(/\/+$/, '')}/api/health`;
const PING_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

console.log(`\n╔════════════════════════════════════════════════════════════╗`);
console.log(`║     IGNITRON 2K26 — RENDER KEEP-ALIVE AUTO-PINGER          ║`);
console.log(`╚════════════════════════════════════════════════════════════╝`);
console.log(`📡 Target Health URL: ${healthEndpoint}`);
console.log(`⏱️  Ping Interval:     Every 10 minutes (prevents 15m idle sleep)\n`);

async function ping() {
  const start = Date.now();
  const timestamp = new Date().toLocaleTimeString();

  try {
    const res = await fetch(healthEndpoint, {
      headers: { 'User-Agent': 'Ignitron-KeepAlive-Worker/1.0' },
      cache: 'no-store',
    });
    const duration = Date.now() - start;

    if (res.ok) {
      console.log(`[${timestamp}] ✓ PING SUCCESS (${res.status} OK) in ${duration}ms — Server is WIDE AWAKE`);
    } else {
      console.warn(`[${timestamp}] ⚠️ PING RESPONDED WITH STATUS ${res.status} in ${duration}ms`);
    }
  } catch (err) {
    console.error(`[${timestamp}] ❌ PING FAILED: ${err.message}`);
  }
}

// Immediate first ping
ping();

// Recurring interval
setInterval(ping, PING_INTERVAL_MS);
