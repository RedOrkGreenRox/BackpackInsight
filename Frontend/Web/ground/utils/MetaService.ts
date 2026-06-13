import type { PageMeta } from '@roots/Branch.ts';

export class MetaService {
    public static updatePageMeta(meta: PageMeta): void {
        document.title = meta.title;
        this.setMeta('name', 'description', meta.description);
    }

    public static setMeta(attr: 'name' | 'property', name: string, content: string): void {
        let tag = document.querySelector(`meta[${attr}="${name}"]`);
        if (!tag) {
            tag = document.createElement('meta');
            tag.setAttribute(attr, name);
            document.head.appendChild(tag);
        }
        tag.setAttribute('content', content);
    }

    public static setLink(rel: string, href: string, hreflang?: string): void {
        const selector = hreflang
            ? `link[rel="${rel}"][hreflang="${hreflang}"]`
            : `link[rel="${rel}"]`;
        let tag = document.querySelector(selector) as HTMLLinkElement | null;
        if (!tag) {
            tag = document.createElement('link');
            tag.rel = rel;
            if (hreflang) tag.hreflang = hreflang;
            document.head.appendChild(tag);
        }
        tag.href = href;
    }

    public static setJsonLd(id: string, data: unknown): HTMLScriptElement {
        let script = document.getElementById(id) as HTMLScriptElement | null;
        if (!script) {
            script = document.createElement('script');
            script.id = id;
            script.type = 'application/ld+json';
            document.head.appendChild(script);
        }
        script.textContent = JSON.stringify(data, null, 2);
        return script;
    }
}
