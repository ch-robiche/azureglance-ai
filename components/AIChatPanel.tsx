import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, TopologyData } from '../types';
import { analyzeInfrastructure } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface AIChatPanelProps {
    topologyData: TopologyData;
    onClose: () => void;
}

const AIChatPanel: React.FC<AIChatPanelProps> = ({ topologyData, onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '0', role: 'model', text: 'Hello! I am your Azure Cloud Architect assistant. Ask me anything about your current topology, security, or cost optimization.', timestamp: Date.now() }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const responseText = await analyzeInfrastructure(topologyData, userMsg.text);
            const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: Date.now() };
            setMessages(prev => [...prev, aiMsg]);
        } catch (e) {
            const errorMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: 'Sorry, I encountered an error connecting to the AI service.', timestamp: Date.now() };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="absolute right-0 top-16 bottom-0 w-96 bg-slate-900 text-slate-200 border-l border-slate-800 shadow-2xl z-20 flex flex-col">
            <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                <h3 className="font-semibold text-blue-400 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Azure Copilot
                </h3>
                <button onClick={onClose} className="text-slate-400 hover:text-white">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <div className="px-4 pb-2 border-b border-slate-800 bg-slate-900">
                <p className="text-xs text-slate-500">Powered by Gemini 2.5 Flash</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user'
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                            }`}>
                            {msg.role === 'model' ? (
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                                </div>
                            ) : (
                                msg.text
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800 text-slate-400 rounded-2xl rounded-tl-none px-4 py-3 text-xs border border-slate-700 animate-pulse">
                            Thinking...
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900">
                <div className="relative">
                    <input
                        type="text"
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-full py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="Ask about security, costs, or changes..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        disabled={loading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="absolute right-2 top-2 p-1.5 bg-blue-600 rounded-full text-white disabled:opacity-50 hover:bg-blue-500 transition"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIChatPanel;