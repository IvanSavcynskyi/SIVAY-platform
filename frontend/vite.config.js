/* global process */
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const targetPort = env.VITE_BACKEND_PORT || env.BACKEND_PORT || '8000';
  const targetHost = env.VITE_BACKEND_HOST || '127.0.0.1';
  const backendTarget = env.VITE_BACKEND_URL || env.BACKEND_URL || env.VITE_API_URL || `http://${targetHost}:${targetPort}`;

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.error(`[Vite Proxy Error] Не вдалося з'єднатися з бекендом (${backendTarget}): ${err.message}`);
            });
          },
        },
      },
    },
  };
});
