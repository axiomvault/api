import { createWallet } from '../../walletManager.mjs';

export default async function handler(req, res) {
  // ✅ Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // ✅ Handle OPTIONS (preflight) request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // ✅ Handle only POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { user_id, network, plan_id, amount } = req.body;

    if (!user_id || !network || !plan_id || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const wallet = await createWallet(user_id, network, plan_id, amount);
    return res.status(200).json(wallet);
  } catch (error) {
    console.error('walletManager error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
