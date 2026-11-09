const http = require('http');
const { execSync } = require('child_process');
const app = require('./app');
const env = require('./config/env');
const { connectDB } = require('./config/db');
const { seedDatabase } = require('./seeds/seed');
const { startKeepAliveHeartbeat, stopKeepAliveHeartbeat } = require('./services/keepAlive.service');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Finds and terminates any stale `node` process occupying `port`
 * (Excludes current `process.pid` and never touches macOS `ControlCenter`).
 */
const freeStaleNodeProcessOnPort = (port) => {
  try {
    const output = execSync(`lsof -ti tcp:${port} -sTCP:LISTEN 2>/dev/null || true`, {
      encoding: 'utf8',
    }).trim();
    if (!output) return false;

    const pids = output
      .split(/\r?\n/)
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => Number.isInteger(id) && id > 0 && id !== process.pid);

    let killedAny = false;
    for (const pid of pids) {
      try {
        const comm = execSync(`ps -p ${pid} -o comm= 2>/dev/null || true`, {
          encoding: 'utf8',
        })
          .trim()
          .toLowerCase();

        // Only terminate stale node/nodemon processes, never macOS ControlCenter
        if (comm.includes('node')) {
          console.warn(`⚠️  [Port Guard] Giải phóng tiến trình node cũ (PID ${pid}) đang giữ cổng ${port}...`);
          process.kill(pid, 'SIGKILL');
          killedAny = true;
        }
      } catch (_) {
        // Ignore if process already exited
      }
    }
    return killedAny;
  } catch (_) {
    return false;
  }
};

/**
 * Listen helper that handles:
 * 1. Stale `node` processes holding `port` (auto-kills stale node PID and retries after 400ms)
 * 2. macOS `ControlCenter` (AirPlay Receiver) holding wildcard `*:5000` / `:::5000`:
 *    Automatically binds dual-stack loopback (`127.0.0.1` + `::1`) so both
 *    `http://localhost:5000` and `http://127.0.0.1:5000` route directly to Express.
 */
const listenOnHost = (port, host, retryCount = 0) => {
  return new Promise((resolve, reject) => {
    const server = http.createServer(app);

    server.once('error', async (err) => {
      if (err.code === 'EADDRINUSE' && retryCount < 2) {
        const killed = freeStaleNodeProcessOnPort(port);
        if (killed) {
          await sleep(400);
          try {
            const retriedServer = await listenOnHost(port, host, retryCount + 1);
            return resolve(retriedServer);
          } catch (retryErr) {
            return reject(retryErr);
          }
        }
      }
      reject(err);
    });

    server.listen(port, host, () => {
      resolve(server);
    });
  });
};

const listenWithFallback = async (port) => {
  // On Render or Production container environments, always bind 0.0.0.0:${port} for the Load Balancer
  if (process.env.RENDER || env.NODE_ENV === 'production') {
    const prodServer = await listenOnHost(port, '0.0.0.0');
    return [prodServer];
  }

  // Proactively clean any stale node process on this port before binding locally
  if (freeStaleNodeProcessOnPort(port)) {
    await sleep(400);
  }

  try {
    // Try default wildcard bind first
    const primaryServer = await listenOnHost(port, undefined);
    return [primaryServer];
  } catch (err) {
    if (err.code !== 'EADDRINUSE') {
      throw err;
    }

    // If wildcard :::5000 is held by macOS ControlCenter (AirPlay Receiver),
    // bind explicit IPv4 (127.0.0.1) and IPv6 (::1) loopback addresses so both
    // http://localhost:5000 and http://127.0.0.1:5000 resolve to our Express server.
    const activeServers = [];
    const ipv4Server = await listenOnHost(port, '127.0.0.1');
    activeServers.push(ipv4Server);

    try {
      const ipv6Server = await listenOnHost(port, '::1');
      activeServers.push(ipv6Server);
    } catch (_) {
      // IPv6 loopback optional if disabled on host OS
    }

    return activeServers;
  }
};

const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase({ force: false });

    const servers = await listenWithFallback(env.PORT);

    console.log(`🚀 [Backend Server] Running on http://localhost:${env.PORT}`);
    console.log(`🌊 [API Health]     http://localhost:${env.PORT}/api/health`);

    startKeepAliveHeartbeat();

    const shutdown = () => {
      stopKeepAliveHeartbeat();
      for (const srv of servers) {
        srv.close();
      }
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    return servers;
  } catch (err) {
    console.error('[Server Startup Error]:', err);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
