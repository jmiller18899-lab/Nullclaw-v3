import React, { useState, useEffect } from 'react';
import { Hash, Send, RefreshCw, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const API_BASE = '/api';

export default function SlackPanel() {
  const [status, setStatus] = useState(null);
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState('');
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
    fetchChannels();
  }, []);

  async function fetchStatus() {
    try {
      const res = await fetch(`${API_BASE}/slack/status`);
      if (res.ok) setStatus(await res.json());
    } catch {
      setStatus({ connected: false, error: 'Server unreachable' });
    } finally {
      setLoading(false);
    }
  }

  async function fetchChannels() {
    try {
      const res = await fetch(`${API_BASE}/slack/channels`);
      if (res.ok) setChannels(await res.json());
    } catch {
      // Server may not be running
    }
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!selectedChannel || !messageText.trim()) return;

    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch(`${API_BASE}/slack/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: selectedChannel, text: messageText }),
      });

      if (res.ok) {
        setSendResult({ ok: true, message: 'Message sent!' });
        setMessageText('');
      } else {
        const err = await res.json();
        setSendResult({ ok: false, message: err.error });
      }
    } catch (err) {
      setSendResult({ ok: false, message: err.message });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">Slack Integration</h2>
          <p className="text-gray-400 mt-1">Manage Slack bot connection and send messages</p>
        </div>
        <button
          onClick={() => { fetchStatus(); fetchChannels(); }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm hover:bg-gray-700 transition-colors"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Status Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Connection Status</h3>
        {loading ? (
          <Loader2 className="animate-spin text-gray-500" />
        ) : status ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {status.connected ? (
                <CheckCircle2 size={20} className="text-green-400" />
              ) : (
                <XCircle size={20} className="text-red-400" />
              )}
              <span className={status.connected ? 'text-green-400' : 'text-red-400'}>
                {status.connected ? 'Bot Connected (Socket Mode)' : 'Bot Disconnected'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <TokenStatus label="Bot Token" hasValue={status.hasToken} />
              <TokenStatus label="App Token" hasValue={status.hasAppToken} />
              <TokenStatus label="Signing Secret" hasValue={status.hasSigningSecret} />
            </div>
            {status.error && (
              <p className="text-sm text-red-400 mt-2">Error: {status.error}</p>
            )}
          </div>
        ) : (
          <p className="text-gray-500">Unable to fetch status</p>
        )}
      </div>

      {/* Send Message */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Send Message</h3>
        <form onSubmit={sendMessage} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Channel</label>
            {channels.length > 0 ? (
              <select
                value={selectedChannel}
                onChange={e => setSelectedChannel(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
              >
                <option value="">Select a channel...</option>
                {channels.map(ch => (
                  <option key={ch.id} value={ch.id}>
                    #{ch.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={selectedChannel}
                onChange={e => setSelectedChannel(e.target.value)}
                placeholder="Enter channel ID (e.g., C01234567)"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 placeholder:text-gray-500"
              />
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Message</label>
            <textarea
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              placeholder="Type your message..."
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 placeholder:text-gray-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={sending || !selectedChannel || !messageText.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-30 text-white rounded-lg text-sm transition-colors"
            >
              {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Send
            </button>
            {sendResult && (
              <span className={`text-sm ${sendResult.ok ? 'text-green-400' : 'text-red-400'}`}>
                {sendResult.message}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function TokenStatus({ label, hasValue }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${hasValue ? 'bg-green-500/5 border-green-500/20' : 'bg-gray-800 border-gray-700'}`}>
      <span className={`w-2 h-2 rounded-full ${hasValue ? 'bg-green-400' : 'bg-gray-600'}`} />
      <span className={`text-xs ${hasValue ? 'text-green-400' : 'text-gray-500'}`}>{label}</span>
    </div>
  );
}
