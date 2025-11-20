import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    token: string;
    onLoadAnalysis: (data: any) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, token, onLoadAnalysis }) => {
    const [analyses, setAnalyses] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen) {
            api.getAnalyses(token).then(setAnalyses).catch(console.error);
        }
    }, [isOpen, token]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-xl border border-slate-800 w-full max-w-2xl max-h-[80vh] overflow-y-auto flex flex-col">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Analysis History</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-6 space-y-3">
                    {analyses.map(a => (
                        <div key={a.id} className="bg-slate-800 p-4 rounded border border-slate-700 flex justify-between items-center">
                            <div>
                                <div className="font-medium text-white capitalize">{a.type} Analysis</div>
                                <div className="text-xs text-slate-400">{new Date(a.createdAt).toLocaleString()}</div>
                            </div>
                            <button
                                onClick={() => { onLoadAnalysis(a.data); onClose(); }}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm"
                            >
                                Load
                            </button>
                        </div>
                    ))}
                    {analyses.length === 0 && <div className="text-slate-500 text-center">No saved analyses found.</div>}
                </div>
            </div>
        </div>
    );
};
