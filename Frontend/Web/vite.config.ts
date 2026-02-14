import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
    root: resolve(__dirname, 'ground'), // Корень исходников
    publicDir: resolve(__dirname, 'static'), // <-- ВАЖНО: Указываем папку статики (аналог public)
    base: '/', 

    resolve: {
        alias: {
            '@roots': resolve(__dirname, 'ground/roots'),
            '@branches': resolve(__dirname, 'ground/branches'),
            '/static': '' // Хак: чтобы импорты /static/... работали и в dev, и в prod (Vite будет искать в publicDir)
        }
    },

    build: {
        outDir: resolve(__dirname, 'dist'), // Выход в корень Web/dist
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'ground/core.html')
            },
            output: {
                entryFileNames: 'assets/[name].js',
                chunkFileNames: 'assets/chunks/[name]-[hash].js',
                assetFileNames: 'assets/[name][extname]'
            }
        }
    },
    
    server: {
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,
        hmr: {
            clientPort: 5173
        }
    }
});
