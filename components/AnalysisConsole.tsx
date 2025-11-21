import React, { useEffect, useState, useRef } from 'react';

interface AnalysisConsoleProps {
    isOpen: boolean;
    onComplete: () => void;
    title: string;
}

const AnalysisConsole: React.FC<AnalysisConsoleProps> = ({ isOpen, onComplete, title }) => {
    const [logs, setLogs] = useState<string[]>([]);
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setLogs([`> Initializing ${title}...`]);
            // Simulate logs
            const steps = [
                "Loading topology data...",
                "Analyzing resource dependencies...",
                "Checking security configurations...",
                "Identifying cost anomalies...",
                "Generating recommendations...",
                "Finalizing report..."
            ];

            let i = 0;
            const interval = setInterval(() => {
                if (i < steps.length) {
                    setLogs(prev => [...prev, `> ${steps[i]}`]);
                    i++;
                } else {
                    clearInterval(interval);
                    setTimeout(onComplete, 800);
                }
            }, 600);

            return () => clearInterval(interval);
        } else {
            setLogs([]);
        }
    }, [isOpen]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-950 w-full max-w-2xl rounded-xl border border-slate-800 shadow-2xl overflow-hidden font-mono text-sm">
                <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="ml-2 text-slate-400 text-xs">dev_console — {title}</span>
                </div>
                <div className="p-6 h-64 overflow-y-auto text-green-400 space-y-1">
                    {logs.map((log, idx) => (
                        <div key={idx} className="opacity-90">{log}</div>
                    ))}
                    <div className="animate-pulse">_</div>
                    <div ref={endRef}></div>
                </div>
            </div>
        </div>
    );
};

export default AnalysisConsole;
