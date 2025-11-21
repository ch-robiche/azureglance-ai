import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { AzureConnectionConfig } from '../types';

interface AdminPanelProps {
    onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
    const [credentials, setCredentials] = useState<AzureConnectionConfig[]>([]);
    const [newCred, setNewCred] = useState({ name: '', tenantId: '', clientId: '', clientSecret: '', subscriptionId: '' });

    useEffect(() => {
        loadCredentials();
    }, []);

    const loadCredentials = () => {
        const data = storage.getCredentials();
        setCredentials(data);
    };

    const handleAdd = () => {
        if (!newCred.name || !newCred.tenantId || !newCred.clientId || !newCred.clientSecret || !newCred.subscriptionId) return;

        storage.saveCredential(newCred);
        setNewCred({ name: '', tenantId: '', clientId: '', clientSecret: '', subscriptionId: '' });
        loadCredentials();
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this credential?')) {
            storage.deleteCredential(id);
            loadCredentials();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-900 w-full max-w-4xl h-[80vh] rounded-xl border border-slate-800 flex flex-col shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-white">Settings & Credentials</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-white mb-4">Add New Azure Credential</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <input placeholder="Friendly Name (e.g. Dev Sub)" value={newCred.name} onChange={e => setNewCred({ ...newCred, name: e.target.value })} className="bg-slate-950 border border-slate-700 rounded p-2 text-white" />
                            <input placeholder="Tenant ID" value={newCred.tenantId} onChange={e => setNewCred({ ...newCred, tenantId: e.target.value })} className="bg-slate-950 border border-slate-700 rounded p-2 text-white" />
                            <input placeholder="Client ID" value={newCred.clientId} onChange={e => setNewCred({ ...newCred, clientId: e.target.value })} className="bg-slate-950 border border-slate-700 rounded p-2 text-white" />
                            <input placeholder="Client Secret" type="password" value={newCred.clientSecret} onChange={e => setNewCred({ ...newCred, clientSecret: e.target.value })} className="bg-slate-950 border border-slate-700 rounded p-2 text-white" />
                            <input placeholder="Subscription ID" value={newCred.subscriptionId} onChange={e => setNewCred({ ...newCred, subscriptionId: e.target.value })} className="bg-slate-950 border border-slate-700 rounded p-2 text-white" />
                        </div>
                        <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium">Add Credential</button>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Saved Credentials</h3>
                        <div className="space-y-2">
                            {credentials.map(cred => (
                                <div key={cred.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded border border-slate-700">
                                    <div>
                                        <div className="font-medium text-white">{cred.name}</div>
                                        <div className="text-sm text-slate-400">Sub: {cred.subscriptionId}</div>
                                    </div>
                                    <button onClick={() => handleDelete(cred.id!)} className="text-red-400 hover:text-red-300 p-2">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            ))}
                            {credentials.length === 0 && (
                                <div className="text-slate-500 text-center py-8">No credentials saved locally.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
