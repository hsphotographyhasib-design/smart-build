// =============================================================================
// SmartBuild — PM2 Ecosystem Configuration
//
// Use this file for the PM2 + bare-Nginx deployment path (no Docker).
// See infra/README.md for the full PM2 deploy guide.
//
// Prerequisites on the VPS:
//   npm install -g pm2
//   pm2 startup   # generates and runs the systemd unit
//   pm2 save      # persists the process list across reboots
//
// Start all processes:
//   pm2 start infra/pm2/ecosystem.config.js
//
// Reload Next.js with zero downtime (cluster mode):
//   pm2 reload smartbuild-app
//
// Reload realtime service:
//   pm2 restart smartbuild-realtime
//
// Monitor:
//   pm2 monit
//   pm2 logs
//   pm2 list
// =============================================================================

module.exports = {
  apps: [
    // =========================================================================
    // 1. Next.js Standalone App
    //    Runs in cluster mode so PM2 forks one worker per CPU core (or
    //    instances: N for a fixed count). Zero-downtime reload is available
    //    with: pm2 reload smartbuild-app
    // =========================================================================
    {
      name: "smartbuild-app",

      // Path to the standalone server produced by `next build`
      // Adjust if your deploy copies the build to a different location.
      script: ".next/standalone/server.js",

      // Interpreter — use "node" (default) or full path to bun:
      // interpreter: "/usr/local/bin/bun",
      interpreter: "node",

      // cluster mode: PM2 forks `instances` copies behind an internal load
      // balancer. Each worker is an independent Node.js process.
      exec_mode: "cluster",

      // "max" = one instance per logical CPU core.
      // Set to a fixed number (e.g. 2) on memory-constrained VPS.
      instances: "max",

      // Restart if memory exceeds this threshold (per instance)
      max_memory_restart: "512M",

      // Restart on crash immediately; exponential back-off after 5 restarts
      autorestart: true,
      max_restarts: 10,
      restart_delay: 4000,      // ms between restart attempts
      min_uptime: "10s",        // must stay up at least 10 s to count as "stable"

      // Environment variables — production
      // Sensitive values must be set in the shell environment or a .env file
      // loaded with: pm2 start ... --env production
      env: {
        NODE_ENV: "development",
        PORT: 3000,
        HOSTNAME: "127.0.0.1",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "127.0.0.1",
        NEXT_TELEMETRY_DISABLED: "1",
        // DATABASE_URL, JWT_SECRET, etc. are read from the host environment
        // or from a .env file. Do NOT hard-code secrets here.
      },

      // Log files
      out_file: "/var/log/smartbuild/app.out.log",
      error_file: "/var/log/smartbuild/app.err.log",
      merge_logs: true,

      // Log rotation (requires pm2-logrotate module):
      //   pm2 install pm2-logrotate
      //   pm2 set pm2-logrotate:max_size 50M
      //   pm2 set pm2-logrotate:retain 7

      // Watch source files (development only — disable in production)
      watch: false,

      // Graceful shutdown timeout (ms) before SIGKILL
      kill_timeout: 5000,

      // Wait this many ms after a restart before marking the process healthy
      listen_timeout: 10000,
    },

    // =========================================================================
    // 2. WhatsApp Realtime Mini-Service (Socket.IO + HTTP Bridge)
    //    Runs in fork mode (single process). Socket.IO multi-node clustering
    //    requires the Redis adapter — run a single instance unless you have
    //    that configured.
    // =========================================================================
    {
      name: "smartbuild-realtime",

      // Path to the realtime service entry point (TypeScript — executed by Bun)
      script: "mini-services/whatsapp-realtime/index.ts",

      // Bun executes TypeScript directly — no transpile step
      interpreter: "/usr/local/bin/bun",

      // fork mode: single process (required for Socket.IO without Redis adapter)
      exec_mode: "fork",
      instances: 1,

      // Memory limit — realtime service is lightweight
      max_memory_restart: "256M",

      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      min_uptime: "5s",

      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
        // PORT 3006 (Socket.IO) and BRIDGE_PORT 3096 (HTTP bridge) are
        // hardcoded in index.ts. Override here if needed in future.
      },

      // Log files
      out_file: "/var/log/smartbuild/realtime.out.log",
      error_file: "/var/log/smartbuild/realtime.err.log",
      merge_logs: true,

      watch: false,
      kill_timeout: 5000,
      listen_timeout: 8000,
    },

    // =========================================================================
    // 3. WhatsApp Maintenance Notify Mini-Service (if applicable)
    //    Uncomment and adjust path if this service is running.
    // =========================================================================
    // {
    //   name: "smartbuild-maintenance-notify",
    //   script: "mini-services/maintenance-notify/index.ts",
    //   interpreter: "/usr/local/bin/bun",
    //   exec_mode: "fork",
    //   instances: 1,
    //   max_memory_restart: "128M",
    //   autorestart: true,
    //   env_production: { NODE_ENV: "production" },
    //   out_file: "/var/log/smartbuild/maintenance-notify.out.log",
    //   error_file: "/var/log/smartbuild/maintenance-notify.err.log",
    // },
  ],

  // ===========================================================================
  // Deploy configuration (pm2 deploy)
  // Uncomment and fill in to use PM2's built-in deployment pipeline.
  // pm2 deploy infra/pm2/ecosystem.config.js production setup
  // pm2 deploy infra/pm2/ecosystem.config.js production
  // ===========================================================================
  // deploy: {
  //   production: {
  //     user: "deploy",
  //     host: ["YOUR_VPS_IP"],
  //     ref: "origin/main",
  //     repo: "git@github.com:YOUR_ORG/smartbuild.git",
  //     path: "/opt/smartbuild",
  //     "pre-deploy-local": "",
  //     "post-deploy":
  //       "npm ci && npx prisma generate && npm run build && " +
  //       "pm2 reload infra/pm2/ecosystem.config.js --env production",
  //     "pre-setup": "mkdir -p /var/log/smartbuild",
  //     env: {
  //       NODE_ENV: "production",
  //     },
  //   },
  // },
};
