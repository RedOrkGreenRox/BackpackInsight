import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
    root: resolve(__dirname, 'ground'), // Корень теперь в ground
    base: '/', // Базовый путь для ассетов в проде

    resolve: {
        alias: {
            '@roots': resolve(__dirname, 'ground/roots'),
            '@branches': resolve(__dirname, 'ground/branches'),
            '/static': resolve(__dirname, 'static') // Алиас для статики
        }
    },

    build: {
        outDir: resolve(__dirname, 'dist'), // Выход в корень Web/dist
        emptyOutDir: true, // <-- ВАЖНО: Очищать папку перед сборкой
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'ground/core.html') // Точка входа
            },
            output: {
                entryFileNames: 'assets/[name].js',
                chunkFileNames: 'assets/chunks/[name]-[hash].js',
                assetFileNames: 'assets/[name][extname]'
            }
        }
    },
    
    // Для локальной разработки (dev server)
    server: {
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,
        hmr: {
            clientPort: 5173
        }
    }
});
