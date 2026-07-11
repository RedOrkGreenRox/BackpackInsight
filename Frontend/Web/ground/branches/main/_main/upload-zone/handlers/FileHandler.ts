export class FileHandler {
    private static readFile(file: File): Promise<string> {
        // Blob#text() — современная замена FileReader, проще и чище
        return file.text();
    }

    public static async readAndProcessFile(file: File, onContent: (content: string) => void): Promise<void> {
        try {
            const content = await this.readFile(file);
            onContent(content);
        } catch (error) {
            console.error('[FileHandler] Error reading file:', error);
        }
    }

    public static isValidJsonFile(file: File): boolean {
        return file.type === 'application/json' || file.name.endsWith('.json');
    }
}
