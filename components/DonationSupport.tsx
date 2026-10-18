"use client";

import { useState } from "react";

const wallets = [
  { network: "Ethereum", symbol: "ETH", address: "0x77a7A491f86C677e0D398a92C8932aF760ED8d50" },
  { network: "Solana", symbol: "SOL", address: "EXBH2LjkJGRa3Nv2uGgtBX8afr4p4Tz1Judmdj6dQryy" },
  { network: "TRON", symbol: "TRON", address: "TYV5q8dFnDGnE3okHJbwQxsWYcg4GH8Gn7" },
] as const;

export function DonationSupport() {
  const [status, setStatus] = useState("");

  async function copyAddress(symbol: string, address: string) {
    try {
      await navigator.clipboard.writeText(address);
      setStatus(`${symbol} donation address copied.`);
    } catch {
      setStatus("Copy unavailable. Select the full address to copy it.");
    }
  }

  return (
    <section className="donation-support" aria-labelledby="donation-title">
      <div className="donation-heading">
        <h2 id="donation-title">Support Toris Coin</h2>
        <p>
          Enjoying the collection? Please consider a donation to help us keep
          creating characters and free tools.
        </p>
      </div>
      <ul className="donation-wallets">
        {wallets.map(({ network, symbol, address }) => (
          <li key={symbol}>
            <div className="donation-wallet-heading">
              <span>{network} <small>{symbol}</small></span>
              <button
                type="button"
                aria-label={`Copy ${network} donation address`}
                onClick={() => copyAddress(symbol, address)}
              >
                Copy <span aria-hidden="true">⧉</span>
              </button>
            </div>
            <code>{address}</code>
          </li>
        ))}
      </ul>
      <p className="donation-status" role="status" aria-live="polite">{status}</p>
    </section>
  );
}
