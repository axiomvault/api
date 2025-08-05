import express from 'express';
import cors from 'cors';
// import { createWallet, generateQRCode } from './walletManager.mjs';
import { generateQRCode } from './walletManager.mjs';
import { createWalletAndSave } from './walletSaver.mjs';
import { checkTransactionStatus } from './monitor.mjs';
import {
    sweepErcOrBep20Funds,
    sweepTrc20Funds
} from './utils.mjs';

const app = express();

// ✅ CORS CONFIGURATION
app.use(cors({
  origin: 'https://c09.8c6.mytemp.website',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ✅ HANDLE PREFLIGHT (OPTIONS) REQUESTS
app.options('*', cors());

app.use(express.json());

const deposits = {}; // In-memory DB

app.post('/walletManager', async (req, res) => {
    try {
        const { user_id, plan_id, network: rawNetwork, amount } = req.body;
        const network = rawNetwork.replace('-', '').toLowerCase(); // Normalize
        console.log('Requested network:', network);

        // Create and store wallet
        const { address, privateKey } = await createWalletAndSave(network, user_id, plan_id, amount);
        const qrPath = await generateQRCode(address, network, amount);

        deposits[address] = {
            user_id,
            plan_id,
            network,
            amount,
            status: 'waiting',
            privateKey,
            txHash: null,
            sweepTxHash: null,
        };

        res.json({ address, qr_code: qrPath, status: 'waiting' });
    } catch (err) {
        console.error('Error in /walletManager:', err.message);
        res.status(500).send('Internal Server Error');
    }
});

// ✅ Optional: Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
