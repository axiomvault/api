const { createWallet, generateQRCode } = require('../../walletManager');

module.exports = async (req, res) => {
  // --- Handle preflight (OPTIONS) request ---
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).end();
    return;
  }

  // --- CORS headers for actual request ---
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method Not Allowed' });
      return;
    }

    const { user_id, network, plan_id, amount } = req.body;

    if (!user_id || !network || !plan_id || !amount) {
      res.status(400).json({ error: 'Missing parameters' });
      return;
    }

    const wallet = await createWallet(network);
    const qrPath = await generateQRCode(wallet.address, network, amount);

    res.status(200).json({
      success: true,
      address: wallet.address,
      privateKey: wallet.privateKey,
      qrCodePath: qrPath
    });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
