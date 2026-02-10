declare module '*.scss';
declare module '*.css';
declare module '*.woff2';

interface Window {
    isSlowConnection: boolean;
    AOS: {
        init: (options: any) => void;
        refresh: () => void;
    };
    handleImageError: (img: HTMLImageElement) => void;
    toggleSidebar: () => void;
    goTo: (url: string) => void;
    changeSkin: (btn: HTMLElement, direction: number) => void;
}
