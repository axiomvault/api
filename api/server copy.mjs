// server.js
const express = require('express');
const cors = require('cors');
const { createWallet, generateQRCode } = require('./walletManager.mjs');
const { checkTransactionStatus } = require('./monitor.mjs');

const app = express();
app.use(cors());
app.use(express.json());

const deposits = {}; // In-memory DB (use real DB in prod)

app.post('/walletManager', async (req, res) => {
  const { user_id, plan_id, network, amount } = req.body;
  const { address, privateKey } = await createWallet(network);
  const qrPath = await generateQRCode(address, network, amount);

  deposits[address] = { user_id, plan_id, network, amount, status: 'waiting', privateKey };

  res.json({ address, qr_code: qrPath, status: 'waiting' });
});

app.get('/monitor', async (req, res) => {
  const { address } = req.query;
  const deposit = deposits[address];

  if (!deposit) return res.status(404).json({ error: 'Not found' });

  const txStatus = await checkTransactionStatus(
  deposit.network,
  address,
  deposit.amount,
  deposit.privateKey // Used for sweeping
);

  if (txStatus.confirmed) deposit.status = 'confirmed';

  res.json({
    status: deposit.status,
    tx_hash: txStatus.txHash || null,
    confirmations: txStatus.confirmations || 0,
  });
});

app.listen(3000, () => console.log('Node backend running on port 3000'));
