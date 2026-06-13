import { Branch, PageMeta } from './Branch';
// @ts-ignore
import AOS from 'aos';
import { MetaService } from '@utils/MetaService';
import { ProfileCacheUtils } from './profileCacheUtils';

type BranchCtor = new () => Branch;
type BranchLoader = () => Promise<BranchCtor>;

interface RouteRecord {
    load: BranchLoader;
}

export class Gen {
    private static instance: Gen;
    private routes: Record<string, RouteRecord> = {};
    private currentBranch: Branch | null = null;
    private appContainer: HTMLElement | null = null;
    private isNavigating: boolean = false;
    private scrollTimeout: any = null;
    private navigationId = 0;
    private readonly prefetchedRoutes = new Set<string>();

    private constructor() {
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }

        globalThis.addEventListener('popstate', (event) => {
            void this.handleRoute(globalThis.location.pathname, event.state);
        });

        globalThis.addEventListener('scroll', () => {
            if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
            this.scrollTimeout = setTimeout(() => {
                this.updateCurrentState({ scrollY: globalThis.scrollY });
            }, 100);
        });
    }

    public static getInstance(): Gen {
        if (!Gen.instance) {
            Gen.instance = new Gen();
        }
        return Gen.instance;
    }

    public init(containerId: string): void {
        this.appContainer = document.getElementById(containerId);
        if (!this.appContainer) {
            throw new Error(`Gen: Container #${containerId} not found!`);
        }
        
        void this.handleRoute(globalThis.location.pathname, history.state);
        
        document.body.addEventListener('click', (e) => {
            const target = (e.target as HTMLElement).closest('a');
            if (target && target.matches('[data-link]')) {
                e.preventDefault();
                const stateData = (target as any)._stateData; 
                this.navigate(target.getAttribute('href') || '/', stateData);
            }
        });
    }

    public register(path: string, loader: BranchLoader): void {
        this.routes[path] = { load: loader };
    }

    public prefetch(path: string): void {
        const cleanPath = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
        if (this.prefetchedRoutes.has(cleanPath)) return;

        const { record } = this.findRoute(cleanPath);
        if (!record) return;

        this.prefetchedRoutes.add(cleanPath);
        record.load().catch(() => {
            this.prefetchedRoutes.delete(cleanPath);
        });
    }

    public navigate(path: string, data?: any): void {
        if (this.isNavigating) return;
        this.updateCurrentState({ scrollY: globalThis.scrollY });
        history.pushState(data, '', path);
        void this.handleRoute(path, data);
    }

    public updateCurrentState(partialData: any): void {
        const currentState = history.state || {};
        const newState = { ...currentState, ...partialData };
        history.replaceState(newState, '', globalThis.location.pathname);
    }

    /**
     * Перерисовывает текущую страницу, сохраняя ее состояние.
     */
    public reRenderCurrentBranch(): void {
        void this.handleRoute(globalThis.location.pathname, history.state);
    }

    private updateMeta(meta: PageMeta): void {
        MetaService.updatePageMeta(meta);
    }

    private findRoute(cleanPath: string): { record: RouteRecord | null; params: Record<string, string> } {
        const exact = this.routes[cleanPath];
        if (exact) return { record: exact, params: {} };

        for (const routePattern in this.routes) {
            if (!routePattern.includes(':')) continue;

            const routeParts = routePattern.split('/');
            const pathParts = cleanPath.split('/');

            if (routeParts.length !== pathParts.length) continue;

            let match = true;
            const params: Record<string, string> = {};

            for (let i = 0; i < routeParts.length; i++) {
                const routePart = routeParts[i];
                const pathPart = pathParts[i];

                if (routePart && routePart.startsWith(':')) {
                    const paramName = routePart.slice(1);
                    params[paramName] = decodeURIComponent(pathPart || '');
                } else if (routePart !== pathPart) {
                    match = false;
                    break;
                }
            }

            if (match) {
                return { record: this.routes[routePattern] || null, params };
            }
        }

        return { record: null, params: {} };
    }

    private async handleRoute(path: string, data?: any): Promise<void> {
        if (!this.appContainer) return;
        
        this.isNavigating = true;
        const navId = ++this.navigationId;

        const cleanPath = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
        
        // Очищаем кэш профиля при переходе на /profile без данных
        if (cleanPath === '/profile') {
            ProfileCacheUtils.clearCacheOnNavigation(data);
        }
        
        let { record, params: routeParams } = this.findRoute(cleanPath);

        if (!record) {
            record = this.routes['/404'] || this.routes['/'] || null;
            console.warn(`Gen: Route ${cleanPath} not found`);
        }

        if (!record) {
            this.isNavigating = false;
            return;
        }

        let BranchClass: BranchCtor;
        try {
            BranchClass = await record.load();
        } catch (e) {
            console.error(`Gen: Failed to load route ${cleanPath}`, e);
            const fallback = cleanPath !== '/404' ? this.routes['/404'] : null;
            if (!fallback) {
                this.isNavigating = false;
                return;
            }
            BranchClass = await fallback.load();
            routeParams = {};
        }

        if (navId !== this.navigationId) return;

        const switchBranch = () => {
            if (navId !== this.navigationId) return;

            if (this.currentBranch) {
                this.currentBranch.unmount();
            }

            const branch = new BranchClass();
            this.currentBranch = branch;
            
            const combinedData = { ...(data || {}), ...routeParams };

            this.updateMeta(branch.getMeta(combinedData));
            branch.mount(this.appContainer!, combinedData);
            
            const scrollY = data?.scrollY || 0;
            
            setTimeout(() => {
                if (navId !== this.navigationId) return;
                globalThis.scrollTo(0, scrollY);
                AOS.refresh();
            }, 100);
        };

        if (!this.currentBranch) {
            switchBranch();
            if (navId === this.navigationId) this.isNavigating = false;
            return;
        }

        this.appContainer.classList.add('fade-out');

        setTimeout(() => {
            if (navId !== this.navigationId) return;

            switchBranch();
            requestAnimationFrame(() => {
                if (navId !== this.navigationId) return;
                this.appContainer?.classList.remove('fade-out');
                this.isNavigating = false;
            });
        }, 300);
    }
}
