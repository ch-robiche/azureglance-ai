import React, { useEffect, useState } from 'react';
import { storage } from '../services/storage';

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoadAnalysis: (data: any) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, onLoadAnalysis }) => {
    const [analyses, setAnalyses] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen) {
            loadHistory();
        }
    }, [isOpen]);

    const loadHistory = () => {
        const data = storage.getAnalyses();
        setAnalyses(data);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-900 w-full max-w-2xl max-h-[80vh] rounded-xl border border-slate-800 flex flex-col shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-white">Analysis History</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-3">
                        {analyses.map((analysis) => (
                            <div key={analysis.id} className="bg-slate-800 p-4 rounded border border-slate-700 flex justify-between items-center hover:bg-slate-750 transition-colors">
                                <div>
                                    <div className="font-medium text-white capitalize">{analysis.type} Analysis</div>
                                    <div className="text-sm text-slate-400">{new Date(analysis.createdAt).toLocaleString()}</div>
                                </div>
                                <button
                                    onClick={() => { onLoadAnalysis(analysis.data); onClose(); }}
                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-medium"
                                >
                                    Load
                                </button>
                            </div>
                        ))}
                        {analyses.length === 0 && (
                            <div className="text-center text-slate-500 py-8">No saved analyses found.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
