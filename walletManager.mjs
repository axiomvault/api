import { ethers } from 'ethers';
import { TronWeb } from 'tronweb'; // <-- FIXED HERE
import qrcode from 'qrcode';
import fs from 'fs';
import path from 'path';

const generateQRCode = async (address, network, amount) => {
  const uri =
    network === 'trc20'
      ? `tron:${address}?amount=${amount}`
      : `ethereum:${address}?value=${amount}`;

  const qrPath = path.join('./public/qrs', `${address}.png`);
  if (!fs.existsSync('./public/qrs')) {
    fs.mkdirSync('./public/qrs', { recursive: true });
  }

  await qrcode.toFile(qrPath, uri);
  return `/qrs/${address}.png`;
};

const createWallet = async (network) => {
  const normalized = network.toLowerCase().replace('-', '');

  if (normalized === 'trc20') {
    const tronWeb = new TronWeb({ fullHost: 'https://api.trongrid.io' });
    const acc = await tronWeb.createAccount();
    return { address: acc.address.base58, privateKey: acc.privateKey };
  } else {
    const wallet = ethers.Wallet.createRandom();
    return { address: wallet.address, privateKey: wallet.privateKey };
  }
};

export { createWallet, generateQRCode };
