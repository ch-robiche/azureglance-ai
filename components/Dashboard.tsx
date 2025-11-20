import React from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { TopologyData, ResourceType } from '../types';

interface DashboardProps {
    data: TopologyData;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
    const [costData, setCostData] = React.useState<any>(null);
    const [securityData, setSecurityData] = React.useState<any>(null);
    const [loadingAnalysis, setLoadingAnalysis] = React.useState(false);

    React.useEffect(() => {
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
            } catch (e) {
                console.error("Failed to fetch dashboard analysis", e);
            } finally {
                setLoadingAnalysis(false);
            }
        };

        if (data.nodes.length > 0) {
            fetchAnalysis();
        }
    }, [data]);

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

    const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];
    const BAR_COLORS = { 'Running': '#22c55e', 'Stopped': '#94a3b8', 'Degraded': '#ef4444', 'OK': '#3b82f6' };

    return (
        <div className="h-full p-6 overflow-y-auto bg-slate-900">
            <h2 className="text-2xl font-bold text-white mb-6">Infrastructure Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                    <h3 className="text-slate-400 text-sm uppercase font-bold mb-1">Total Resources</h3>
                    <div className="text-4xl font-bold text-white">{data.nodes.length}</div>
                    <div className="text-green-400 text-sm mt-2 flex items-center">
                        <span className="mr-1">▲</span> Live Count
                    </div>
                </div>

                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg relative overflow-hidden">
                    <h3 className="text-slate-400 text-sm uppercase font-bold mb-1">Est. Monthly Cost</h3>
                    {loadingAnalysis ? (
                        <div className="animate-pulse h-10 w-32 bg-slate-700 rounded mt-1"></div>
                    ) : (
                        <>
                            <div className="text-4xl font-bold text-white">
                                {costData ? `$${costData.estimatedMonthlyCost.toLocaleString()}` : '$-'}
                            </div>
                            <div className="text-slate-400 text-sm mt-2">
                                {costData?.potentialSavings > 0 ? (
                                    <span className="text-green-400">Potential Savings: ${costData.potentialSavings.toLocaleString()}</span>
                                ) : (
                                    'Optimized'
                                )}
                            </div>
                        </>
                    )}
                </div>

                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg relative overflow-hidden">
                    <h3 className="text-slate-400 text-sm uppercase font-bold mb-1">Security Score</h3>
                    {loadingAnalysis ? (
                        <div className="animate-pulse h-10 w-32 bg-slate-700 rounded mt-1"></div>
                    ) : (
                        <>
                            <div className={`text-4xl font-bold ${(securityData?.securityScore || 0) > 80 ? 'text-green-500' :
                                (securityData?.securityScore || 0) > 50 ? 'text-amber-500' : 'text-red-500'
                                }`}>
                                {securityData ? `${securityData.securityScore}%` : '-'}
                            </div>
                            <div className="text-slate-400 text-sm mt-2">
                                {securityData?.criticalRisksCount > 0 ? (
                                    <span className="text-red-400">{securityData.criticalRisksCount} Critical Risks</span>
                                ) : (
                                    'No critical risks detected'
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

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
                                paddingAngle={5}
                                dataKey="value"
                                label
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                                ))}
                            </Pie>
                            <RechartsTooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg h-96">
                    <h3 className="text-white font-semibold mb-4">Health Status</h3>
                    <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} />
                            <YAxis stroke="#94a3b8" tickLine={false} />
                            <RechartsTooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {barData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={(BAR_COLORS as any)[entry.name]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* AI Insights Section */}
            {!loadingAnalysis && (costData || securityData) && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                    {costData && (
                        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                            <h3 className="text-blue-400 font-bold mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Cost Insights
                            </h3>
                            <p className="text-slate-300 text-sm mb-4">{costData.summary}</p>
                            {costData.topCostDrivers?.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Top Cost Drivers</h4>
                                    <ul className="list-disc list-inside text-sm text-slate-400 space-y-1">
                                        {costData.topCostDrivers.map((driver: string, i: number) => (
                                            <li key={i}>{driver}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {securityData && (
                        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                            <h3 className="text-blue-400 font-bold mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                Security Findings
                            </h3>
                            <p className="text-slate-300 text-sm mb-4">{securityData.summary}</p>
                            {securityData.topRisks?.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Critical Risks</h4>
                                    <ul className="list-disc list-inside text-sm text-red-400 space-y-1">
                                        {securityData.topRisks.map((risk: string, i: number) => (
                                            <li key={i}>{risk}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Dashboard;