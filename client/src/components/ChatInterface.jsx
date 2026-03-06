import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ChevronDown, Loader2 } from 'lucide-react';

const API_BASE = '/api';

const PROVIDERS = [
  { id: 'openai', name: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'] },
  { id: 'openrouter', name: 'OpenRouter', models: ['anthropic/claude-3.5-sonnet', 'google/gemini-pro', 'meta-llama/llama-3.1-70b-instruct'] },
  { id: 'gemini', name: 'Gemini', models: ['gemini-2.0-flash-001', 'gemini-1.5-flash', 'gemini-1.5-pro'] },
];

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState('openai');
  const [model, setModel] = useState('gpt-4o-mini');
  const [showProviderMenu, setShowProviderMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleProviderChange(providerId) {
    setProvider(providerId);
    const p = PROVIDERS.find(p => p.id === providerId);
    if (p) setModel(p.models[0]);
    setShowProviderMenu(false);
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          provider,
          model,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Chat request failed');
      }

      const data = await res.json();
      setMessages([...updatedMessages, {
        role: 'assistant',
        content: data.content,
        model: data.model,
        provider: data.provider,
      }]);
    } catch (err) {
      setMessages([...updatedMessages, {
        role: 'assistant',
        content: `Error: ${err.message}`,
        isError: true,
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  const currentProvider = PROVIDERS.find(p => p.id === provider);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Chat</h2>
            <p className="text-xs text-gray-500">Talk to Nullclaw</p>
          </div>

          {/* Provider Selector */}
          <div className="relative">
            <button
              onClick={() => setShowProviderMenu(!showProviderMenu)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm hover:bg-gray-700 transition-colors"
            >
              <span className="text-gray-300">{currentProvider?.name}</span>
              <span className="text-gray-500">/</span>
              <span className="text-green-400 font-mono text-xs">{model}</span>
              <ChevronDown size={14} className="text-gray-500" />
            </button>

            {showProviderMenu && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                {PROVIDERS.map(p => (
                  <div key={p.id}>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-400 bg-gray-850 border-b border-gray-700">
                      {p.name}
                    </div>
                    {p.models.map(m => (
                      <button
                        key={m}
                        onClick={() => { handleProviderChange(p.id); setModel(m); setShowProviderMenu(false); }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors ${
                          provider === p.id && model === m ? 'text-green-400 bg-green-500/5' : 'text-gray-300'
                        }`}
                      >
                        <span className="font-mono text-xs">{m}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center mb-4">
              <Bot size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Nullclaw Ready</h3>
            <p className="text-gray-500 max-w-md">
              Your AI assistant is standing by. Ask anything — coding, analysis, creative tasks, or general questions.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot size={16} />
              </div>
            )}
            <div className={`max-w-2xl rounded-2xl px-4 py-3 ${
              msg.role === 'user'
                ? 'bg-green-600 text-white'
                : msg.isError
                ? 'bg-red-500/10 border border-red-500/20 text-red-300'
                : 'bg-gray-800 border border-gray-700 text-gray-100'
            }`}>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
              {msg.model && (
                <p className="text-xs mt-2 opacity-50 font-mono">{msg.provider}/{msg.model}</p>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0 mt-1">
                <User size={16} />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center flex-shrink-0">
              <Bot size={16} />
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3">
              <Loader2 size={16} className="animate-spin text-green-400" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <form onSubmit={sendMessage} className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Message Nullclaw..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 placeholder:text-gray-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-green-600 hover:bg-green-500 disabled:opacity-30 disabled:hover:bg-green-600 text-white rounded-xl px-4 py-3 transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
