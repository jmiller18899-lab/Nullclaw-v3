import { getProviders } from './ai.js';
import { getSlackStatus } from './slack.js';

// Connector registry - tracks all available integrations
const connectorRegistry = {
  slack: {
    id: 'slack',
    name: 'Slack',
    type: 'communication',
    icon: 'MessageSquare',
    description: 'Send and receive messages via Slack workspace',
    configKeys: ['SLACK_BOT_TOKEN', 'SLACK_APP_TOKEN', 'SLACK_SIGNING_SECRET'],
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    type: 'ai-provider',
    icon: 'Brain',
    description: 'GPT-4o, GPT-4o-mini, GPT-3.5 Turbo',
    configKeys: ['OPENAI_API_KEY'],
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    type: 'ai-provider',
    icon: 'Route',
    description: 'Claude, Gemini Pro, Llama, and more via OpenRouter',
    configKeys: ['OPENROUTER_API_KEY'],
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    type: 'ai-provider',
    icon: 'Sparkles',
    description: 'Gemini 1.5 Flash, Gemini 1.5 Pro, Gemini 2.0 Flash',
    configKeys: ['GEMINI_API_KEY'],
  },
  github: {
    id: 'github',
    name: 'GitHub',
    type: 'development',
    icon: 'Github',
    description: 'Access repositories, issues, and pull requests',
    configKeys: ['GITHUB_PAT'],
  },
};

export function getAllConnectors() {
  const aiProviders = getProviders();
  const slackStatus = getSlackStatus();

  const connectors = Object.values(connectorRegistry).map(connector => {
    let status = 'disconnected';
    let details = {};

    if (connector.type === 'ai-provider' && aiProviders[connector.id]) {
      const provider = aiProviders[connector.id];
      status = provider.connected ? 'connected' : 'disconnected';
      details = { models: provider.models, defaultModel: provider.defaultModel };
    } else if (connector.id === 'slack') {
      status = slackStatus.connected ? 'connected' : slackStatus.hasToken ? 'error' : 'disconnected';
      details = slackStatus;
    } else if (connector.id === 'github') {
      status = process.env.GITHUB_PAT ? 'connected' : 'disconnected';
    }

    return { ...connector, status, details };
  });

  return connectors;
}

export function getConnector(id) {
  const all = getAllConnectors();
  return all.find(c => c.id === id) || null;
}

export function getConnectorStats() {
  const all = getAllConnectors();
  return {
    total: all.length,
    connected: all.filter(c => c.status === 'connected').length,
    disconnected: all.filter(c => c.status === 'disconnected').length,
    error: all.filter(c => c.status === 'error').length,
  };
}
