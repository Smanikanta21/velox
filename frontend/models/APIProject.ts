export interface APIKeyStats {
    total_requests: number;
    peak_rpm: number;
    success_rate: number;
}

export interface APIKey {
    id: string;
    project: string;
    preview: string;
    createdAt: string;
    scopes: string[];
    expiresAt: string | null;
    lastUsedAt: string | null;
    rawCreatedAt: string;
}

export class APIProject {
    constructor(
        public key: APIKey,
        public stats?: APIKeyStats
    ) {}
}
