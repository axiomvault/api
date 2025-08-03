import { ethers } from 'ethers';
import TronWeb from 'tronweb';

// Replace with environment variables in production
const MAIN_WALLETS = {
  erc20: '0x3a7159f8a32d6d3401ffa506592638b33724e07d',
  bep20: '0x3a7159f8a32d6d3401ffa506592638b33724e07d',
  trc20: 'TFbJZMGiVP6agCSzu6LRMiNdk9D3aMjDw2',
};

const USDT_CONTRACTS = {
  erc20: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  bep20: '0x55d398326f99059fF775485246999027B3197955',
  trc20: 'TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj',
};

const sweepErcOrBep20Funds = async (network, fromPrivateKey, amountUSDT) => {
  const provider = new ethers.JsonRpcProvider(
    network === 'erc20'
      ? 'https://mainnet.infura.io/v3/c62df08267f24d1993ae7c57ef5bc5cf'
      : 'https://bsc-dataseed.binance.org/'
  );

  const wallet = new ethers.Wallet(fromPrivateKey, provider);
  const contract = new ethers.Contract(
    USDT_CONTRACTS[network],
    ['function transfer(address to, uint256 amount) returns (bool)'],
    wallet
  );

  const tx = await contract.transfer(
    MAIN_WALLETS[network],
    ethers.parseUnits(String(amountUSDT), 6),
    { gasLimit: 100000 }
  );

  await tx.wait();
  return tx.hash;
};

const sweepTrc20Funds = async (fromAddress, fromPrivateKey, amountUSDT) => {
  const tronWeb = new TronWeb({ fullHost: 'https://api.trongrid.io' });
  tronWeb.setPrivateKey(fromPrivateKey);

  const amount = amountUSDT * 1e6;
  const contractAddress = USDT_CONTRACTS.trc20;

  const tx = await tronWeb.transactionBuilder.triggerSmartContract(
    contractAddress,
    'transfer(address,uint256)',
    {},
    [
      { type: 'address', value: MAIN_WALLETS.trc20 },
      { type: 'uint256', value: amount },
    ],
    fromAddress
  );

  if (!tx.result || !tx.result.result) {
    throw new Error('TRC-20 transfer contract call failed');
  }

  const signedTx = await tronWeb.trx.sign(tx.transaction);
  const result = await tronWeb.trx.sendRawTransaction(signedTx);

  if (!result.result) {
    throw new Error('TRC-20 sweep transaction failed to broadcast');
  }

  return result.txid;
};


export {
  sweepErcOrBep20Funds,
  sweepTrc20Funds,
  USDT_CONTRACTS,
  MAIN_WALLETS
};
