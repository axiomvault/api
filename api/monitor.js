// /api/monitor.js
import { checkAndSweep } from '../../monitor.mjs';

export default async function handler(req, res) {
  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { address, amount, network } = req.query;

    if (!address || !amount || !network) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    const result = await checkAndSweep(address, amount, network);
    return res.status(200).json(result);
  } catch (error) {
    console.error('monitor ERROR:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
