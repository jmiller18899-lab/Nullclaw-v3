import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import chatRouter from './routes/chat.js';
import connectorsRouter from './routes/connectors.js';
import slackRouter from './routes/slack.js';
import { initSlackBot } from './services/slack.js';

// Catch unhandled rejections so they don't crash the server
process.on('unhandledRejection', (reason) => {
  console.warn('Unhandled rejection (non-fatal):', reason?.message || reason);
});

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/chat', chatRouter);
app.use('/api/connectors', connectorsRouter);
app.use('/api/slack', slackRouter);

app.listen(PORT, () => {
  console.log(`Nullclaw Mission Control server running on port ${PORT}`);

  // Initialize Slack bot after server is listening (non-blocking)
  if (process.env.SLACK_BOT_TOKEN && process.env.SLACK_APP_TOKEN) {
    initSlackBot().catch(err => {
      console.warn('Slack bot initialization skipped:', err.message);
    });
  }
});
