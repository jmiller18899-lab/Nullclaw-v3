import React from 'react';
import { LayoutDashboard, MessageSquare, Plug, Hash, Activity } from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'connectors', label: 'Connectors', icon: Plug },
  { id: 'slack', label: 'Slack', icon: Hash },
];

export default function Sidebar({ activeView, onNavigate, serverOnline, stats }) {
  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center font-bold text-lg">
            N
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Nullclaw</h1>
            <p className="text-xs text-gray-500">Mission Control</p>
          </div>
        </div>
      </div>

      {/* Server Status */}
      <div className="px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2 text-sm">
          <Activity size={14} className={serverOnline ? 'text-green-400' : 'text-red-400'} />
          <span className={serverOnline ? 'text-green-400' : 'text-red-400'}>
            {serverOnline ? 'Server Online' : 'Server Offline'}
          </span>
        </div>
        {stats.total > 0 && (
          <p className="text-xs text-gray-500 mt-1 ml-5">
            {stats.connected}/{stats.total} connectors active
          </p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <p className="text-xs text-gray-600 text-center">Nullclaw v3.0</p>
      </div>
    </aside>
  );
}
