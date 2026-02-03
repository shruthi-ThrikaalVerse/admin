import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import net from 'node:net';

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const useMockAuditEnv = env.USE_MOCK_AUDIT === '1' || env.USE_MOCK_AUDIT === 'true';
  const auditHost = env.AUDIT_HOST || 'localhost';
  const auditPort = Number(env.AUDIT_PORT || 4201);

  const checkPort = (host: string, port: number, timeout = 800) => new Promise<boolean>((resolve) => {
    const socket = new net.Socket();
    let resolved = false;
    socket.setTimeout(timeout);
    socket.once('connect', () => { resolved = true; socket.destroy(); resolve(true); });
    socket.once('timeout', () => { if (!resolved) { resolved = true; socket.destroy(); resolve(false); } });
    socket.once('error', () => { if (!resolved) { resolved = true; socket.destroy(); resolve(false); } });
    socket.connect(port, host);
  });

  let proxyEnabled = true;
  if (useMockAuditEnv) {
    console.info('[vite] USE_MOCK_AUDIT set — disabling /api proxy and using mock audit data');
    proxyEnabled = false;
  } else {
    try {
      const reachable = await checkPort(auditHost, auditPort);
      if (!reachable) {
        console.warn(`[vite] Audit server not reachable at ${auditHost}:${auditPort} — disabling /api proxy and falling back to mock data. Run 'npm run server' to start the demo server.`);
        proxyEnabled = false;
      } else {
        console.info(`[vite] Audit server reachable at ${auditHost}:${auditPort} — proxying /api -> http://${auditHost}:${auditPort}`);
        proxyEnabled = true;
      }
    } catch (e) {
      console.warn('[vite] Error checking audit server reachability — falling back to mock data', e);
      proxyEnabled = false;
    }
  }

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: proxyEnabled ? { '/api': `http://${auditHost}:${auditPort}` } : {}
    },

    plugins: [react()],
    css: {
      postcss: {
        plugins: [tailwindcss(), autoprefixer()],
      }
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
