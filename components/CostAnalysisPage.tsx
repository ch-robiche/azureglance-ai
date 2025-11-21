import React from 'react';
import { TopologyData } from '../types';

interface CostAnalysisPageProps {
    data: TopologyData;
    onBack: () => void;
    onRunAnalysis: () => void;
}

const CostAnalysisPage: React.FC<CostAnalysisPageProps> = ({ data, onBack, onRunAnalysis }) => {
    const analysis = data.analysis?.cost;
    const currencySymbol = data.currency || '$';

    if (!analysis) return (
        <div className="h-full p-6 overflow-y-auto bg-slate-900 text-white">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <h1 className="text-2xl font-bold">Cost Analysis</h1>
            </div>
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl max-w-md">
                    <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold mb-2">Cost Analysis Required</h2>
                    <p className="text-slate-400 mb-8">Run a comprehensive AI analysis to identify cost drivers and optimization opportunities.</p>
                    <button
                        onClick={onRunAnalysis}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 mx-auto"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Run Cost Analysis
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-full p-6 overflow-y-auto bg-slate-900 text-white">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <h1 className="text-2xl font-bold">Cost Analysis</h1>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                    <h3 className="text-slate-400 text-sm uppercase font-bold mb-1">Total Monthly Cost</h3>
                    <div className="text-4xl font-bold text-white">
                        {currencySymbol}{data.totalCost?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-slate-400 text-sm mt-2">Amortized Cost</div>
                </div>
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                    <h3 className="text-slate-400 text-sm uppercase font-bold mb-1">Potential Savings</h3>
                    <div className="text-4xl font-bold text-green-400">
                        {currencySymbol}{analysis.potentialSavings?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-slate-400 text-sm mt-2">Identified by AI</div>
                </div>
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                    <h3 className="text-slate-400 text-sm uppercase font-bold mb-1">Analysis Summary</h3>
                    <p className="text-slate-300 text-sm leading-relaxed line-clamp-3">{analysis.summary}</p>
                </div>
            </div>

            {/* Top Cost Drivers Table */}
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Top Cost Drivers & Optimization
            </h3>
            <div className="space-y-4">
                {analysis.topCostDrivers?.map((driver: any, idx: number) => (
                    <div key={idx} className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg hover:border-slate-600 transition-colors">
                        <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
                            <div>
                                <h4 className="font-bold text-lg text-white mb-1">{driver.resourceName}</h4>
                                <div className="text-2xl font-bold text-white mb-2">
                                    {currencySymbol}{driver.cost?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                                <p className="text-slate-400 text-sm">{driver.reason}</p>
                            </div>
                        </div>
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                            <h5 className="text-green-400 text-sm font-bold mb-2 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                Optimization Suggestion
                            </h5>
                            <p className="text-slate-300 text-sm leading-relaxed">{driver.optimizationSuggestion}</p>
                        </div>
                    </div>
                ))}
                {(!analysis.topCostDrivers || analysis.topCostDrivers.length === 0) && (
                    <div className="text-center p-8 text-slate-500 bg-slate-800 rounded-xl border border-slate-700">
                        No specific cost drivers identified.
                    </div>
                )}
            </div>
        </div>
    );
};

export default CostAnalysisPage;
