export {};

declare global {
    interface Window {
        AOS: any;
        goTo: (url: string) => void;
        toggleSidebar: () => void;
        handleImageError: (img: HTMLImageElement) => void;
    }
}