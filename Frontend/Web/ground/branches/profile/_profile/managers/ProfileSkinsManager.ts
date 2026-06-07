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
}
