import React from 'react';
import { Activity, Plug, Zap, AlertCircle, Brain, MessageSquare, Github, Sparkles } from 'lucide-react';

const iconMap = {
  Brain: Brain,
  MessageSquare: MessageSquare,
  Github: Github,
  Sparkles: Sparkles,
  Route: Zap,
};

function StatusBadge({ status }) {
  const styles = {
    connected: 'bg-green-500/10 text-green-400 border-green-500/20',
    disconnected: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    error: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.disconnected}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'connected' ? 'bg-green-400 pulse-dot' : status === 'error' ? 'bg-red-400' : 'bg-gray-500'}`} />
      {status}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

export default function Dashboard({ connectors, stats, serverOnline }) {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Mission Control</h2>
        <p className="text-gray-400 mt-1">System overview and connector status</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Activity}
          label="Server Status"
          value={serverOnline ? 'Online' : 'Offline'}
          color={serverOnline ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}
        />
        <StatCard
          icon={Plug}
          label="Total Connectors"
          value={stats.total}
          color="bg-blue-500/10 text-blue-400"
        />
        <StatCard
          icon={Zap}
          label="Active"
          value={stats.connected}
          color="bg-green-500/10 text-green-400"
        />
        <StatCard
          icon={AlertCircle}
          label="Inactive"
          value={stats.disconnected + stats.error}
          color="bg-yellow-500/10 text-yellow-400"
        />
      </div>

      {/* Connectors List */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl">
        <div className="p-5 border-b border-gray-800">
          <h3 className="text-lg font-semibold">Connectors</h3>
        </div>
        <div className="divide-y divide-gray-800">
          {connectors.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Plug size={32} className="mx-auto mb-2 opacity-50" />
              <p>No connectors loaded. Is the server running?</p>
            </div>
          ) : (
            connectors.map(connector => {
              const Icon = iconMap[connector.icon] || Plug;
              return (
                <div key={connector.id} className="flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                      <Icon size={18} className="text-gray-300" />
                    </div>
                    <div>
                      <p className="font-medium">{connector.name}</p>
                      <p className="text-sm text-gray-500">{connector.description}</p>
                    </div>
                  </div>
                  <StatusBadge status={connector.status} />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
