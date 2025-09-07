import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'import.meta.env.VITE_ELEVENLABS_API_KEY': JSON.stringify(env.VITE_ELEVENLABS_API_KEY),
        'import.meta.env.VITE_ELEVENLABS_AGENT_ID': JSON.stringify(env.VITE_ELEVENLABS_AGENT_ID)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      server: {
        port: 3000,
        open: true
      }
    };
});
