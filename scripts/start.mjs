#!/usr/bin/env node
/**
 * Launcher for the Next.js standalone server.
 *
 * Forces HOSTNAME=0.0.0.0 so the container listens on every interface —
 * otherwise Next defaults to the container hostname (or ::) and reverse
 * proxies (Coolify/Traefik) see "no available server".
 */
process.env.HOSTNAME = process.env.HOSTNAME || "0.0.0.0";
process.env.PORT = process.env.PORT || "3000";

await import("../.next/standalone/server.js");
