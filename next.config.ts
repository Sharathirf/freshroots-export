import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'api.qrserver.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/firebase-messaging-sw.js',
        destination: '/api/push/messaging-sw.js',
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG || "freshroots",
  project: process.env.SENTRY_PROJECT || "freshroots-export",
});
