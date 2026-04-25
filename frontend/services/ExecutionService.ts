import { BaseApiService } from './BaseApiService';
import { ExecutionPayload, ExecutionResult } from '../models/Execution';

class ExecutionService extends BaseApiService {
    private static instance: ExecutionService;

    private constructor() {
        super();
    }

    public static getInstance(): ExecutionService {
        if (!ExecutionService.instance) {
            ExecutionService.instance = new ExecutionService();
        }
        return ExecutionService.instance;
    }

    public async submitCode(payload: ExecutionPayload, explicitApiKey?: string): Promise<{ submission_id: string } | null> {
        const config = explicitApiKey ? {
            headers: { Authorization: `Bearer ${explicitApiKey}` }
        } : undefined;
        
        const response = await this.post('/submit', payload, config);
        return response.data;
    }

    public async checkStatus(submissionId: string, explicitApiKey?: string): Promise<ExecutionResult> {
        const config = explicitApiKey ? {
            headers: { Authorization: `Bearer ${explicitApiKey}` }
        } : undefined;
        
        const response = await this.get(`/status?submission_id=${submissionId}`, config);
        return response.data;
    }
}

export const executionService = ExecutionService.getInstance();
