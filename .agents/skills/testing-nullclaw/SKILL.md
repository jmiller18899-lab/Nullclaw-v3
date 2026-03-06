# Testing Nullclaw Mission Control

## Overview
Nullclaw Mission Control is a fullstack app (Express.js backend + React/Vite frontend) that provides a dashboard for managing AI chat providers, MCP connectors, and Slack integration.

## Devin Secrets Needed
- `OPENAI_API_KEY` - OpenAI API key (may have quota limits)
- `OPENROUTER_API_KEY` - OpenRouter API key (most reliable for testing)
- `GEMINI_API_KEY` - Google Gemini API key
- `SLACK_BOT_TOKEN` - Slack bot token (may be expired)
- `SLACK_SIGNING_SECRET` - Slack signing secret
- `SLACK_APP_TOKEN` - Slack app token (may be expired)
- `RAILWAY_TOKEN` - Railway API token for deployment

## Local Development

### Setup
```bash
cd /home/ubuntu/repos/nullclaw-v3
npm run install:all
# Copy .env.example to server/.env and fill in API keys
npm run dev  # starts both server (port 3001) and client (port 5173)
```

### Key Endpoints
- `GET /api/health` - Health check
- `GET /api/connectors` - List all connectors with status
- `GET /api/connectors/stats` - Connector statistics
- `POST /api/chat` - Send chat message (body: `{messages, provider, model}`)
- `GET /api/chat/providers` - List available providers
- `GET /api/slack/status` - Slack connection status

## Deployment (Railway)

The app is deployed to Railway via GitHub repo connection.
- Production URL: `https://nullclaw-app-production.up.railway.app`
- The Railway CLI may not work with user API tokens - use the Railway GraphQL API directly at `https://backboard.railway.app/graphql/v2` with Bearer token auth
- Key Railway API operations:
  - Get workspace: `{ me { workspaces { id name } } }`
  - Create project: `mutation { projectCreate(input: { name: "...", workspaceId: "..." }) { id } }`
  - Create service: `mutation { serviceCreate(input: { name: "...", projectId: "..." }) { id } }`
  - Connect repo: `mutation { serviceConnect(id: "...", input: { repo: "owner/repo", branch: "..." }) { id } }`
  - Generate domain: `mutation { serviceDomainCreate(input: { serviceId: "...", environmentId: "..." }) { domain } }`
  - Set env vars: `mutation { variableCollectionUpsert(input: { projectId: "...", environmentId: "...", serviceId: "...", variables: {...} }) }`
  - Check deployment: `{ deployments(input: { projectId: "...", serviceId: "...", environmentId: "..." }) { edges { node { id status } } } }`

## Testing Checklist

### Dashboard
1. Open the app URL
2. Verify sidebar shows "Nullclaw / Mission Control" branding
3. Verify "Server Online" indicator is green
4. Verify stat cards show correct values (Total Connectors, Active, Inactive)
5. Verify connectors list shows all 5 connectors with correct status badges

### Chat
1. Click "Chat" in sidebar
2. Verify "Nullclaw Ready" placeholder and provider selector
3. Open provider dropdown - should show OpenAI, OpenRouter, Gemini with models
4. Select OpenRouter / anthropic/claude-3.5-sonnet (most reliable)
5. Send a test message and verify response with model attribution

### Connectors
1. Click "Connectors" in sidebar
2. Verify AI Providers section shows OpenAI, OpenRouter, Gemini as "Connected"
3. Verify Integrations section shows Slack and GitHub with appropriate status

### Slack
1. Click "Slack" in sidebar
2. Verify disconnected status shown (tokens may be expired)

## Known Issues
- OpenAI API keys might hit quota limits (429 errors) - use OpenRouter as fallback
- Slack tokens expire/get revoked - the app handles this gracefully without crashing
- Gemini model names change over time - if `gemini-2.0-flash` stops working, try `gemini-2.0-flash-001` or check Google's latest model list
- The server uses `process.on('unhandledRejection')` to catch Slack connection failures without crashing
- For production, the Express server serves the built frontend from `client/dist` via static file serving
