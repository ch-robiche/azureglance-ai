import React, { useState, useEffect } from 'react';

interface LogEntry {
    timestamp: number;
    level: 'info' | 'warn' | 'error';
    message: string;
    data?: any;
}

const DevConsole: React.FC = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Intercept console.log, console.warn, console.error
        const originalLog = console.log;
        const originalWarn = console.warn;
        const originalError = console.error;

        console.log = (...args: any[]) => {
            originalLog(...args);
            setLogs(prev => [...prev, {
                timestamp: Date.now(),
                level: 'info' as const,
                message: args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')
            }].slice(-100)); // Keep last 100 logs
        };

        console.warn = (...args: any[]) => {
            originalWarn(...args);
            setLogs(prev => [...prev, {
                timestamp: Date.now(),
                level: 'warn' as const,
                message: args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')
            }].slice(-100));
        };

        console.error = (...args: any[]) => {
            originalError(...args);
            setLogs(prev => [...prev, {
                timestamp: Date.now(),
                level: 'error' as const,
                message: args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')
            }].slice(-100));
        };

        return () => {
            console.log = originalLog;
            console.warn = originalWarn;
            console.error = originalError;
        };
    }, []);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Dev Console
            </button>
        );
    }

    return (
        <div className="fixed bottom-0 right-0 w-full md:w-2/3 lg:w-1/2 h-96 bg-slate-950 border-t-2 border-blue-500 shadow-2xl z-50 flex flex-col">
            <div className="bg-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-700">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-white font-semibold">Dev Console</h3>
                    <span className="text-xs text-slate-500">({logs.length} logs)</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setLogs([])}
                        className="text-slate-400 hover:text-white text-sm px-2 py-1 rounded hover:bg-slate-800"
                    >
                        Clear
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-slate-400 hover:text-white"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs">
                {logs.length === 0 ? (
                    <div className="text-slate-500 text-center py-8">No logs yet...</div>
                ) : (
                    logs.map((log, idx) => (
                        <div
                            key={idx}
                            className={`mb-2 pb-2 border-b border-slate-800 ${log.level === 'error' ? 'text-red-400' :
                                log.level === 'warn' ? 'text-yellow-400' :
                                    'text-slate-300'
                                }`}
                        >
                            <div className="text-slate-500 text-[10px] mb-1">
                                {new Date(log.timestamp).toLocaleTimeString()}
                            </div>
                            <pre className="whitespace-pre-wrap break-words">{log.message}</pre>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DevConsole;
