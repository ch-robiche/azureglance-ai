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
  const BAR_COLORS = {'Running': '#22c55e', 'Stopped': '#94a3b8', 'Degraded': '#ef4444', 'OK': '#3b82f6'};

  return (
    <div className="h-full p-6 overflow-y-auto bg-slate-900">
        <h2 className="text-2xl font-bold text-white mb-6">Infrastructure Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                <h3 className="text-slate-400 text-sm uppercase font-bold mb-1">Total Resources</h3>
                <div className="text-4xl font-bold text-white">{data.nodes.length}</div>
                <div className="text-green-400 text-sm mt-2 flex items-center">
                    <span className="mr-1">▲</span> 12% vs last month
                </div>
            </div>
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                <h3 className="text-slate-400 text-sm uppercase font-bold mb-1">Est. Monthly Cost</h3>
                <div className="text-4xl font-bold text-white">$2,450.30</div>
                <div className="text-slate-400 text-sm mt-2">Forecast: $2,800</div>
            </div>
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                <h3 className="text-slate-400 text-sm uppercase font-bold mb-1">Security Score</h3>
                <div className="text-4xl font-bold text-green-500">88%</div>
                <div className="text-slate-400 text-sm mt-2">3 High Priority Risks</div>
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
                        <Legend wrapperStyle={{ paddingTop: '20px' }}/>
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
                             cursor={{fill: 'rgba(255,255,255,0.05)'}}
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
    </div>
  );
};

export default Dashboard;