import React, { useState, useEffect } from 'react';
import { generateMonthAnalysis } from '../services/geminiService';

interface MonthAnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    month: string;
    cost: number;
    currency: string;
}

const MonthAnalysisModal: React.FC<MonthAnalysisModalProps> = ({ isOpen, onClose, month, cost, currency }) => {
    const [analysis, setAnalysis] = useState<string>('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && month) {
            setLoading(true);
            setAnalysis('');
            // Simulate a "dev console" analysis
            generateMonthAnalysis(month, cost, currency)
                .then(text => setAnalysis(text))
                .catch(err => setAnalysis(`Error analyzing month: ${err.message}`))
                .finally(() => setLoading(false));
        }
    }, [isOpen, month, cost, currency]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-slate-950 border border-slate-700 rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden font-mono" onClick={e => e.stopPropagation()}>
                <div className="bg-slate-900 p-3 border-b border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="ml-2 text-xs text-slate-400">azure-cost-analyzer -- {month}</span>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white">✕</button>
                </div>
                <div className="p-6 text-sm text-green-400 h-96 overflow-y-auto whitespace-pre-wrap">
                    {loading ? (
                        <div className="animate-pulse">
                            &gt; Analyzing cost data for {month}...<br />
                            &gt; Fetching historical trends...<br />
                            &gt; Identifying anomalies...<br />
                            <span className="inline-block w-2 h-4 bg-green-400 animate-blink ml-1"></span>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4 text-slate-300">
                                &gt; Analysis Complete.<br />
                                &gt; Target: {month}<br />
                                &gt; Total Spend: {currency}{cost.toLocaleString()}<br />
                                ----------------------------------------
                            </div>
                            {analysis}
                            <br />
                            <br />
                            <span className="animate-pulse">_</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MonthAnalysisModal;
