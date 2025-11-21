import { AzureConnectionConfig } from '../types';

const CREDENTIALS_KEY = 'azureglance_credentials';
const ANALYSIS_KEY = 'azureglance_analyses';

export const storage = {
    getCredentials: (): AzureConnectionConfig[] => {
        try {
            const data = localStorage.getItem(CREDENTIALS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Failed to load credentials", e);
            return [];
        }
    },

    saveCredential: (cred: AzureConnectionConfig) => {
        const creds = storage.getCredentials();
        const newCred = { ...cred, id: cred.id || Date.now().toString() };
        const updated = [...creds, newCred];
        localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(updated));
        return newCred;
    },

    deleteCredential: (id: string) => {
        const creds = storage.getCredentials();
        const updated = creds.filter(c => c.id !== id);
        localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(updated));
    },

    getAnalyses: () => {
        try {
            const data = localStorage.getItem(ANALYSIS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Failed to load analyses", e);
            return [];
        }
    },

    saveAnalysis: (type: string, data: any) => {
        const analyses = storage.getAnalyses();
        const newAnalysis = {
            id: Date.now().toString(),
            type,
            data,
            createdAt: new Date().toISOString()
        };
        const updated = [newAnalysis, ...analyses];
        localStorage.setItem(ANALYSIS_KEY, JSON.stringify(updated));
        return newAnalysis;
    }
};
