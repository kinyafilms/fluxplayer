import { defineConfig } from 'vite';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    tailwindcss(),
    dts({ insertTypesEntry: true, include: ['src'] })
  ],
  server: {
    port: 3000,
    host: '127.0.0.1',
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'FluxPlayer',
      fileName: (format) => `fluxplayer.${format}.js`,
    },
    rollupOptions: {
      external: ['artplayer', 'hls.js', 'eventemitter3'],
      output: {
        globals: {
          artplayer: 'Artplayer',
          'hls.js': 'Hls',
          eventemitter3: 'EventEmitter3',
        },
      },
    },
  },
});
