const { ethers } = require('ethers');
const TronWeb = require('tronweb');

async function createWallet(network) {
  const normalized = network.toLowerCase().replace('-', '');
  
  if (normalized === 'trc20') {
    const tronWeb = new TronWeb({ fullHost: 'https://api.trongrid.io' });
    const acc = await tronWeb.createAccount();
    return {
      address: acc.address.base58,
      privateKey: acc.privateKey
    };
  } else {
    const wallet = ethers.Wallet.createRandom();
    return {
      address: wallet.address,
      privateKey: wallet.privateKey
    };
  }
}

module.exports = {
  createWallet
};
