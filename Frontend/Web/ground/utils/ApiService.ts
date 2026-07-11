// ApiService.ts
import { i18n } from '../localization/i18n';
import { decodeApiError, decodeItems, decodeProfile } from '../middleware/flatbuffer-decoders';
import type { ItemDefinition, PlayerProfile } from '../types/api-types';

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
     * Определяет тип ошибки на основе HTTP статуса.
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

        if (status === 403) {
            return {
                type: ErrorType.PERMISSION,
                message: 'error_connection_failed',
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

        if (status === 502 || status === 503 || status >= 500) {
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
     * Повторная попытка выполнения операции с экспоненциальным бэкоффом.
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
     * Отправляет пользовательский JSON профиля и получает бинарный FlatBuffer ProfileView.
     */
    public static async getProfile(jsonData: unknown): Promise<PlayerProfile> {
        const operation = async () => {
            const response = await fetch('/api/profile.fb', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/octet-stream'
                },
                body: JSON.stringify(jsonData)
            });

            const bytes = await response.arrayBuffer();
            if (!response.ok) {
                throw await this.errorFromBinaryResponse(response.status, bytes);
            }

            return decodeProfile(bytes);
        };

        return this.executeWithRetry(operation);
    }

    /**
     * Запрашивает справочник предметов как бинарный FlatBuffer ApiItemsPack.
     */
    public static async getItems(): Promise<ItemDefinition[]> {
        const operation = async () => {
            const lang = i18n.currentLang || 'en';
            const response = await fetch(`/api/items.fb?lang=${encodeURIComponent(lang)}`, {
                method: 'GET',
                headers: { 'Accept': 'application/octet-stream' }
            });

            const bytes = await response.arrayBuffer();
            if (!response.ok) {
                throw await this.errorFromBinaryResponse(response.status, bytes);
            }

            return decodeItems(bytes);
        };

        return this.executeWithRetry(operation);
    }

    private static async errorFromBinaryResponse(status: number, bytes: ArrayBuffer): Promise<Error> {
        const errorInfo = this.getErrorInfo(status);
        const apiError = decodeApiError(bytes);
        const detail = apiError?.detail || errorInfo.message;
        const message = errorInfo.retryable ? `Retryable: ${detail}` : detail;
        return new Error(message);
    }

    /**
     * Выполняет операцию с retry и разворачивает Retryable-ошибки.
     */
    private static async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
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
