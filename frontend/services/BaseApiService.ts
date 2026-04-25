import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export abstract class BaseApiService {
    protected api: AxiosInstance;

    constructor() {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        
        this.api = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.initializeInterceptors();
    }

    private initializeInterceptors() {
        this.api.interceptors.request.use(
            (config) => {
                if (typeof window !== 'undefined') {
                    const token = localStorage.getItem('velox_token');
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        this.api.interceptors.response.use(
            (response) => response,
            (error) => {
                // If the error is 401 and it's NOT a login request, redirect to landing
                if (error.response && error.response.status === 401 && !error.config.url.includes('/auth/login')) {
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem('velox_token');
                        window.location.href = '/';
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    protected async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.api.get<T>(url, config);
    }

    protected async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.api.post<T>(url, data, config);
    }

    protected async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.api.patch<T>(url, data, config);
    }

    protected async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.api.delete<T>(url, config);
    }
}
