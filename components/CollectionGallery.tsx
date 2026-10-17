"use client";
import { trackEvent } from "@/utils/analytics";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { coins, coinPath } from "@/utils/coins";
import { Arrow } from "./CollectionChrome";

export function CollectionGallery() {
  const [selected, setSelected] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const [interactive, setInteractive] = useState(false);
  const coin = coins[selected];
  useEffect(() => {
    if (!matchMedia("(min-width: 768px)").matches) return;
    const frame = requestAnimationFrame(() => setInteractive(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  function select(index: number, method: string) {
    if (index !== selected)
      trackEvent("coin_selected", {
        coin_symbol: coins[index].symbol,
        selection_method: method,
      });
    setSelected(index);
  }
  function navigate(event: KeyboardEvent, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % coins.length;
    else if (event.key === "ArrowLeft")
      next = (index + coins.length - 1) % coins.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = coins.length - 1;
    else return;
    event.preventDefault();
    select(next, "keyboard");
    tabs.current[next]?.focus();
  }
  return (
    <div className={`collection-gallery world-gallery theme-${coin.theme}`}>
      <div
        className="world-gallery-stage"
        id="coin-gallery-panel"
        role="tabpanel"
        aria-labelledby={`gallery-tab-${coin.symbol}`}
      >
        <div className="world-gallery-copy" key={`copy-${coin.symbol}`}>
          <span className="collection-eyebrow">${coin.symbol} / SOLANA</span>
          <h2>{coin.name}</h2>
          <p>{coin.line}</p>
          <Link
            href={coinPath(coin.symbol)}
            prefetch={false}
            className="collection-button collection-button-dark"
            aria-label={`Enter this world: ${coin.name}`}
          >
            Enter this world <Arrow />
          </Link>
        </div>
        {interactive ? (
          <iframe
            className="world-iframe"
            src={`/embed/${coin.symbol}`}
            title={`${coin.name} interactive 3D world`}
            key={coin.symbol}
          />
        ) : (
          <div className={`coin-world coin-world-${coin.theme} is-compact`}>
            <div className="coin-world-canvas">
              <picture>
                <source
                  media="(max-width: 767px)"
                  srcSet={coin.world.poster.replace(".png", "-mobile.webp")}
                />
                <img
                  className="coin-world-poster"
                  src={coin.world.poster.replace(".png", "-mobile.webp")}
                  alt={`${coin.name} art-toy world poster`}
                  width={800}
                  height={800}
                  decoding="async"
                  fetchPriority="high"
                />
              </picture>
              <button
                type="button"
                className="world-start-button"
                onClick={() => setInteractive(true)}
              >
                Open 3D world
              </button>
            </div>
          </div>
        )}
      </div>
      <div
        className="gallery-selector world-selector"
        role="tablist"
        aria-label="Choose a character world"
      >
        {coins.map((item, index) => (
          <button
            key={item.symbol}
            id={`gallery-tab-${item.symbol}`}
            role="tab"
            aria-selected={selected === index}
            aria-controls="coin-gallery-panel"
            tabIndex={selected === index ? 0 : -1}
            onClick={() => select(index, "tab")}
            onKeyDown={(e) => navigate(e, index)}
            ref={(el) => {
              tabs.current[index] = el;
            }}
          >
            <Image
              src={item.world.poster.replace(".png", "-thumb.webp")}
              alt=""
              width={56}
              height={56}
            />
            <span>
              {item.name}
              <small>${item.symbol}</small>
            </span>
          </button>
        ))}
      </div>
      <p className="gallery-footnote">
        One 3D world loads at a time. Use the controls, drag, or press arrow keys.
      </p>
    </div>
  );
}
