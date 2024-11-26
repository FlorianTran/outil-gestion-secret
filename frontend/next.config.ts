/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpackDevMiddleware: (config: {
      watchOptions: {
        poll: number; // Vérifie les changements toutes les 1000ms
        aggregateTimeout: number;
      };
    }) => {
    config.watchOptions = {
      poll: 1000, // Vérifie les changements toutes les 1000ms
      aggregateTimeout: 300, // Délai avant recompilation
    };
    return config;
  },
  devIndicators: {
    autoPrerender: false, // Désactiver le prerender automatique
  },
  env: {
    PORT: 3001, // Définir le port explicitement
  },
};

module.exports = nextConfig;
