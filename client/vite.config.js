import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        // Тот же порт, что был у CRA — на него настроен CORS на сервере
        port: 3000,
        open: true,
    },
    build: {
        // Та же папка, что была у CRA, чтобы не менять деплой
        outDir: 'build',
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/setupTests.js',
    },
});
