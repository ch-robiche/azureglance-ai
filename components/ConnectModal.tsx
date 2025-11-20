
import React, { useState, useEffect } from 'react';
import { AzureConnectionConfig } from '../types';
import { api } from '../services/api';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (config: AzureConnectionConfig) => Promise<void>;
  token: string | null;
}

const ConnectModal: React.FC<ConnectModalProps> = ({ isOpen, onClose, onConnect, token }) => {
  const [config, setConfig] = useState<AzureConnectionConfig>({
    tenantId: '',
    clientId: '',
    clientSecret: '',
    subscriptionId: '',
    proxyUrl: ''
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedCredentials, setSavedCredentials] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && token) {
      api.getCredentials(token).then(setSavedCredentials).catch(console.error);
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  const handleSelectCredential = async (id: number) => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const cred = await api.getCredential(token, id);
      await onConnect({
        tenantId: cred.tenantId,
        clientId: cred.clientId,
        clientSecret: cred.clientSecret,
        subscriptionId: cred.subscriptionId,
        proxyUrl: config.proxyUrl
      });
      onClose();
    } catch (e) {
      setError('Failed to connect with selected credential');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simple validation
    if (!config.tenantId || !config.clientId || !config.clientSecret || !config.subscriptionId) {
      setError('All fields including Subscription ID are required');
      setLoading(false);
      return;
    }

    try {
      await onConnect(config);
      onClose();
    } catch (err: any) {
      console.error(err);
      let msg = 'Connection failed. ';

      if (err.message?.includes('Failed to fetch') || err.name === 'TypeError') {
        msg = 'Network Error: The Azure API blocked the request (CORS). If running locally, please configure a CORS Proxy in Advanced Settings. If deployed, ensure the API proxy function is working.';
      } else {
        msg += err.message || 'Check credentials.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900 shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" />
            </svg>
            Connect Azure Subscription
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          {savedCredentials.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase">Saved Connections</h3>
              <div className="space-y-2">
                {savedCredentials.map(cred => (
                  <button
                    key={cred.id}
                    onClick={() => handleSelectCredential(cred.id)}
                    disabled={loading}
                    className="w-full text-left p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex justify-between items-center group"
                  >
                    <div>
                      <div className="font-medium text-white">{cred.name}</div>
                      <div className="text-xs text-slate-500 font-mono">{cred.subscriptionId}</div>
                    </div>
                    <svg className="w-5 h-5 text-slate-500 group-hover:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                ))}
              </div>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
                <div className="relative flex justify-center"><span className="bg-slate-900 px-2 text-xs text-slate-500 uppercase">Or Connect Manually</span></div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-blue-950/40 border border-blue-900/60 rounded-lg p-4 text-sm text-blue-200 mb-4">
              <p className="font-semibold mb-1 text-blue-100">Required Permissions:</p>
              <p className="mb-2 opacity-90">Assign the <strong>Reader</strong> role to your Service Principal on the Subscription you wish to map.</p>
              <div className="flex items-start gap-2 mt-3 pt-3 border-t border-blue-900/60 text-xs opacity-75">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>We use <strong>Azure Resource Graph</strong>. Browser restrictions (CORS) may force a simulation unless a proxy is used.</span>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-500 mb-1">Tenant ID (Directory ID)</label>
              <input
                type="text"
                value={config.tenantId}
                onChange={e => setConfig({ ...config, tenantId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-blue-500 focus:outline-none text-sm font-mono transition-colors placeholder-slate-700"
                placeholder="e.g., 88888888-4444-4444-4444-121212121212"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-500 mb-1">Client ID (Application ID)</label>
              <input
                type="text"
                value={config.clientId}
                onChange={e => setConfig({ ...config, clientId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-blue-500 focus:outline-none text-sm font-mono transition-colors placeholder-slate-700"
                placeholder="e.g., 11111111-2222-3333-4444-555555555555"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-500 mb-1">Client Secret</label>
              <input
                type="password"
                value={config.clientSecret}
                onChange={e => setConfig({ ...config, clientSecret: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-blue-500 focus:outline-none text-sm font-mono transition-colors placeholder-slate-700"
                placeholder="•••••••••••••••••••••"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-500 mb-1">Subscription ID (Required)</label>
              <input
                type="text"
                value={config.subscriptionId}
                onChange={e => setConfig({ ...config, subscriptionId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-blue-500 focus:outline-none text-sm font-mono transition-colors placeholder-slate-700"
                placeholder="e.g., 23ee71f8-446d-47dc-a8c9-dd54792b1cf6"
              />
            </div>

            {/* Advanced Toggle */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-blue-400 transition-colors"
              >
                <svg className={`w-3 h-3 transform transition-transform ${showAdvanced ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                ADVANCED SETTINGS (CORS PROXY)
              </button>

              {showAdvanced && (
                <div className="mt-2 p-3 bg-slate-800/50 rounded border border-slate-800">
                  <label className="block text-xs uppercase font-bold text-slate-500 mb-1">Proxy URL (Optional for Deployment)</label>
                  <input
                    type="text"
                    value={config.proxyUrl || ''}
                    onChange={e => setConfig({ ...config, proxyUrl: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-blue-500 focus:outline-none text-sm font-mono transition-colors placeholder-slate-700"
                    placeholder="e.g. http://localhost:8080/"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    <strong>Deployed?</strong> Leave blank. We use an internal proxy.<br />
                    <strong>Local?</strong> Use a tool like <code>local-cors-proxy</code> to bypass browser blocks.<br />
                    Example: <code>lcp --proxyUrl https://login.microsoftonline.com</code>
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 text-red-400 text-sm bg-red-950/30 p-2 rounded border border-red-900/50">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{error}</span>
              </div>
            )}

            <div className="pt-4 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {loading ? 'Connecting...' : 'Connect Subscription'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConnectModal;
