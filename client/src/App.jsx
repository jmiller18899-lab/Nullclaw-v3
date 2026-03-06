import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import MCPConnectors from './components/MCPConnectors';
import SlackPanel from './components/SlackPanel';

const API_BASE = '/api';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [connectors, setConnectors] = useState([]);
  const [stats, setStats] = useState({ total: 0, connected: 0, disconnected: 0, error: 0 });
  const [serverOnline, setServerOnline] = useState(false);

  useEffect(() => {
    fetchHealth();
    fetchConnectors();
    const interval = setInterval(() => {
      fetchHealth();
      fetchConnectors();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  async function fetchHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      setServerOnline(res.ok);
    } catch {
      setServerOnline(false);
    }
  }

  async function fetchConnectors() {
    try {
      const [connRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/connectors`),
        fetch(`${API_BASE}/connectors/stats`),
      ]);
      if (connRes.ok) setConnectors(await connRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch {
      // Server may not be running
    }
  }

  const views = {
    dashboard: <Dashboard connectors={connectors} stats={stats} serverOnline={serverOnline} />,
    chat: <ChatInterface />,
    connectors: <MCPConnectors connectors={connectors} onRefresh={fetchConnectors} />,
    slack: <SlackPanel />,
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        serverOnline={serverOnline}
        stats={stats}
      />
      <main className="flex-1 overflow-y-auto">
        {views[activeView]}
      </main>
    </div>
  );
}
