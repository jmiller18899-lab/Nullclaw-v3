import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Provider configurations
const providers = {
  openai: {
    name: 'OpenAI',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
    defaultModel: 'gpt-4o-mini',
  },
  openrouter: {
    name: 'OpenRouter',
    models: ['anthropic/claude-3.5-sonnet', 'google/gemini-pro', 'meta-llama/llama-3.1-70b-instruct'],
    defaultModel: 'anthropic/claude-3.5-sonnet',
  },
  gemini: {
    name: 'Gemini',
    models: ['gemini-2.0-flash-001', 'gemini-1.5-flash', 'gemini-1.5-pro'],
    defaultModel: 'gemini-2.0-flash-001',
  },
};

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function getOpenRouterClient() {
  if (!process.env.OPENROUTER_API_KEY) return null;
  return new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
  });
}

function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) return null;
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

const SYSTEM_PROMPT = `You are Nullclaw, an advanced AI assistant operating from Mission Control. You are helpful, precise, and capable. You assist users with a wide range of tasks including coding, analysis, creative work, and general questions. Be concise but thorough.`;

export async function chat(messages, provider = 'openai', model = null) {
  const providerConfig = providers[provider];
  if (!providerConfig) {
    throw new Error(`Unknown provider: ${provider}`);
  }

  const selectedModel = model || providerConfig.defaultModel;

  if (provider === 'gemini') {
    return chatWithGemini(messages, selectedModel);
  }

  // OpenAI-compatible providers (OpenAI, OpenRouter)
  const client = provider === 'openrouter' ? getOpenRouterClient() : getOpenAIClient();
  if (!client) {
    throw new Error(`${providerConfig.name} API key not configured`);
  }

  const formattedMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages.map(m => ({ role: m.role, content: m.content })),
  ];

  const response = await client.chat.completions.create({
    model: selectedModel,
    messages: formattedMessages,
    max_tokens: 2048,
    temperature: 0.7,
  });

  return {
    content: response.choices[0].message.content,
    model: selectedModel,
    provider: provider,
    usage: response.usage,
  };
}

async function chatWithGemini(messages, model) {
  const client = getGeminiClient();
  if (!client) {
    throw new Error('Gemini API key not configured');
  }

  const genModel = client.getGenerativeModel({
    model,
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
  });

  const history = messages.slice(0, -1).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const chatSession = genModel.startChat({ history });

  const lastMessage = messages[messages.length - 1];
  const result = await chatSession.sendMessage(lastMessage.content);

  return {
    content: result.response.text(),
    model,
    provider: 'gemini',
    usage: null,
  };
}

export function getProviders() {
  const available = {};
  for (const [key, config] of Object.entries(providers)) {
    let connected = false;
    if (key === 'openai') connected = !!process.env.OPENAI_API_KEY;
    if (key === 'openrouter') connected = !!process.env.OPENROUTER_API_KEY;
    if (key === 'gemini') connected = !!process.env.GEMINI_API_KEY;
    available[key] = { ...config, connected };
  }
  return available;
}
