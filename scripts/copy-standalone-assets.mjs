#!/usr/bin/env node
/**
 * Post-build copier for Next.js `output: "standalone"`.
 *
 * Next's standalone server expects sibling `public/` and `.next/static/`
 * directories, but `next build` does not populate them automatically.
 * Running this after `next build` makes `node .next/standalone/server.js`
 * self-contained so `npm start` works in Coolify/Nixpacks/plain Node hosts
 * without needing the Dockerfile to do the copying.
 */
import { cpSync, existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const standalone = resolve(root, ".next/standalone");

if (!existsSync(standalone)) {
  console.log("• .next/standalone not found — skip (did you run `next build`?)");
  process.exit(0);
}

const targets = [
  { from: resolve(root, "public"), to: resolve(standalone, "public") },
  { from: resolve(root, ".next/static"), to: resolve(standalone, ".next/static") },
];

for (const { from, to } of targets) {
  if (!existsSync(from)) continue;
  rmSync(to, { recursive: true, force: true });
  cpSync(from, to, { recursive: true });
  console.log(`  ✓ copied ${from.replace(root + "/", "")} → ${to.replace(root + "/", "")}`);
}
