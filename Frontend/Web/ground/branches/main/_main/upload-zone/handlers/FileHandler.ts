export class FileHandler {
    private static readFile(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('No file provided'));
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target && typeof e.target.result === 'string') {
                    resolve(e.target.result);
                } else {
                    reject(new Error('Failed to read file'));
                }
            };
            reader.onerror = () => reject(new Error('File reading error'));
            reader.readAsText(file);
        });
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
