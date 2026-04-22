#!/usr/bin/env node
/**
 * Launcher for the Next.js standalone server.
 *
 * Force HOSTNAME=0.0.0.0 so the container listens on every interface.
 * Note: Docker auto-populates HOSTNAME with the container id (e.g.
 * "2b12d0928fc0"), so we must OVERWRITE rather than default. If we
 * left it alone Next would bind only to the container hostname / IPv6
 * and reverse proxies (Coolify/Traefik) would see "no available server".
 *
 * Set NEXT_HOSTNAME if you genuinely need to override (rare).
 */
process.env.HOSTNAME = process.env.NEXT_HOSTNAME || "0.0.0.0";
process.env.PORT = process.env.PORT || "3000";

await import("../.next/standalone/server.js");
