import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      // CHANGED: Set to your repo name with slashes for GitHub Pages
      base: '/twspin/', 
      plugins: [react()],
      // REMOVED: The 'define' block is deleted since you use BYOK (localStorage)
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});