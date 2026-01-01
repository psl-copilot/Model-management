export interface User {
    id: string;
    username: string;
    email?: string;
    claims?: string[];
    tenantId?: string;
}