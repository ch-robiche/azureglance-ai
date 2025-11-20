import React from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { TopologyData, ResourceType } from '../types';
import CostTableModal from './CostTableModal';
import MonthAnalysisModal from './MonthAnalysisModal';

interface DashboardProps {
    data: TopologyData;
    onAnalysisUpdate?: (analysis: { cost: any, security: any }) => void;
    onDateRangeChange?: (startDate: Date, endDate: Date) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, onAnalysisUpdate, onDateRangeChange }) => {
    const [costData, setCostData] = React.useState<any>(data.analysis?.cost || null);
    const [securityData, setSecurityData] = React.useState<any>(data.analysis?.security || null);
    const [loadingAnalysis, setLoadingAnalysis] = React.useState(false);
    const [isCostModalOpen, setIsCostModalOpen] = React.useState(false);
    const [monthAnalysis, setMonthAnalysis] = React.useState<{ isOpen: boolean, month: string, cost: number, currency: string }>({
        isOpen: false, month: '', cost: 0, currency: ''
    });

    React.useEffect(() => {
        // If analysis is already present in data, use it and don't fetch
        if (data.analysis) {
            if (data.analysis.cost !== costData) setCostData(data.analysis.cost);
            if (data.analysis.security !== securityData) setSecurityData(data.analysis.security);
            return;
        }

        const fetchAnalysis = async () => {
            setLoadingAnalysis(true);
            try {
                // Parallel fetch
                const [cost, security] = await Promise.all([
                    import('../services/geminiService').then(m => m.generateCostAnalysis(data)),
                    import('../services/geminiService').then(m => m.generateSecurityAnalysis(data))
                ]);
                setCostData(cost);
                setSecurityData(security);

                // Cache the result in the parent state
                if (onAnalysisUpdate) {
                    onAnalysisUpdate({ cost, security });
                }
            } catch (e) {
                console.error("Failed to fetch dashboard analysis", e);
            } finally {
                setLoadingAnalysis(false);
            }
        };

        if (data.nodes.length > 0 && !data.analysis) {
            fetchAnalysis();
        }
    }, [data]); // Intentionally omitted onAnalysisUpdate to avoid re-triggering if parent recreates function

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const monthsBack = parseInt(e.target.value);
        const now = new Date();

        // 0 = Current Month
        // 1 = Last Month

        // Start of the target month:
        // If monthsBack = 0 (Current), we want 1st of this month.
        const start = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);

        // End of the target month:
        // If monthsBack = 0 (Current), we want last day of this month.
        // new Date(y, m + 1, 0) gives last day of month m.
        const end = new Date(now.getFullYear(), now.getMonth() - monthsBack + 1, 0);

        if (onDateRangeChange) {
            onDateRangeChange(start, end);
        }
    };

    // Compute metrics from data
    const typeCounts = data.nodes.reduce((acc, node) => {
        acc[node.type] = (acc[node.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const pieData = Object.keys(typeCounts).map(key => ({
        name: key,
        value: typeCounts[key]
    })).filter(d => d.value > 0);

    const statusCounts = data.nodes.reduce((acc, node) => {
        acc[node.status] = (acc[node.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const barData = [
        { name: 'Running', value: statusCounts['Running'] || 0 },
        { name: 'Stopped', value: statusCounts['Stopped'] || 0 },
        { name: 'Degraded', value: statusCounts['Degraded'] || 0 },
        { name: 'OK', value: statusCounts['OK'] || 0 },
    ];

    // Use the total cost calculated from all resources in the subscription
    const actualTotalCost = data.totalCost || 0;
    const currencySymbol = data.currency || '$';
    const costTrendData = data.costHistory?.map(item => ({
        name: new Date(item.date).toLocaleDateString('default', { month: 'short' }),
        cost: item.cost,
        fullDate: item.date
    })) || [];

    const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

    return (
        <div className="h-full p-6 overflow-y-auto bg-slate-900">
            <h2 className="text-2xl font-bold text-white mb-6">Infrastructure Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                    <h3 className="text-slate-400 text-sm uppercase font-bold mb-1">Total Resources</h3>
                    <div className="text-4xl font-bold text-white">{data.nodes.length}</div>
                    <div className="text-green-400 text-sm mt-2 flex items-center"><span className="mr-1">▲</span> Live Count</div>
                </div>

                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg relative group">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-slate-400 text-sm uppercase font-bold">
                            {/* Show "Month-to-Date" if Current Month is selected (value 0) */}
                            Month-to-Date Cost
                        </h3>
                        <select
                            className="bg-slate-900 border border-slate-600 text-xs rounded p-1 text-slate-300 focus:border-blue-500 outline-none"
                            onChange={handleMonthChange}
                            defaultValue="0"
                        >
                            <option value="0">Current Month</option>
                            <option value="1">Last Month</option>
                            <option value="2">2 Months Ago</option>
                            <option value="3">3 Months Ago</option>
                            <option value="4">4 Months Ago</option>
                            <option value="5">5 Months Ago</option>
                        </select>
                    </div>
                    {actualTotalCost > 0 ? (
                        <>
                            <div className="text-4xl font-bold text-white">
                                {currencySymbol}{actualTotalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="text-slate-400 text-sm mt-2 flex justify-between items-center">
                                <span>Amortized Cost</span>
                                <button
                                    onClick={() => setIsCostModalOpen(true)}
                                    className="text-blue-400 text-xs font-bold bg-blue-400/10 px-2 py-1 rounded hover:bg-blue-400/20 transition-colors"
                                >
                                    View Details
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="animate-pulse h-10 w-32 bg-slate-700 rounded mt-1"></div>
                    )}
                </div>

                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                    <div className="flex justify-between items-start">
                        <h3 className="text-slate-400 text-sm uppercase font-bold mb-1">Security Score</h3>
                        <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                    {loadingAnalysis ? (
                        <div className="animate-pulse h-10 w-32 bg-slate-700 rounded mt-1"></div>
                    ) : (
                        <>
                            <div className={`text-4xl font-bold ${(securityData?.securityScore || 0) > 80 ? 'text-green-500' : (securityData?.securityScore || 0) > 50 ? 'text-amber-500' : 'text-red-500'}`}>
                                {securityData ? `${securityData.securityScore}%` : '-'}
                            </div>
                            <div className="text-slate-400 text-sm mt-2">
                                {securityData?.criticalRisksCount > 0 ? <span className="text-red-400">{securityData.criticalRisksCount} Critical Risks</span> : 'No critical risks detected'}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Cost Trend Chart */}
            {costTrendData.length > 0 && (
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg mb-8 h-80">
                    <h3 className="text-white font-semibold mb-4">Cost Trend (Amortized) - Click bar for monthly analysis</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={costTrendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={{ stroke: '#475569' }} />
                            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={{ stroke: '#475569' }} tickFormatter={(val) => `${currencySymbol}${val}`} />
                            <RechartsTooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                formatter={(value: number) => [`${currencySymbol}${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 'Cost']}
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            />
                            <Bar
                                dataKey="cost"
                                fill="#3b82f6"
                                radius={[4, 4, 0, 0]}
                                cursor="pointer"
                                onClick={(data: any) => {
                                    setMonthAnalysis({
                                        isOpen: true,
                                        month: data.name,
                                        cost: data.cost,
                                        currency: currencySymbol
                                    });
                                }}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg h-96">
                    <h3 className="text-white font-semibold mb-4">Resource Distribution</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg h-96">
                    <h3 className="text-white font-semibold mb-4">Resource Status</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="name" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                            <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]}>
                                {barData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={['#22c55e', '#94a3b8', '#ef4444', '#3b82f6'][index]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* AI Insights */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cost Insights */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-white font-semibold">Cost Insights</h3>
                        </div>
                        <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                    {loadingAnalysis ? (
                        <div className="space-y-2">
                            <div className="h-4 bg-slate-700 rounded w-3/4 animate-pulse"></div>
                            <div className="h-4 bg-slate-700 rounded w-1/2 animate-pulse"></div>
                        </div>
                    ) : costData ? (
                        <div className="space-y-4">
                            <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                                <div className="text-sm text-slate-400 mb-1">Potential Savings</div>
                                <div className="text-xl font-bold text-green-400">
                                    {currencySymbol}{costData.potentialSavings?.toLocaleString() || '0'}
                                </div>
                            </div>
                            <div className="text-sm text-slate-300 leading-relaxed">
                                {costData.summary || "No insights available."}
                            </div>
                        </div>
                    ) : (
                        <div className="text-slate-500 text-sm">Analysis unavailable</div>
                    )}
                </div>

                {/* Security Insights */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h3 className="text-white font-semibold">Security Insights</h3>
                    </div>
                    {loadingAnalysis ? (
                        <div className="space-y-2">
                            <div className="h-4 bg-slate-700 rounded w-3/4 animate-pulse"></div>
                            <div className="h-4 bg-slate-700 rounded w-1/2 animate-pulse"></div>
                        </div>
                    ) : securityData ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                                <span className="text-sm text-slate-400">Security Score</span>
                                <span className={`font-bold ${securityData.securityScore > 80 ? 'text-green-400' : 'text-amber-400'}`}>
                                    {securityData.securityScore}/100
                                </span>
                            </div>
                            <div className="text-sm text-slate-300 leading-relaxed">
                                {securityData.summary || "No insights available."}
                            </div>
                        </div>
                    ) : (
                        <div className="text-slate-500 text-sm">Analysis unavailable</div>
                    )}
                </div>
            </div>

            <CostTableModal
                isOpen={isCostModalOpen}
                onClose={() => setIsCostModalOpen(false)}
                items={data.rawCostItems || []}
                totalCost={actualTotalCost}
                currency={currencySymbol}
            />

            <MonthAnalysisModal
                isOpen={monthAnalysis.isOpen}
                onClose={() => setMonthAnalysis(prev => ({ ...prev, isOpen: false }))}
                month={monthAnalysis.month}
                cost={monthAnalysis.cost}
                currency={monthAnalysis.currency}
            />
        </div>
    );
};

export default Dashboard;