import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

interface AdminPanelProps {
    token: string;
    onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ token, onClose }) => {
    const [credentials, setCredentials] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        tenantId: '',
        clientId: '',
        clientSecret: '',
        subscriptionId: ''
    });

    useEffect(() => {
        loadCredentials();
    }, []);

    const loadCredentials = async () => {
        try {
            const data = await api.getAdminCredentials(token);
            setCredentials(data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.addCredential(token, formData);
            setFormData({ name: '', tenantId: '', clientId: '', clientSecret: '', subscriptionId: '' });
            loadCredentials();
        } catch (e) {
            alert('Failed to add credential');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure?')) return;
        try {
            await api.deleteCredential(token, id);
            loadCredentials();
        } catch (e) {
            alert('Failed to delete');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-xl border border-slate-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Admin Panel - Manage Credentials</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Add New */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Add New Credential</h3>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <input placeholder="Name (e.g. Production)" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm" required />
                            <input placeholder="Tenant ID" value={formData.tenantId} onChange={e => setFormData({ ...formData, tenantId: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm" required />
                            <input placeholder="Client ID" value={formData.clientId} onChange={e => setFormData({ ...formData, clientId: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm" required />
                            <input placeholder="Client Secret" type="password" value={formData.clientSecret} onChange={e => setFormData({ ...formData, clientSecret: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm" required />
                            <input placeholder="Subscription ID" value={formData.subscriptionId} onChange={e => setFormData({ ...formData, subscriptionId: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm" required />
                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded text-sm font-medium">Add Credential</button>
                        </form>
                    </div>

                    {/* List */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Existing Credentials</h3>
                        <div className="space-y-3">
                            {credentials.map(cred => (
                                <div key={cred.id} className="bg-slate-800 p-3 rounded border border-slate-700 flex justify-between items-center">
                                    <div>
                                        <div className="font-medium text-white">{cred.name}</div>
                                        <div className="text-xs text-slate-400">{cred.subscriptionId}</div>
                                    </div>
                                    <button onClick={() => handleDelete(cred.id)} className="text-red-400 hover:text-red-300 p-1">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            ))}
                            {credentials.length === 0 && <div className="text-slate-500 text-sm italic">No credentials saved.</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
