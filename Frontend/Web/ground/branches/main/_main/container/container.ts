export class ContainerRenderer {
    public static render(): string {
        return `
            <div class="container">
                {{CONTENT}}
            </div>
        `;
    }
}
