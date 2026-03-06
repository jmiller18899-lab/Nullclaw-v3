import pkg from '@slack/bolt';
const { App } = pkg;
import { chat } from './ai.js';

let slackApp = null;
let slackStatus = { connected: false, error: null, channels: [] };

export async function initSlackBot() {
  try {
    const app = new App({
      token: process.env.SLACK_BOT_TOKEN,
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      socketMode: true,
      appToken: process.env.SLACK_APP_TOKEN,
    });

    // Respond to messages mentioning the bot
    app.message(async ({ message, say }) => {
      if (message.subtype) return;

      try {
        const response = await chat(
          [{ role: 'user', content: message.text }],
          'openai'
        );
        await say(response.content);
      } catch (err) {
        console.error('Slack message handler error:', err);
        await say('Sorry, I encountered an error processing your message.');
      }
    });

    // Handle app_mention events
    app.event('app_mention', async ({ event, say }) => {
      try {
        const text = event.text.replace(/<@[A-Z0-9]+>/g, '').trim();
        const response = await chat(
          [{ role: 'user', content: text }],
          'openai'
        );
        await say({ text: response.content, thread_ts: event.ts });
      } catch (err) {
        console.error('Slack mention handler error:', err);
        await say({ text: 'Sorry, I encountered an error.', thread_ts: event.ts });
      }
    });

    await app.start();
    slackApp = app;
    slackStatus = { connected: true, error: null };
    console.log('Slack bot connected via Socket Mode');
  } catch (err) {
    slackApp = null;
    slackStatus = { connected: false, error: err.message };
    console.warn('Slack bot initialization failed:', err.message);
  }
}

export function getSlackStatus() {
  return {
    connected: slackStatus.connected,
    error: slackStatus.error,
    hasToken: !!process.env.SLACK_BOT_TOKEN,
    hasAppToken: !!process.env.SLACK_APP_TOKEN,
    hasSigningSecret: !!process.env.SLACK_SIGNING_SECRET,
  };
}

export async function sendSlackMessage(channel, text) {
  if (!slackApp) throw new Error('Slack bot not initialized');

  const result = await slackApp.client.chat.postMessage({
    token: process.env.SLACK_BOT_TOKEN,
    channel,
    text,
  });

  return result;
}

export async function listSlackChannels() {
  if (!slackApp) throw new Error('Slack bot not initialized');

  const result = await slackApp.client.conversations.list({
    token: process.env.SLACK_BOT_TOKEN,
    types: 'public_channel,private_channel',
    limit: 100,
  });

  return result.channels.map(ch => ({
    id: ch.id,
    name: ch.name,
    isMember: ch.is_member,
  }));
}
