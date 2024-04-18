import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default (props: { mode: string }) => {
  // Load app-level env vars to node-level env vars.
  process.env = { ...process.env, ...loadEnv(props.mode, process.cwd()) };

  return defineConfig({
    plugins: [react(), svgr()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      proxy: {
        '/api': {
          target: JSON.parse(process.env.VITE_IN_DOCKER_CONTAINER || 'false')
            ? 'http://backend:8080'
            : 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
          ws: true,
          rewrite: path => path.replace(/^\/api/, ''),
          configure: proxy => {
            proxy.on('error', err => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (_proxyReq, req) => {
              console.log(
                'Sending Request to the Target:',
                req.method,
                req.url,
              );
            });
            proxy.on('proxyRes', (proxyRes, req) => {
              console.log(
                'Received Response from the Target:',
                proxyRes.statusCode,
                req.url,
              );
            });
          },
        },
      },
    },
  });
};
