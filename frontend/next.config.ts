/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: {
    autoPrerender: false, // Désactiver le prerender automatique
  },
  env: {
    PORT: process.env.PORT, // Définir le port explicitement
  },
  // Activer le polling pour les fichiers
  webpack: (config: {
      watchOptions: {
        poll: number; // Vérifie les changements toutes les 1000ms
        aggregateTimeout: number;
      };
    }, { dev }: any) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000, // Vérifie les changements toutes les 1000ms
        aggregateTimeout: 300, // Délai avant recompilation
      };
    }
    return config;
  },
};

module.exports = nextConfig;
