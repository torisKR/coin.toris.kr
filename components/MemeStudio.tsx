"use client";

import Image from "next/image";
import { startTransition, useEffect, useMemo, useState } from "react";
import { coins, findCoin, type CoinSymbol } from "@/utils/coins";
import { SITE_URL } from "@/utils/site";
import { trackEvent } from "@/utils/analytics";

const legacyTemplates = {
  chat: ["ME OPENING THE GROUP CHAT", "I BROUGHT A CHARACTER."],
  coffee: ["BIG PLANS TODAY", "FIRST, COFFEE."],
  work: ["WHEN THE MEETING COULD BE A MEME", "LET ME COOK."],
} as const;

const poseNames = ["Turn", "Front", "Action"] as const;

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines = 2,
) {
  const words = text.trim().toUpperCase().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  if (lines.length <= maxLines) return lines;
  return [lines.slice(0, -1).join(" "), lines.at(-1)!];
}

export function MemeStudio({
  initialCoin = "PEBR",
  initialTemplate = "chat",
}: {
  initialCoin?: CoinSymbol;
  initialTemplate?: string;
}) {
  const initialCopy =
    legacyTemplates[initialTemplate as keyof typeof legacyTemplates] ??
    legacyTemplates.chat;
  const [symbol, setSymbol] = useState<CoinSymbol>(initialCoin);
  const [pose, setPose] = useState(1);
  const [background, setBackground] = useState(0);
  const [top, setTop] = useState<string>(initialCopy[0]);
  const [bottom, setBottom] = useState<string>(initialCopy[1]);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const coin = findCoin(symbol)!;
  const backdrop = coin.studioBackgrounds[background];
  const previewBackground = `linear-gradient(145deg, ${backdrop.colors[0]}, ${backdrop.colors[1]})`;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedCoin = params.get("coin");
    const template = params.get("template");
    startTransition(() => {
      if (requestedCoin && findCoin(requestedCoin)) {
        setSymbol(requestedCoin as CoinSymbol);
      }
      if (template && Object.hasOwn(legacyTemplates, template)) {
        const copy = legacyTemplates[template as keyof typeof legacyTemplates];
        setTop(copy[0]);
        setBottom(copy[1]);
      }
    });
  }, []);

  function chooseCoin(next: CoinSymbol) {
    setSymbol(next);
    setPose(1);
    setBackground(0);
    setStatus("");
    const url = new URL(window.location.href);
    url.pathname = "/studio";
    url.search = "";
    url.searchParams.set("coin", next);
    window.history.replaceState({}, "", url);
    trackEvent("coin_selected", {
      coin_symbol: next,
      selection_method: "studio",
    });
  }

  async function download() {
    setBusy(true);
    setStatus(`Preparing the ${coin.symbol} PNG.`);
    try {
      await document.fonts.ready;
      const art = new window.Image();
      art.src = coin.poses[pose];
      await art.decode();
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");
      const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
      gradient.addColorStop(0, backdrop.colors[0]);
      gradient.addColorStop(1, backdrop.colors[1]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1080, 1080);
      const size = 820;
      const ratio = Math.min(size / art.width, size / art.height);
      const width = art.width * ratio;
      const height = art.height * ratio;
      ctx.drawImage(art, (1080 - width) / 2, 130 + (760 - height) / 2, width, height);

      const font = getComputedStyle(document.body).fontFamily;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "rgba(10, 18, 16, 0.86)";
      ctx.fillStyle = "#f8faf4";
      const drawCaption = (text: string, y: number) => {
        let fontSize = 64;
        let lines: string[] = [];
        do {
          ctx.font = `850 ${fontSize}px ${font}`;
          lines = wrapCanvasText(ctx, text, 900);
          if (lines.length <= 2 && lines.every((line) => ctx.measureText(line).width <= 900)) break;
          fontSize -= 3;
        } while (fontSize > 34);
        const lineHeight = fontSize * 1.06;
        const start = y - ((lines.length - 1) * lineHeight) / 2;
        lines.forEach((line, index) => {
          const lineY = start + index * lineHeight;
          ctx.lineWidth = Math.max(8, fontSize * 0.15);
          ctx.strokeText(line, 540, lineY, 930);
          ctx.fillText(line, 540, lineY, 930);
        });
      };
      drawCaption(top, 82);
      drawCaption(bottom, 954);
      ctx.font = `650 20px ${font}`;
      ctx.fillStyle = "rgba(248,250,244,.82)";
      ctx.fillText(`TORIS COIN / $${coin.symbol}`, 540, 1040);

      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (value) => (value ? resolve(value) : reject(new Error("PNG export failed"))),
          "image/png",
        ),
      );
      const href = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download = `toris-coin-${coin.symbol.toLowerCase()}-meme.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(href), 10_000);
      trackEvent("meme_downloaded", {
        coin_symbol: coin.symbol,
        file_format: "png",
      });
      setStatus("PNG saved. Attach it to your X draft when you are ready.");
    } catch {
      setStatus("The PNG could not be created in this browser. Try again after the pose image finishes loading.");
    } finally {
      setBusy(false);
    }
  }

  const shareUrl = useMemo(() => {
    const text = `${top}\n${bottom}\n$${coin.symbol} by Toris Coin`;
    const url = `${SITE_URL}/studio?coin=${coin.symbol}`;
    return `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  }, [bottom, coin.symbol, top]);

  return (
    <div className="universal-studio">
      <div className="studio-live-preview">
        <div className="studio-canvas" style={{ background: previewBackground }} role="img" aria-label={`${coin.name} meme preview. ${top}. ${bottom}.`}>
          <strong className="studio-live-caption">{top}</strong>
          <Image
            src={coin.poses[pose].replace(".png", ".webp")}
            alt=""
            fill
            priority
            sizes="(max-width: 767px) 94vw, 48vw"
          />
          <strong className="studio-live-caption studio-live-caption-bottom">{bottom}</strong>
          <span>TORIS COIN / ${coin.symbol}</span>
        </div>
      </div>

      <div className="studio-editor">
        <fieldset>
          <legend>Choose a coin</legend>
          <div className="studio-coin-options">
            {coins.map((item) => (
              <button key={item.symbol} type="button" aria-pressed={item.symbol === coin.symbol} onClick={() => chooseCoin(item.symbol)}>
                <Image src={item.image} alt="" width={48} height={48} />
                <span>{item.name}<small>${item.symbol}</small></span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Choose a pose</legend>
          <div className="studio-pose-options">
            {coin.poses.map((src, index) => (
              <button key={src} type="button" aria-pressed={pose === index} onClick={() => setPose(index)}>
                <Image src={src.replace(".png", ".webp")} alt="" width={96} height={96} />
                <span>{poseNames[index]}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Choose a background</legend>
          <div className="studio-background-options">
            {coin.studioBackgrounds.map((item, index) => (
              <button
                key={item.name}
                type="button"
                aria-pressed={background === index}
                onClick={() => setBackground(index)}
                style={{ background: `linear-gradient(135deg, ${item.colors[0]}, ${item.colors[1]})` }}
              >
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="studio-copy-fields">
          <label htmlFor="studio-top">Top line</label>
          <input id="studio-top" maxLength={72} value={top} onChange={(event) => setTop(event.target.value)} />
          <small>{top.length}/72</small>
          <label htmlFor="studio-bottom">Bottom line</label>
          <input id="studio-bottom" maxLength={72} value={bottom} onChange={(event) => setBottom(event.target.value)} />
          <small>{bottom.length}/72</small>
        </div>

        <div className="studio-export-actions">
          <button type="button" className="collection-button collection-button-dark" onClick={download} disabled={busy}>
            {busy ? "Creating PNG" : "Save 1080 PNG"} <span aria-hidden="true">↓</span>
          </button>
          <a
            className="collection-button studio-x-button"
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("meme_share_opened", { coin_symbol: coin.symbol, method: "x_draft" })}
          >
            Open X draft <span aria-hidden="true">↗</span>
          </a>
        </div>
        <p className="studio-status" role="status">
          {status || "Everything is created locally in your browser. Opening an X draft does not publish it."}
        </p>
      </div>
    </div>
  );
}
