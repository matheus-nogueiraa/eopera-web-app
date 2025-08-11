import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import autoprefixer from 'autoprefixer'

export default defineConfig(() => {
  return {
    base: './',
    build: {
      outDir: 'build',
    },
    css: {
      postcss: {
        plugins: [
          autoprefixer({}), // add options if needed
        ],
      },
    },
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.jsx?$/,
      exclude: [],
    },
    optimizeDeps: {
      force: true,
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
    plugins: [ react() ],
    resolve: {
      alias: [
        {
          find: 'src/',
          replacement: `${path.resolve(__dirname, 'src')}/`,
        },
      ],
      extensions: [ '.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.scss' ],
    },
    server: {
      port: 3001, // Alterado para porta 3001 para evitar conflito com o backend
      proxy: {
        '/api': {
          // target: 'https://10.10.0.13:80',
          // target: 'https://adm.elcop.eng.br:9000',
          target: 'http://localhost:80', // Apontando para seu backend local na porta 80
          changeOrigin: true,
          secure: false,
          // Não reescrevemos o caminho para manter o /api
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('Erro de proxy:', err);
            });
          },
        },
      },
    },
  }
})
