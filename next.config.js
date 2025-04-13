/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import("next").NextConfig} */
const config = {
  output: 'standalone',
  webpack: (config) => {
    config.resolve.alias['~'] = path.join(__dirname, 'src');
    return config;
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    },
  },
  reactStrictMode: false,
};

export default config;
