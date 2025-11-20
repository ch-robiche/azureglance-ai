import React from 'react';
import { TopologyNode, Alert } from '../types';
import { ICONS } from '../constants';

interface DetailsPanelProps {
  node: TopologyNode | null;
  alerts: Alert[];
  onClose: () => void;
}

const DetailsPanel: React.FC<DetailsPanelProps> = ({ node, alerts, onClose }) => {
  if (!node) return null;

  const nodeAlerts = alerts.filter(a => a.resourceId === node.id);

  return (
    <div className="absolute right-0 top-0 h-full w-80 bg-slate-800 border-l border-slate-700 shadow-2xl z-20 flex flex-col transform transition-transform duration-300 ease-in-out">
      <div className="p-4 border-b border-slate-700 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
           <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-blue-400">
               {ICONS[node.type]}
           </svg>
           Details
        </h2>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <div className="mb-6">
          <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Name</label>
          <div className="text-slate-200 font-medium truncate" title={node.name}>{node.name}</div>
        </div>

        <div className="mb-6">
          <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Resource ID</label>
          <div className="text-slate-300 text-sm break-all font-mono bg-slate-900 p-2 rounded mt-1">{node.id}</div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
                <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Type</label>
                <div className="text-slate-200 text-sm">{node.type}</div>
            </div>
            <div>
                <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Status</label>
                <div className={`text-sm font-bold ${
                    node.status === 'Running' ? 'text-green-400' :
                    node.status === 'Degraded' ? 'text-red-400' : 
                    'text-blue-400'
                }`}>{node.status}</div>
            </div>
            <div>
                <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Location</label>
                <div className="text-slate-200 text-sm">East US</div>
            </div>
            <div>
                <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Monthly Cost</label>
                <div className="text-slate-200 text-sm">$145.20</div>
            </div>
        </div>

        <div className="mb-6">
          <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2 block">Active Alerts</label>
          {nodeAlerts.length === 0 ? (
            <div className="text-slate-500 text-sm italic">No active alerts.</div>
          ) : (
            <div className="space-y-2">
              {nodeAlerts.map(alert => (
                <div key={alert.id} className={`p-3 rounded border ${
                    alert.severity === 'Critical' ? 'bg-red-900/20 border-red-800 text-red-200' :
                    alert.severity === 'Warning' ? 'bg-amber-900/20 border-amber-800 text-amber-200' :
                    'bg-blue-900/20 border-blue-800 text-blue-200'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                     <span className="text-xs font-bold">{alert.severity}</span>
                     <span className="text-[10px] opacity-70">{alert.date.split(' ')[1]}</span>
                  </div>
                  <p className="text-xs">{alert.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-700">
            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded text-sm font-medium transition-colors">
                View in Azure Portal
            </button>
        </div>
      </div>
    </div>
  );
};

export default DetailsPanel;