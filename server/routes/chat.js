import { Router } from 'express';
import { chat, getProviders } from '../services/ai.js';

const router = Router();

// POST /api/chat - Send a chat message
router.post('/', async (req, res) => {
  try {
    const { messages, provider = 'openai', model = null } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const response = await chat(messages, provider, model);
    res.json(response);
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/chat/providers - List available AI providers
router.get('/providers', (req, res) => {
  res.json(getProviders());
});

export default router;
