// @ts-ignore
import { defineConfig } from 'vite';
// @ts-ignore
import { resolve, dirname } from 'node:path';
// @ts-ignore
import { fileURLToPath } from 'node:url';

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
                manualChunks: (id) => {
                    // Vendor-библиотеки
                    if (id.includes('node_modules/html2canvas')) return 'vendor-html2canvas';
                    if (id.includes('node_modules/aos')) return 'vendor-aos';
                    if (id.includes('node_modules/fuse.js')) return 'vendor-fuse';

                    // Страницы — читаемые имена без хеш-мусора
                    if (id.includes('/branches/404/')) return 'page-404';
                    if (id.includes('/branches/main/')) return 'page-main';
                    if (id.includes('/branches/items/')) return 'page-items';
                    if (id.includes('/branches/profile/')) return 'page-profile';
                    if (id.includes('/branches/itemDetail/')) return 'page-item-detail';

                    // Shared-ядро приложения.
                    // Важно держать i18n рядом с LoadingStates/Branch,
                    // иначе может появиться цикл чанков page-404 -> app-shared -> page-404.
                    if (
                        id.includes('/ground/roots/Branch') ||
                        id.includes('/ground/localization/i18n') ||
                        id.includes('/ground/utils/SlugService') ||
                        id.includes('/ground/utils/ImageFormatService') ||
                        id.includes('/ground/utils/ItemsCacheService') ||
                        id.includes('/ground/utils/ApiService') ||
                        id.includes('/ground/utils/LoadingStates') ||
                        id.includes('/ground/utils/ItemIconService')
                    ) {
                        return 'app-shared';
                    }
                },
                assetFileNames: (assetInfo) => {
                    // Разные сроки кеширования для разных типов файлов
                    if (assetInfo.name?.endsWith('.css')) {
                        return 'assets/[name]-[hash][extname]';
                    }
                    if (assetInfo.name?.match(/\.(png|jpg|jpeg|gif|webp|avif|svg)$/)) {
                        return 'assets/images/[name].[hash][extname]';
                    }
                    if (assetInfo.name?.match(/\.(woff2|woff|ttf|eot)$/)) {
                        return 'assets/fonts/[name].[hash][extname]';
                    }
                    return 'assets/[name].[hash][extname]';
                }
            }
        },
        // CSS держим единым файлом: route-level JS остаётся lazy, но страницы не мигают без стилей при F5.
        cssCodeSplit: false,
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
