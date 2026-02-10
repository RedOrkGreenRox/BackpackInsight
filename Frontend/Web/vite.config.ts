import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

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
                'main': resolve(templatesDir, 'branches/main/main.ts'),
                'profile': resolve(templatesDir, 'branches/profile/profile.ts'),
                'items': resolve(templatesDir, 'branches/items/items.ts'),
                '404': resolve(templatesDir, 'branches/404/404.ts')
            },
            output: {
                entryFileNames: 'js/[name].js',
                // Убираем явное указание chunkFileNames для base, чтобы он не выделялся в предсказуемое имя,
                // или настраиваем manualChunks, чтобы дублировать код.
                // Но проще всего просто позволить Vite делать свое дело, если это не вызывает ошибок.
                // Если нужно принудительно вшить base.ts в каждый бандл:
                manualChunks: (id) => {
                    // Если файл из папки roots, не выделяем его в отдельный чанк,
                    // а позволяем дублироваться (возвращаем undefined или null для стандартного поведения,
                    // но стандартное поведение как раз выделяет общие модули).
                    
                    // Чтобы ПРЕДОТВРАТИТЬ выделение чанка, к сожалению, в Rollup нет простого флага "no shared chunks".
                    // Но можно попробовать хак: для каждого entry point создавать свой чанк.
                    
                    if (id.includes('node_modules')) {
                        // Вендорные либы можно выделить
                        if (id.includes('html2canvas')) {
                            return 'vendor-screenshot';
                        }
                    }
                },
                chunkFileNames: 'js/chunks/[name]-[hash].js', // Добавляем хэш, чтобы избежать проблем с кэшем
                assetFileNames: (assetInfo) => {
                    const assetName = assetInfo.name || '';
                    if (assetName.endsWith('.css')) {
                        const nameOnly = assetName.split('/').pop();
                        return `css/${nameOnly}`;
                    }
                    return 'assets/[name][extname]';
                }
            }
        },
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