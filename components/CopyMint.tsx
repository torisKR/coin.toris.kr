"use client";
import { useState } from "react";
import { trackEvent } from "@/utils/analytics";
import { MINT } from "@/utils/site";

export function CopyMint({
  mint = MINT,
  symbol = "PEBR",
}: {
  mint?: string;
  symbol?: string;
}) {
  const [status, setStatus] = useState("");
  async function copy() {
    try {
      await navigator.clipboard.writeText(mint);
      setStatus("Copied full mint address.");
      trackEvent("mint_copied", { coin_symbol: symbol });
    } catch {
      setStatus("Copy unavailable. Select the full address below to copy it.");
    }
  }
  return (
    <div className="mint-wrap">
      <div className="mint-box">
        <div>
          <span className="eyebrow">SOLANA MINT ADDRESS</span>
          <code>{mint}</code>
        </div>
        <button
          onClick={copy}
          className="copy-button"
          aria-label={`Copy full ${symbol} mint address`}
        >
          Copy <span aria-hidden="true">⧉</span>
        </button>
      </div>
      <p className="copy-status" role="status">
        {status || "Same name? Check the address. Always."}
      </p>
    </div>
  );
}
