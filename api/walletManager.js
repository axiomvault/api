const { createWallet } = require('../../walletManager');

module.exports = async (req, res) => {
  // ✅ Set CORS headers on all responses
  res.setHeader('Access-Control-Allow-Origin', 'https://c09.8c6.mytemp.website');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // ✅ Respond to preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // Send empty 200 response for preflight
  }

  // ✅ Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { user_id, network, plan_id, amount } = req.body;

    if (!user_id || !network || !plan_id || !amount) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    const wallet = await createWallet(network);

    return res.status(200).json({
      success: true,
      address: wallet.address,
      privateKey: wallet.privateKey
    });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};
