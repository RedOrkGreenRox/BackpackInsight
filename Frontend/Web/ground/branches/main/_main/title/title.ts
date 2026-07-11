export class TitleRenderer {
    public static render(tFunction: (key: string) => string): string {
        return `<h1 class="main-title" data-aos="fade-down">${tFunction('profile_title')}</h1>`;
    }
}
