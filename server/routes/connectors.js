import { Router } from 'express';
import { getAllConnectors, getConnector, getConnectorStats } from '../services/connectors.js';

const router = Router();

// GET /api/connectors - List all connectors
router.get('/', (req, res) => {
  res.json(getAllConnectors());
});

// GET /api/connectors/stats - Get connector stats
router.get('/stats', (req, res) => {
  res.json(getConnectorStats());
});

// GET /api/connectors/:id - Get a specific connector
router.get('/:id', (req, res) => {
  const connector = getConnector(req.params.id);
  if (!connector) {
    return res.status(404).json({ error: 'Connector not found' });
  }
  res.json(connector);
});

export default router;
