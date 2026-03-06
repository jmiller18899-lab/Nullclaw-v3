import React from 'react';
import { Plug, Brain, MessageSquare, Github, Sparkles, Zap, RefreshCw, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

const iconMap = {
  Brain: Brain,
  MessageSquare: MessageSquare,
  Github: Github,
  Sparkles: Sparkles,
  Route: Zap,
};

const statusConfig = {
  connected: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', label: 'Connected' },
  disconnected: { icon: XCircle, color: 'text-gray-500', bg: 'bg-gray-500/10 border-gray-500/20', label: 'Disconnected' },
  error: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', label: 'Error' },
};

export default function MCPConnectors({ connectors, onRefresh }) {
  const aiConnectors = connectors.filter(c => c.type === 'ai-provider');
  const integrationConnectors = connectors.filter(c => c.type !== 'ai-provider');

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">MCP Connectors</h2>
          <p className="text-gray-400 mt-1">Manage your integrations and AI providers</p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm hover:bg-gray-700 transition-colors"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* AI Providers */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">AI Providers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {aiConnectors.map(connector => (
            <ConnectorCard key={connector.id} connector={connector} />
          ))}
        </div>
      </div>

      {/* Integrations */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Integrations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrationConnectors.map(connector => (
            <ConnectorCard key={connector.id} connector={connector} />
          ))}
        </div>
      </div>

      {connectors.length === 0 && (
        <div className="text-center py-16">
          <Plug size={48} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 text-lg">No connectors available</p>
          <p className="text-gray-600 text-sm mt-1">Make sure the backend server is running</p>
        </div>
      )}
    </div>
  );
}

function ConnectorCard({ connector }) {
  const Icon = iconMap[connector.icon] || Plug;
  const status = statusConfig[connector.status] || statusConfig.disconnected;
  const StatusIcon = status.icon;

  return (
    <div className={`bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors`}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center">
          <Icon size={22} className="text-gray-300" />
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.bg}`}>
          <StatusIcon size={12} className={status.color} />
          <span className={status.color}>{status.label}</span>
        </div>
      </div>

      <h4 className="font-semibold text-base mb-1">{connector.name}</h4>
      <p className="text-sm text-gray-500 mb-3">{connector.description}</p>

      {connector.details?.models && (
        <div className="mt-3 pt-3 border-t border-gray-800">
          <p className="text-xs text-gray-500 mb-2">Available Models</p>
          <div className="flex flex-wrap gap-1">
            {connector.details.models.map(m => (
              <span key={m} className="px-2 py-0.5 bg-gray-800 rounded text-xs font-mono text-gray-400">
                {m}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
