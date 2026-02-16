// ApiService.ts
export class ApiService {
    /**
     * Отправляет JSON данные профиля на сервер.
     */
    public static async getProfile(jsonData: any): Promise<any> {
        const response = await fetch('/api/profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonData)
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        return await response.json();
    }

    /**
     * Запрашивает список предметов с сервера.
     */
    public static async getItems(): Promise<any> {
        const response = await fetch('/api/items');

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        return await response.json();
    }
}