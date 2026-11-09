/**
 * Render Anti-Sleep / Keep-Alive Heartbeat Service
 * Automatically sends a lightweight self-ping every `KEEP_ALIVE_INTERVAL_MINUTES` (default: 8 minutes)
 * to prevent Render Free Tier containers from spinning down after 15 minutes of inactivity.
 */
const env = require('../config/env');

let keepAliveTimer = null;
let lastPingStatus = {
  lastPingAt: null,
  lastHttpStatus: null,
  pingCount: 0,
};

const resolveTargetHealthUrl = () => {
  const baseUrl = (
    process.env.KEEP_ALIVE_PING_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    env.KEEP_ALIVE_PING_URL ||
    env.BACKEND_PUBLIC_URL ||
    `http://localhost:${env.PORT}`
  ).replace(/\/+$/, '');

  return `${baseUrl}/api/health`;
};

const pingKeepAliveOnce = async () => {
  const targetUrl = resolveTargetHealthUrl();
  try {
    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'X-Keep-Alive': `render-${env.KEEP_ALIVE_INTERVAL_MINUTES}m-heartbeat`,
        'User-Agent': 'DTU-KeepAlive-Watchdog/1.0',
      },
    });
    lastPingStatus = {
      lastPingAt: new Date().toISOString(),
      lastHttpStatus: res.status,
      pingCount: lastPingStatus.pingCount + 1,
    };
    console.log(
      `💓 [Keep-Alive] Pinged ${targetUrl} -> ${res.status} (Next ping in ${env.KEEP_ALIVE_INTERVAL_MINUTES}m)`
    );
    return { ok: res.ok, status: res.status, targetUrl };
  } catch (err) {
    lastPingStatus = {
      lastPingAt: new Date().toISOString(),
      lastHttpStatus: 'ERROR',
      pingCount: lastPingStatus.pingCount + 1,
    };
    console.warn(`⚠️  [Keep-Alive] Ping failed for ${targetUrl}: ${err.message}`);
    return { ok: false, status: 0, targetUrl, error: err.message };
  }
};

const startKeepAliveHeartbeat = () => {
  if (!env.KEEP_ALIVE_ENABLED || env.NODE_ENV === 'test') {
    return null;
  }

  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
  }

  const intervalMinutes = Math.max(1, Number(env.KEEP_ALIVE_INTERVAL_MINUTES) || 8);
  const intervalMs = intervalMinutes * 60 * 1000;
  const targetUrl = resolveTargetHealthUrl();

  console.log(
    `💓 [Keep-Alive] Anti-Sleep Heartbeat enabled: every ${intervalMinutes} minutes (${intervalMs}ms) -> ${targetUrl}`
  );

  keepAliveTimer = setInterval(() => {
    pingKeepAliveOnce();
  }, intervalMs);

  // Ensure timer does not prevent clean process exit on shutdown
  if (typeof keepAliveTimer.unref === 'function') {
    keepAliveTimer.unref();
  }

  return keepAliveTimer;
};

const stopKeepAliveHeartbeat = () => {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
};

const getKeepAliveStatus = () => ({
  enabled: env.KEEP_ALIVE_ENABLED,
  intervalMinutes: env.KEEP_ALIVE_INTERVAL_MINUTES,
  intervalMs: env.KEEP_ALIVE_INTERVAL_MINUTES * 60 * 1000,
  targetUrl: resolveTargetHealthUrl(),
  ...lastPingStatus,
});

module.exports = {
  startKeepAliveHeartbeat,
  stopKeepAliveHeartbeat,
  pingKeepAliveOnce,
  getKeepAliveStatus,
};
