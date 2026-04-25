import { BaseApiService } from './BaseApiService';
import { APIKey } from '../models/APIProject';

class ProjectService extends BaseApiService {
    private static instance: ProjectService;

    private constructor() {
        super();
    }

    public static getInstance(): ProjectService {
        if (!ProjectService.instance) {
            ProjectService.instance = new ProjectService();
        }
        return ProjectService.instance;
    }

    public async getAPIKeys(): Promise<APIKey[]> {
        const response = await this.get('/auth/api-keys');
        return response.data.keys || [];
    }

    public async generateAPIKey(project: string): Promise<any> {
        const response = await this.post('/auth/api-keys', { project });
        return response.data;
    }

    public async renameProject(id: string, name: string): Promise<void> {
        await this.patch(`/auth/api-keys?id=${id}`, { name });
    }

    public async revokeAPIKey(id: string): Promise<void> {
        await this.delete(`/auth/api-keys?id=${id}`);
    }
    
    public async getStats(): Promise<any> {
        const response = await this.get('/dashboard');
        return response.data;
    }
}

export const projectService = ProjectService.getInstance();
