const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow Metro to bundle .wasm files (needed for expo-sqlite on web)
config.resolver.assetExts.push('wasm');

// Add COEP/COOP headers so SharedArrayBuffer is available in the browser
// (required for expo-sqlite's synchronous WASM driver on web)
const originalEnhance = config.server?.enhanceMiddleware;
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware, server) => {
    const base = originalEnhance ? originalEnhance(middleware, server) : middleware;
    return (req, res, next) => {
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
      base(req, res, next);
    };
  },
};

module.exports = config;
