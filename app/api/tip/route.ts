import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'

// USDC contract address and ABI for Avalanche Fuji Testnet
const USDC_ADDRESS = "0x5425890298aed601595a70AB815c96711a31Bc65"; // Fuji Testnet USDC
const USDC_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

// Use the provided Avalanche Fuji Testnet RPC URL
const provider = new ethers.JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc");

export async function POST(req: NextRequest) {
  const { recipientWallet, amount } = await req.json();
  if (!recipientWallet || !amount) {
    return NextResponse.json({ error: 'Missing recipientWallet or amount' }, { status: 400 });
  }

  const paymentProof = req.headers.get('x-payment-proof');
  if (!paymentProof) {
    return new NextResponse('Payment Required', {
      status: 402,
      headers: {
        'X-Payment-Address': recipientWallet,
        'X-Payment-Amount': `$${amount}`,
        'X-Payment-Asset': 'USDC',
      }
    });
  }

  try {
    // 1. Fetch the transaction
    const tx = await provider.getTransaction(paymentProof);
    if (!tx) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 400 });
    }

    // 2. Check if transaction is confirmed
    const receipt = await provider.getTransactionReceipt(paymentProof);
    if (!receipt || receipt.status !== 1) {
      return NextResponse.json({ error: 'Transaction not confirmed' }, { status: 400 });
    }

    // 3. Check if the transaction is a USDC transfer to the recipient for the correct amount
    const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);
    const logs = receipt.logs
      .map(log => {
        try {
          return usdc.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .filter((log): log is ethers.LogDescription => log !== null && log.name === "Transfer");

    const amountInWei = ethers.parseUnits(amount.toString(), 6); // USDC has 6 decimals
    const validTransfer = logs.some(log =>
      log.args.to.toLowerCase() === recipientWallet.toLowerCase() &&
      log.args.value.toString() === amountInWei.toString()
    );

    if (!validTransfer) {
      return NextResponse.json({ error: 'No valid USDC transfer found in transaction' }, { status: 400 });
    }

    // 4. All checks passed
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: 'Payment verification failed', details: err.message }, { status: 500 });
  }
} 