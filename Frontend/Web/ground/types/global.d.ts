export {};

declare global {
    interface Window {
        AOS: any;
        changeSkin: (btn: HTMLElement, direction: number) => void;
        goTo: (url: string) => void;
        toggleSidebar: () => void;
        handleImageError: (img: HTMLImageElement) => void;
    }
}