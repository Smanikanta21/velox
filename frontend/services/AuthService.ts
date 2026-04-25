import { BaseApiService } from './BaseApiService';
import { User } from '../models/User';

class AuthService extends BaseApiService {
    private static instance: AuthService;

    private constructor() {
        super();
    }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    public async login(email: string, password?: string): Promise<void> {
        const response = await this.post('/auth/login', { email, password });
        if (response.data.data && response.data.data.token) {
            this.setToken(response.data.data.token);
        } else if (response.data.token) {
            this.setToken(response.data.token);
        }
    }

    public async signup(email: string, name: string, password?: string): Promise<void> {
        const response = await this.post('/auth/signup', { email, name, password });
        if (response.data.data && response.data.data.token) {
            this.setToken(response.data.data.token);
        } else if (response.data.token) {
            this.setToken(response.data.token);
        }
    }

    public async getProfile(): Promise<User> {
        const response = await this.get('/dashboard');
        return User.fromJSON(response.data);
    }

    public setToken(token: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem('velox_token', token);
        }
    }

    public getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('velox_token');
        }
        return null;
    }

    public logout(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('velox_token');
            window.location.href = '/';
        }
    }
}

export const authService = AuthService.getInstance();
