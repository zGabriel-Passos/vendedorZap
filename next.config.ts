import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "baileys",
    "@whiskeysockets/baileys",
    "jimp",
    "sharp",
    "@hapi/boom",
    "pino",
    "pino-pretty",
  ],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
