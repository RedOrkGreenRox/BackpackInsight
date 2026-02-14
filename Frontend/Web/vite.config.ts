import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
    // Устанавливаем корень проекта в текущую директорию (Frontend/Web)
    root: __dirname, 
    
    // Папка со статикой
    publicDir: 'static',
    
    base: '/', 

    resolve: {
        alias: {
            '@roots': resolve(__dirname, 'ground/roots'),
            '@branches': resolve(__dirname, 'ground/branches'),
            '/static': '' // Для совместимости путей в коде
        }
    },

    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                // Теперь точка входа - index.html в корне Frontend/Web
                main: resolve(__dirname, 'index.html')
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
