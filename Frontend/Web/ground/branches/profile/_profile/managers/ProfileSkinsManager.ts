export class ProfileSkinsManager {
    public parseSkinsData(jsonText: string | null): Record<string, string[]> {
        if (!jsonText) return {};
        try {
            const rawSkinsMap = JSON.parse(jsonText);
            const skinsMap: Record<string, string[]> = {};
            for (const key in rawSkinsMap) {
                const value = rawSkinsMap[key];
                if (value) skinsMap[key.toLowerCase()] = value;
            }
            return skinsMap;
        } catch (e) {
            console.error("Error parsing skins", e);
            return {};
        }
    }

    public getUniqueSkins(heroName: string, skinsMap: Record<string, string[]>): string[] {
        const lowerHero = heroName.toLowerCase();
        const availableSkins = ['01', ...(skinsMap[lowerHero] || [])];
        return Array.from(new Set(availableSkins)).sort((a, b) => a.localeCompare(b));
    }

    public getSkinImagePaths(heroName: string, skin: string): { webp: string, avif: string } {
        const lowerHero = heroName.toLowerCase();
        const lowerSkin = skin.toLowerCase();
        return {
            webp: `/images/heroes/${lowerHero}/webp/${lowerHero}${lowerSkin}.webp`,
            avif: `/images/heroes/${lowerHero}/avif/${lowerHero}${lowerSkin}.avif`
        };
    }

    public attachSkins(
        container: HTMLElement,
        addListener: (el: Element | null, event: string, handler: EventListenerOrEventListenerObject) => void,
        updateHeaderSkinFn: (heroName: string, skin: string) => void,
        applySkinFn: (img: HTMLImageElement, paths: { webp: string; avif: string }) => void
    ): void {
        const skinsDataEl = document.getElementById('skins-data');
        const skinsMap = this.parseSkinsData(skinsDataEl?.textContent ?? null);

        container.querySelectorAll('.main-hero-card').forEach(card => {
            const heroName = (card as HTMLElement).dataset['heroName']?.toLowerCase();
            if (!heroName) return;

            const uniqueSkins = this.getUniqueSkins(heroName, skinsMap);
            if (uniqueSkins.length <= 1) {
                card.querySelectorAll('.skin-btn').forEach(b => {
                    (b as HTMLElement).style.display = 'none';
                });
                return;
            }

            let currentIdx = 0;
            const img = card.querySelector('.main-hero-image img') as HTMLImageElement | null;

            const updateSkin = () => {
                const skin = uniqueSkins[currentIdx];
                if (!skin || !img) return;
                const paths = this.getSkinImagePaths(heroName, skin);
                applySkinFn(img, paths);
                (card as HTMLElement).dataset['currentSkin'] = skin;
                updateHeaderSkinFn(heroName, skin);
            };

            addListener(card.querySelector('.prev-skin'), 'click', (e: Event) => {
                e.stopPropagation();
                currentIdx = (currentIdx - 1 + uniqueSkins.length) % uniqueSkins.length;
                updateSkin();
            });
            addListener(card.querySelector('.next-skin'), 'click', (e: Event) => {
                e.stopPropagation();
                currentIdx = (currentIdx + 1) % uniqueSkins.length;
                updateSkin();
            });
        });
    }
}
