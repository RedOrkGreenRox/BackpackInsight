export class SkinsManager {
    private skinsMap: Record<string, string[]> = {};

    public initSkins(skinsDataJson: string): void {
        try {
            const rawSkinsMap = JSON.parse(skinsDataJson);
            this.skinsMap = {};
            for (const key in rawSkinsMap) {
                const value = rawSkinsMap[key];
                if (value) this.skinsMap[key.toLowerCase()] = value;
            }
        } catch (e) {
            console.error("Error parsing skins", e);
        }
    }

    public getUniqueSkins(heroName: string): string[] {
        const lowerHero = heroName.toLowerCase();
        const availableSkins = ['01', ...(this.skinsMap[lowerHero] || [])];
        return Array.from(new Set(availableSkins)).sort((a, b) => a.localeCompare(b));
    }

    public getSkinImagePath(heroName: string, skin: string): { webp: string, avif: string } {
        const lowerHero = heroName.toLowerCase();
        const lowerSkin = skin.toLowerCase();
        return {
            webp: `/images/heroes/${lowerHero}/webp/${lowerHero}${lowerSkin}.webp`,
            avif: `/images/heroes/${lowerHero}/avif/${lowerHero}${lowerSkin}.avif`
        };
    }

    public getSkinExists(heroName: string, skin: string): boolean {
        const uniqueSkins = this.getUniqueSkins(heroName);
        return uniqueSkins.includes(skin);
    }
}
