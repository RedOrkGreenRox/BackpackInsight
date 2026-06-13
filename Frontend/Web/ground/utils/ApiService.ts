// ApiService.ts

enum ErrorType {
    NETWORK = 'network',
    VALIDATION = 'validation',
    PERMISSION = 'permission',
    SERVER = 'server'
}

interface ErrorInfo {
    type: ErrorType;
    message: string;
    retryable: boolean;
    status?: number;
}

export class ApiService {
    private static readonly MAX_RETRIES = 3;
    private static readonly BASE_DELAY = 1000;

    /**
     * Определяет тип ошибки на основе HTTP статуса
     */
    private static getErrorInfo(status: number): ErrorInfo {
        if (status === 400) {
            return {
                type: ErrorType.VALIDATION,
                message: 'error_json_invalid',
                retryable: false,
                status
            };
        }
        
        if (status === 413) {
            return {
                type: ErrorType.VALIDATION,
                message: 'error_file_too_large',
                retryable: false,
                status
            };
        }
        
        if (status === 429) {
            return {
                type: ErrorType.PERMISSION,
                message: 'error_too_many_requests',
                retryable: true,
                status
            };
        }

        // 503 — бэкенд временно недоступен (VPS перезагружается, деплой и т.п.).
        // Cloudflare Edge Function возвращает его когда не может достучаться до VPS.
        // Делаем retry, но с более длинной паузой — бэкенду нужно время подняться.
        if (status === 503) {
            return {
                type: ErrorType.SERVER,
                message: 'error_server_unavailable',
                retryable: true,
                status
            };
        }

        if (status >= 500) {
            return {
                type: ErrorType.SERVER,
                message: 'error_server_unavailable',
                retryable: true,
                status
            };
        }
        
        return {
            type: ErrorType.NETWORK,
            message: 'error_connection_failed',
            retryable: true,
            status
        };
    }

    /**
     * Повторная попытка выполнения операции с экспоненциальным бэкоффом
     */
    private static async retryWithBackoff<T>(
        operation: () => Promise<T>,
        maxRetries: number = this.MAX_RETRIES
    ): Promise<T> {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await operation();
            } catch (error) {
                if (i === maxRetries - 1) throw error;
                
                const delay = this.BASE_DELAY * Math.pow(2, i);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        throw new Error('Max retries exceeded');
    }

    /**
     * Отправляет JSON данные профиля на сервер с retry механизмом
     */
    public static async getProfile(jsonData: any): Promise<any> {
        const operation = async () => {
            const response = await fetch('/api/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(jsonData)
            });

            if (!response.ok) {
                const errorInfo = this.getErrorInfo(response.status);
                
                if (!errorInfo.retryable) {
                    throw new Error(errorInfo.message);
                }
                
                throw new Error(`Retryable: ${errorInfo.message}`);
            }

            return await response.json();
        };

        try {
            return await this.retryWithBackoff(operation);
        } catch (error: any) {
            const message = error.message || error.toString();
            if (message.startsWith('Retryable:')) {
                throw new Error(message.replace('Retryable: ', ''));
            }
            throw error;
        }
    }

    /**
     * Запрашивает список предметов с сервера с retry механизмом
     */
    public static async getItems(): Promise<any> {
        const operation = async () => {
            const response = await fetch('/api/items');

            if (!response.ok) {
                const errorInfo = this.getErrorInfo(response.status);
                
                if (!errorInfo.retryable) {
                    throw new Error(errorInfo.message);
                }
                
                throw new Error(`Retryable: ${errorInfo.message}`);
            }

            return await response.json();
        };

        try {
            return await this.retryWithBackoff(operation);
        } catch (error: any) {
            const message = error.message || error.toString();
            if (message.startsWith('Retryable:')) {
                throw new Error(message.replace('Retryable: ', ''));
            }
            throw error;
        }
    }
}