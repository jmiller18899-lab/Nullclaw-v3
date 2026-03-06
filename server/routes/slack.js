import { Router } from 'express';
import { getSlackStatus, sendSlackMessage, listSlackChannels } from '../services/slack.js';

const router = Router();

// GET /api/slack/status - Get Slack connection status
router.get('/status', (req, res) => {
  res.json(getSlackStatus());
});

// GET /api/slack/channels - List Slack channels
router.get('/channels', async (req, res) => {
  try {
    const channels = await listSlackChannels();
    res.json(channels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/slack/send - Send a message to a Slack channel
router.post('/send', async (req, res) => {
  try {
    const { channel, text } = req.body;
    if (!channel || !text) {
      return res.status(400).json({ error: 'Channel and text are required' });
    }
    const result = await sendSlackMessage(channel, text);
    res.json({ ok: true, ts: result.ts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
