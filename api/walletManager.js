// /api/walletManager.js
import { createWallet, generateQRCode } from '../../walletManager.mjs';
import { saveWallet } from '../../walletSaver.mjs';

export default async function handler(req, res) {
  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { user_id, network, plan_id, amount } = req.body;

    const wallet = await createWallet(network);
    const qrPath = await generateQRCode(wallet.address, network, amount);

    await saveWallet(wallet.address, wallet.privateKey, network, user_id, plan_id, amount);

    return res.status(200).json({
      address: wallet.address,
      qr: qrPath
    });
  } catch (error) {
    console.error('walletManager ERROR:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
