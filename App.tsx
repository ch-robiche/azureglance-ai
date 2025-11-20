
import React, { useState, useCallback } from 'react';
import { TopologyData, TopologyNode, AzureConnectionConfig } from './types';
import { DEFAULT_TOPOLOGY, MOCK_ALERTS } from './constants';
import { generateTopologyFromPrompt } from './services/geminiService';
import { connectAndFetch } from './services/azureService';
import TopologyMap from './components/TopologyMap';
import DetailsPanel from './components/DetailsPanel';
import Dashboard from './components/Dashboard';
import AIChatPanel from './components/AIChatPanel';
import ConnectModal from './components/ConnectModal';
import DevConsole from './components/DevConsole';

enum View {
  DASHBOARD = 'dashboard',
  TOPOLOGY = 'topology',
  ALERTS = 'alerts' // Placeholder
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.TOPOLOGY);
  const [topologyData, setTopologyData] = useState<TopologyData>(DEFAULT_TOPOLOGY);
  const [selectedNode, setSelectedNode] = useState<TopologyNode | null>(null);
  const [showCopilot, setShowCopilot] = useState(true);
  const [promptInput, setPromptInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Connection State
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionConfig, setConnectionConfig] = useState<AzureConnectionConfig | null>(null);

  const handleGenerate = async () => {
    if (!promptInput.trim()) return;
    setIsGenerating(true);
    try {
      const newData = await generateTopologyFromPrompt(promptInput);
      setTopologyData(newData);
      setCurrentView(View.TOPOLOGY);
    } catch (err) {
      alert("Failed to generate topology. Please check your API key or try again.");
    } finally {
      setIsGenerating(false);
      setPromptInput('');
    }
  };

  const handleConnect = async (config: AzureConnectionConfig) => {
    try {
      const realData = await connectAndFetch(config, (updatedData) => {
        setTopologyData(updatedData);
      });
      setTopologyData(realData);
      setConnectionConfig(config);
      setIsConnected(true);
    } catch (error: any) {
      console.error(error);
      // Re-throw to let the Modal handle the UI error state
      throw error;
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setConnectionConfig(null);
    setTopologyData(DEFAULT_TOPOLOGY);
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-200 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-16 md:w-20 flex flex-col items-center py-6 bg-slate-900 border-r border-slate-800 z-10">
        <div className="mb-8 w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>

        <nav className="flex flex-col gap-6 w-full">
          <button
            onClick={() => setCurrentView(View.DASHBOARD)}
            className={`p-3 rounded-lg mx-2 transition-all ${currentView === View.DASHBOARD ? 'bg-blue-500/20 text-blue-400' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'}`}
            title="Dashboard"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          </button>

          <button
            onClick={() => setCurrentView(View.TOPOLOGY)}
            className={`p-3 rounded-lg mx-2 transition-all ${currentView === View.TOPOLOGY ? 'bg-blue-500/20 text-blue-400' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'}`}
            title="Topology Map"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </button>

          <div className="h-px w-8 bg-slate-800 mx-auto my-2"></div>

          <button
            onClick={() => setShowCopilot(!showCopilot)}
            className={`p-3 rounded-lg mx-2 transition-all ${showCopilot ? 'bg-purple-500/20 text-purple-400' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'}`}
            title="AI Copilot"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="font-bold text-xl text-white tracking-tight">Azure<span className="text-blue-500">Glance</span></h1>

            {isConnected ? (
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${topologyData.isSimulated ? 'bg-amber-900/20 border-amber-800' : 'bg-green-900/20 border-green-800'}`}>
                <span className={`w-2 h-2 rounded-full animate-pulse ${topologyData.isSimulated ? 'bg-amber-500' : 'bg-green-500'}`}></span>
                <span className={`text-xs font-medium ${topologyData.isSimulated ? 'text-amber-400' : 'text-green-400'}`}>
                  {topologyData.isSimulated ? 'Simulated Connection (CORS)' : 'Live Connection'}
                </span>
                <button onClick={handleDisconnect} className="ml-2 text-slate-500 hover:text-white" title="Disconnect">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
                <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                <span className="text-xs font-medium text-slate-400">Demo Mode</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 flex-1 justify-end">
            {!isConnected && (
              <button
                onClick={() => setIsConnectModalOpen(true)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-sm font-medium text-slate-300 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Connect Subscription
              </button>
            )}

            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Describe infrastructure to generate..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                disabled={isGenerating}
              />
              <div className="absolute left-3 top-2.5 text-slate-500">
                {isGenerating ? (
                  <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 relative overflow-hidden">
          {currentView === View.TOPOLOGY && (
            <TopologyMap
              data={topologyData}
              onNodeClick={setSelectedNode}
            />
          )}
          {currentView === View.DASHBOARD && (
            <Dashboard
              data={topologyData}
              onAnalysisUpdate={(analysis) => setTopologyData(prev => ({ ...prev, analysis }))}
            />
          )}

          {/* Floating Details Panel */}
          <DetailsPanel
            node={selectedNode}
            alerts={MOCK_ALERTS}
            onClose={() => setSelectedNode(null)}
          />
        </div>
      </main>

      {/* Right Panel - Copilot */}
      {showCopilot && (
        <div className="w-80 md:w-96 h-full shrink-0 transition-all duration-300 ease-in-out z-20 shadow-xl">
          <AIChatPanel topologyData={topologyData} />
        </div>
      )}

      {/* Modals */}
      <ConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onConnect={handleConnect}
      />

      {/* Dev Console */}
      <DevConsole />
    </div>
  );
};

export default App;
