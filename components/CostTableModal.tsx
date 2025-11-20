import React, { useState } from 'react';
import { CostItem } from '../types';

interface CostTableModalProps {
    isOpen: boolean;
    onClose: () => void;
    items: CostItem[];
    totalCost: number;
    currency: string;
}

const CostTableModal: React.FC<CostTableModalProps> = ({ isOpen, onClose, items, totalCost, currency }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<'cost' | 'name' | 'type'>('cost');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    if (!isOpen) return null;

    // Filter items
    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort items
    const sortedItems = [...filteredItems].sort((a, b) => {
        if (sortField === 'cost') {
            return sortDirection === 'asc' ? a.cost - b.cost : b.cost - a.cost;
        }
        const valA = a[sortField].toLowerCase();
        const valB = b[sortField].toLowerCase();
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const handleSort = (field: 'cost' | 'name' | 'type') => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection(field === 'cost' ? 'desc' : 'asc');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">

                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900 rounded-t-xl">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <span className="text-green-400">$</span> Cost Details
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">
                            Showing {filteredItems.length} resources | Total: <span className="text-white font-bold">{currency}{totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 bg-slate-800/50 border-b border-slate-800">
                    <div className="relative">
                        <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search resources by name, type or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-800 sticky top-0 z-10">
                            <tr>
                                <th
                                    className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white"
                                    onClick={() => handleSort('name')}
                                >
                                    Resource Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white"
                                    onClick={() => handleSort('type')}
                                >
                                    Type {sortField === 'type' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white text-right"
                                    onClick={() => handleSort('cost')}
                                >
                                    Cost {sortField === 'cost' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {sortedItems.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-800/50 transition-colors group">
                                    <td className="p-4">
                                        <div className="font-medium text-white">{item.name}</div>
                                        <div className="text-xs text-slate-500 truncate max-w-md group-hover:text-slate-400" title={item.id}>
                                            {item.id}
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-slate-300">
                                        {item.type}
                                    </td>
                                    <td className="p-4 text-right font-mono text-white">
                                        {currency}{item.cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                            {sortedItems.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="p-8 text-center text-slate-500">
                                        No resources found matching "{searchTerm}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-800 bg-slate-900 text-xs text-slate-500 text-center">
                    Data sourced from Azure Cost Management
                </div>
            </div>
        </div >
    );
};

export default CostTableModal;
