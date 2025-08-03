import express from 'express';
import cors from 'cors';
// import { createWallet, generateQRCode } from './walletManager.mjs';
import { generateQRCode } from './walletManager.mjs';
import { createWalletAndSave } from './walletSaver.mjs'; // <-- use the wrapper
import { checkTransactionStatus } from './monitor.mjs';
import {
    sweepErcOrBep20Funds,
    sweepTrc20Funds
} from './utils.mjs';

const app = express();
app.use(cors());
app.use(express.json());

const deposits = {}; // In-memory DB

app.post('/walletManager', async(req, res) => {
    try {
        const { user_id, plan_id, network: rawNetwork, amount } = req.body;
        const network = rawNetwork.replace('-', '').toLowerCase(); // Normalize
        console.log('Requested network:', network);

        // const { address, privateKey } = await createWallet(network);
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
        res.status(500).send('Internal Server Error: ' + err.message);
    }
});

app.get('/monitor', async(req, res) => {
    try {
        const { address, amount, network: rawNetwork } = req.query;
        const network = rawNetwork.replace('-', '').toLowerCase();

        const deposit = deposits[address] || {
            network,
            amount,
            privateKey: null,
            status: 'waiting',
        };

        if (!network || !deposit.privateKey) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        if (parseFloat(deposit.amount) !== parseFloat(amount)) {
            console.warn('Amount mismatch:', deposit.amount, '!=', amount);
            return res.status(400).json({ error: 'Mismatched amount' });
        }

        // Check transaction confirmation
        const txStatus = await checkTransactionStatus(network, address, amount);
        if (txStatus.confirmed && deposit.status !== 'confirmed') {
            deposit.status = 'confirmed';
            deposit.txHash = txStatus.txHash;

            console.log(`✅ Confirmed deposit for ${address}, sweeping to master...`);

            // Sweep the funds to master wallet
            let sweepTx;
            if (network === 'trc20') {
                sweepTx = await sweepTrc20Funds(address, deposit.privateKey, amount);
            } else {
                sweepTx = await sweepErcOrBep20Funds(network, address, deposit.privateKey, amount);
            }

            deposit.sweepTxHash = sweepTx;
            console.log(`💸 Sweep TX hash: ${sweepTx}`);
        }

        res.json({
            status: deposit.status,
            tx_hash: deposit.txHash,
            sweep_tx: deposit.sweepTxHash || null,
            confirmations: txStatus.confirmations || 0,
        });
    } catch (err) {
        console.error('Error in /monitor:', err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

app.listen(3000, () => console.log('🚀 Node backend running on port 3000'));