// noinspection JSUnresolvedReference
import {defineConfig} from 'vite';
import {resolve, dirname} from 'path';
import {fileURLToPath} from 'url';

// Настройка путей для ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Директория шаблонов
const templatesDir = resolve(__dirname, 'templates');

export default defineConfig({
    // Указываем корень проекта для корректного разрешения путей
    root: resolve(__dirname),
    base: '/dist/',

    resolve: {
        alias: {
            '/templates': templatesDir,
            '/static': resolve(__dirname, 'static'),
            // Теперь ты можешь писать import '@roots/vars' вместо длинных путей
            '@roots': resolve(templatesDir, 'roots'),
            '@branches': resolve(templatesDir, 'branches'),
        }
    },

    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                'main': resolve(templatesDir, 'branches/main/main.js'),
                'profile': resolve(templatesDir, 'branches/profile/profile.js'),
                'items': resolve(templatesDir, 'branches/items/items.js'),
                '404': resolve(templatesDir, 'branches/404/404.js'),
                'base': resolve(templatesDir, 'roots/base.js')
            },
            output: {
                entryFileNames: 'js/[name].js',
                chunkFileNames: 'js/chunks/[name].js',
                assetFileNames: (assetInfo) => {
                    const assetName = assetInfo.name || '';
                    if (assetName.endsWith('.css')) {
                        const nameOnly = assetName.split('/').pop();
                        return `css/${nameOnly}`;
                    }
                    return 'assets/[name][extname]';
                },
                // Опционально: выносим тяжелые либы
                manualChunks: {
                    'vendor-screenshot': ['html2canvas']
                }
            }
        }, // Вот эта скобка у тебя пропала!
        manifest: true
    },
    css: {
        preprocessorOptions: {
            scss: {
                // Используем современный компилятор для работы с SASS
                api: 'modern-compiler'
            }
        }
    }
});