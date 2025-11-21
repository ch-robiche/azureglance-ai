import React from 'react';
import { TopologyData } from '../types';

interface SecurityPageProps {
    data: TopologyData;
    onBack: () => void;
    onRunAnalysis: () => void;
}

const SecurityPage: React.FC<SecurityPageProps> = ({ data, onBack, onRunAnalysis }) => {
    const analysis = data.analysis?.security;

    if (!analysis) return (
        <div className="h-full p-6 overflow-y-auto bg-slate-900 text-white">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <h1 className="text-2xl font-bold">Security Analysis</h1>
            </div>
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl max-w-md">
                    <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold mb-2">Security Analysis Required</h2>
                    <p className="text-slate-400 mb-8">Run a comprehensive AI analysis to identify vulnerabilities and security risks in your infrastructure.</p>
                    <button
                        onClick={onRunAnalysis}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 mx-auto"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Run Security Analysis
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-full p-6 overflow-y-auto bg-slate-900 text-white">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <h1 className="text-2xl font-bold">Security Analysis</h1>
            </div>

            {/* Score Card */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h2 className="text-slate-400 text-sm uppercase font-bold mb-1">Security Score</h2>
                    <div className={`text-6xl font-bold ${analysis.securityScore > 80 ? 'text-green-500' : analysis.securityScore > 50 ? 'text-amber-500' : 'text-red-500'}`}>
                        {analysis.securityScore}/100
                    </div>
                </div>
                <div className="flex-1 bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                    <h3 className="text-slate-400 text-xs uppercase font-bold mb-2">Executive Summary</h3>
                    <p className="text-slate-300 leading-relaxed">{analysis.summary}</p>
                </div>
            </div>

            {/* Critical Risks Table */}
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Critical Findings & Remediation
            </h3>
            <div className="space-y-4">
                {analysis.topRisks?.map((risk: any, idx: number) => (
                    <div key={idx} className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg hover:border-slate-600 transition-colors">
                        <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${risk.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                                        risk.severity === 'High' ? 'bg-orange-500/20 text-orange-400' :
                                            risk.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-blue-500/20 text-blue-400'
                                        }`}>
                                        {risk.severity}
                                    </span>
                                    <h4 className="font-bold text-lg text-white">{risk.risk}</h4>
                                </div>
                                <p className="text-slate-400 text-sm">Affected Resource: <span className="text-blue-400 font-mono bg-blue-400/10 px-1.5 py-0.5 rounded">{risk.affectedResource}</span></p>
                            </div>
                        </div>
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                            <h5 className="text-green-400 text-sm font-bold mb-2 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Recommended Remediation
                            </h5>
                            <p className="text-slate-300 text-sm leading-relaxed">{risk.remediation}</p>
                        </div>
                    </div>
                ))}
                {(!analysis.topRisks || analysis.topRisks.length === 0) && (
                    <div className="text-center p-8 text-slate-500 bg-slate-800 rounded-xl border border-slate-700">
                        No critical risks identified. Great job!
                    </div>
                )}
            </div>
        </div>
    );
};

export default SecurityPage;
