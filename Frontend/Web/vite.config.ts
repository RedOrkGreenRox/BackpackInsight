// @ts-ignore
import { defineConfig } from 'vite';
// @ts-ignore
import { resolve, dirname } from 'path';
// @ts-ignore
import { fileURLToPath } from 'url';

// @ts-ignore
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
            '@utils': resolve(__dirname, 'ground/utils'),
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
                entryFileNames: 'assets/[name].[hash].js',
                chunkFileNames: 'assets/chunks/[name]-[hash].js',
                assetFileNames: (assetInfo) => {
                    // Разные сроки кеширования для разных типов файлов
                    if (assetInfo.name && assetInfo.name.endsWith('.css')) {
                        return 'assets/css/[name].[hash][extname]';
                    }
                    if (assetInfo.name && assetInfo.name.match(/\.(png|jpg|jpeg|gif|webp|avif|svg)$/)) {
                        return 'assets/images/[name].[hash][extname]';
                    }
                    if (assetInfo.name && assetInfo.name.match(/\.(woff2|woff|ttf|eot)$/)) {
                        return 'assets/fonts/[name].[hash][extname]';
                    }
                    return 'assets/[name].[hash][extname]';
                }
            }
        },
        // Добавляем хеши к именам файлов для долгого кеширования
        assetsInlineLimit: 4096,
        sourcemap: false
    },
    
    server: {
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,
        hmr: {
            clientPort: 5173
        },
        headers: {
            // Правильные заголовки кеширования для разработки
            'Cache-Control': 'no-cache'
        }
    },

    // Оптимизация для продакшена
    optimizeDeps: {
        include: ['aos', 'fuse.js']
    }
});
