import { Branch, PageMeta } from './Branch';
import AOS from 'aos';

export class Gen {
    private static instance: Gen;
    private routes: Record<string, new () => Branch> = {};
    private currentBranch: Branch | null = null;
    private appContainer: HTMLElement | null = null;
    private isNavigating: boolean = false;
    private scrollTimeout: any = null;

    private constructor() {
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }

        window.addEventListener('popstate', (event) => {
            this.handleRoute(window.location.pathname, event.state);
        });

        window.addEventListener('scroll', () => {
            if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
            this.scrollTimeout = setTimeout(() => {
                this.updateCurrentState({ scrollY: window.scrollY });
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
        
        this.handleRoute(window.location.pathname, history.state);
        
        document.body.addEventListener('click', (e) => {
            const target = (e.target as HTMLElement).closest('a');
            if (target && target.matches('[data-link]')) {
                e.preventDefault();
                const stateData = (target as any)._stateData; 
                this.navigate(target.getAttribute('href') || '/', stateData);
            }
        });
    }

    public register(path: string, branchClass: new () => Branch): void {
        this.routes[path] = branchClass;
    }

    public navigate(path: string, data?: any): void {
        if (this.isNavigating) return;
        this.updateCurrentState({ scrollY: window.scrollY });
        history.pushState(data, '', path);
        this.handleRoute(path, data);
    }

    public updateCurrentState(partialData: any): void {
        const currentState = history.state || {};
        const newState = { ...currentState, ...partialData };
        history.replaceState(newState, '', window.location.pathname);
    }

    /**
     * Перерисовывает текущую страницу, сохраняя ее состояние.
     */
    public reRenderCurrentBranch(): void {
        this.handleRoute(window.location.pathname, history.state);
    }

    private updateMeta(meta: PageMeta): void {
        document.title = meta.title;
        
        let descTag = document.querySelector('meta[name="description"]');
        if (!descTag) {
            descTag = document.createElement('meta');
            descTag.setAttribute('name', 'description');
            document.head.appendChild(descTag);
        }
        descTag.setAttribute('content', meta.description);
    }

    private handleRoute(path: string, data?: any): void {
        if (!this.appContainer) return;
        
        this.isNavigating = true;

        const cleanPath = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
        
        let BranchClass = this.routes[cleanPath];
        let routeParams: Record<string, string> = {};

        if (!BranchClass) {
            for (const routePattern in this.routes) {
                if (routePattern.includes(':')) {
                    const routeParts = routePattern.split('/');
                    const pathParts = cleanPath.split('/');

                    if (routeParts.length === pathParts.length) {
                        let match = true;
                        const tempParams: Record<string, string> = {};

                        for (let i = 0; i < routeParts.length; i++) {
                            if (routeParts[i].startsWith(':')) {
                                const paramName = routeParts[i].slice(1);
                                tempParams[paramName] = decodeURIComponent(pathParts[i]);
                            } else if (routeParts[i] !== pathParts[i]) {
                                match = false;
                                break;
                            }
                        }

                        if (match) {
                            BranchClass = this.routes[routePattern];
                            routeParams = tempParams;
                            break;
                        }
                    }
                }
            }
        }

        if (!BranchClass) {
            BranchClass = this.routes['/404'] || this.routes['/'];
            console.warn(`Gen: Route ${cleanPath} not found`);
        }

        const switchBranch = () => {
            if (this.currentBranch) {
                this.currentBranch.unmount();
            }

            if (BranchClass) {
                const branch = new BranchClass();
                this.currentBranch = branch;
                
                const combinedData = { ...(data || {}), ...routeParams };

                this.updateMeta(branch.getMeta(combinedData));
                branch.mount(this.appContainer!, combinedData);
                
                const scrollY = data?.scrollY || 0;
                
                setTimeout(() => {
                    window.scrollTo(0, scrollY);
                    AOS.refresh();
                }, 100);
            }
        };

        if (!this.currentBranch) {
            switchBranch();
            this.isNavigating = false;
            return;
        }

        this.appContainer.classList.add('fade-out');

        setTimeout(() => {
            switchBranch();
            requestAnimationFrame(() => {
                this.appContainer?.classList.remove('fade-out');
                this.isNavigating = false;
            });
        }, 300);
    }
}
