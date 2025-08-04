import { getBalance } from '../monitor.mjs';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { address, amount, network } = req.query;
    const result = await getBalance(address, amount, network);
    res.status(200).json(result);
  } catch (err) {
    console.error('monitor error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
