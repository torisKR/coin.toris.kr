"use client";

import { useEffect, useRef, useState } from "react";
import type * as Three from "three";
import type { CoinSymbol } from "@/utils/coins";
import { findCoin } from "@/utils/coins";
import { trackEvent } from "@/utils/analytics";

type WorldControls = {
  turn: (amount: number) => void;
  action: () => void;
  pause: (value: boolean) => void;
  reset: () => void;
};

export function CoinWorld({
  symbol,
  compact = false,
}: {
  symbol: CoinSymbol;
  compact?: boolean;
}) {
  const coin = findCoin(symbol)!;
  const host = useRef<HTMLDivElement>(null);
  const controls = useRef<WorldControls | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(false);
  const [acting, setActing] = useState(false);
  const [announcement, setAnnouncement] = useState(
    `Loading ${coin.name}'s world.`,
  );

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let disposed = false;
    let cleanup = () => {};
    setReady(false);
    setFailed(false);
    setActing(false);
    setAnnouncement(`Loading ${coin.name}'s world.`);

    Promise.all([
      import("three"),
      import("three/addons/loaders/GLTFLoader.js"),
    ])
      .then(([THREE, { GLTFLoader }]) => {
        if (disposed) return;
        let renderer: Three.WebGLRenderer;
        try {
          renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: compact ? "low-power" : "high-performance",
          });
        } catch {
          throw new Error("WebGL unavailable");
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, compact ? 1.35 : 1.7));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;
        renderer.domElement.setAttribute("aria-hidden", "true");
        container.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 50);
        camera.position.set(0, 2.1, compact ? 10.8 : 9.2);
        camera.lookAt(0, 0.1, 0);
        scene.add(new THREE.HemisphereLight(0xf6fbff, 0x172b38, 2.8));
        const key = new THREE.DirectionalLight(0xffe1b7, 4.2);
        key.position.set(4, 6, 5);
        scene.add(key);
        const rim = new THREE.DirectionalLight(
          symbol === "PEBR" ? 0x8fe39a : symbol === "YETI" ? 0x8fcfff : 0xffbd73,
          3.2,
        );
        rim.position.set(-4, 3, -2);
        scene.add(rim);

        let model: Three.Object3D | null = null;
        let character: Three.Object3D | null = null;
        let actionPivot: Three.Object3D | null = null;
        let actionBall: Three.Object3D | null = null;
        let frame = 0;
        let visible = true;
        let userPaused = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let yaw = -0.16;
        let targetYaw = -0.16;
        let actionStart = 0;
        let baseActionRotation = 0;
        let baseCharacterY = 0;
        let last = performance.now();

        if (userPaused) setPaused(true);

        const resize = () => {
          const rect = container.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
          renderer.setSize(rect.width, rect.height, false);
          camera.aspect = rect.width / rect.height;
          camera.position.z = camera.aspect < 0.8 ? 11.4 : compact ? 10.8 : 9.2;
          camera.updateProjectionMatrix();
        };

        const animateAction = (elapsed: number) => {
          if (!actionStart || !character) return;
          const t = Math.min((elapsed - actionStart) / 1450, 1);
          const wave = Math.sin(t * Math.PI);
          if (symbol === "PEBR" && actionPivot) {
            actionPivot.rotation.x = baseActionRotation - wave * 0.72;
          } else if (symbol === "YETI" && actionPivot) {
            actionPivot.rotation.z = baseActionRotation - wave * 1.05;
            if (actionBall) actionBall.position.x = -0.58 - wave * 1.5;
          } else if (symbol === "XMASR") {
            character.position.y = baseCharacterY + wave * 0.78;
            character.rotation.z = Math.sin(t * Math.PI * 4) * 0.018 * wave;
          }
          if (t >= 1) {
            actionStart = 0;
            setActing(false);
            setAnnouncement(`${coin.name} is ready for another action.`);
          }
        };

        const draw = (now: number) => {
          frame = 0;
          if (disposed || !visible || document.hidden || !model) return;
          const dt = Math.min((now - last) / 1000, 0.05);
          last = now;
          if (!userPaused) targetYaw += dt * 0.07;
          yaw = THREE.MathUtils.damp(yaw, targetYaw, 8, dt || 0.016);
          model.rotation.y = yaw;
          animateAction(now);
          renderer.render(scene, camera);
          if (!userPaused || actionStart || Math.abs(targetYaw - yaw) > 0.001) {
            frame = requestAnimationFrame(draw);
          }
        };

        const requestDraw = () => {
          if (!frame && !disposed && visible && !document.hidden) {
            last = performance.now();
            frame = requestAnimationFrame(draw);
          }
        };

        const runAction = () => {
          if (!character || actionStart) return;
          actionStart = performance.now();
          setActing(true);
          setAnnouncement(coin.world.actionDescription);
          trackEvent("coin_selected", {
            coin_symbol: coin.symbol,
            selection_method: "world_action",
          });
          requestDraw();
        };

        controls.current = {
          turn: (amount) => {
            targetYaw += amount;
            requestDraw();
          },
          action: runAction,
          pause: (value) => {
            userPaused = value;
            requestDraw();
          },
          reset: () => {
            targetYaw = -0.16;
            requestDraw();
          },
        };

        const loader = new GLTFLoader();
        loader.load(
          coin.world.glb,
          (gltf) => {
            if (disposed) return;
            model = gltf.scene;
            model.scale.setScalar(compact ? 0.92 : 1);
            model.rotation.y = yaw;
            scene.add(model);
            character = model.getObjectByName("CharacterRoot") ?? model;
            actionPivot = model.getObjectByName("ActionPivot") ?? null;
            actionBall = model.getObjectByName("ActionBall") ?? null;
            baseActionRotation =
              symbol === "YETI"
                ? actionPivot?.rotation.z ?? 0
                : actionPivot?.rotation.x ?? 0;
            baseCharacterY = character.position.y;
            resize();
            renderer.render(scene, camera);
            setReady(true);
            setAnnouncement(
              `${coin.name}'s 3D world is ready. Drag to rotate or activate the character action.`,
            );
            requestDraw();
          },
          undefined,
          () => {
            setFailed(true);
            setAnnouncement(
              `${coin.name}'s 3D model could not load. The world poster remains available.`,
            );
          },
        );

        let dragging = false;
        let lastX = 0;
        const onDown = (event: PointerEvent) => {
          if (event.button !== 0) return;
          dragging = true;
          lastX = event.clientX;
          container.setPointerCapture(event.pointerId);
          container.focus({ preventScroll: true });
        };
        const onMove = (event: PointerEvent) => {
          if (!dragging) return;
          targetYaw += (event.clientX - lastX) * 0.009;
          lastX = event.clientX;
          requestDraw();
        };
        const onUp = (event: PointerEvent) => {
          const moved = Math.abs(event.clientX - lastX);
          dragging = false;
          if (container.hasPointerCapture(event.pointerId)) {
            container.releasePointerCapture(event.pointerId);
          }
          if (moved < 4) runAction();
        };
        const onKey = (event: KeyboardEvent) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            controls.current?.turn(event.key === "ArrowLeft" ? -0.32 : 0.32);
          } else if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
            runAction();
          }
        };
        const onVisibility = () => {
          if (!document.hidden) requestDraw();
        };
        const intersection = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          if (visible) requestDraw();
          else if (frame) cancelAnimationFrame(frame);
          if (!visible) frame = 0;
        });
        intersection.observe(container);
        const observer = new ResizeObserver(resize);
        observer.observe(container);
        container.addEventListener("pointerdown", onDown);
        container.addEventListener("pointermove", onMove);
        container.addEventListener("pointerup", onUp);
        container.addEventListener("keydown", onKey);
        document.addEventListener("visibilitychange", onVisibility);
        resize();

        cleanup = () => {
          if (frame) cancelAnimationFrame(frame);
          intersection.disconnect();
          observer.disconnect();
          container.removeEventListener("pointerdown", onDown);
          container.removeEventListener("pointermove", onMove);
          container.removeEventListener("pointerup", onUp);
          container.removeEventListener("keydown", onKey);
          document.removeEventListener("visibilitychange", onVisibility);
          model?.traverse((object) => {
            const mesh = object as Three.Mesh;
            mesh.geometry?.dispose?.();
            const materials = Array.isArray(mesh.material)
              ? mesh.material
              : mesh.material
                ? [mesh.material]
                : [];
            materials.forEach((material) => material.dispose());
          });
          renderer.dispose();
          renderer.domElement.remove();
        };
      })
      .catch(() => {
        if (!disposed) {
          setFailed(true);
          setAnnouncement(
            `${coin.name}'s 3D world is unavailable. The poster and all navigation remain available.`,
          );
        }
      });

    return () => {
      disposed = true;
      controls.current = null;
      cleanup();
    };
  }, [coin, compact, symbol]);

  return (
    <div className={`coin-world coin-world-${coin.theme} ${compact ? "is-compact" : ""}`}>
      <div
        ref={host}
        className={`coin-world-canvas ${ready ? "is-ready" : ""}`}
        tabIndex={0}
        role="application"
        aria-label={`${coin.name} interactive 3D world. Drag or use left and right arrow keys to rotate. Press Enter or Space for the character action.`}
      >
        <picture>
          <source
            media="(max-width: 767px)"
            srcSet={coin.world.conceptPoster.replace(".webp", "-mobile.webp")}
          />
          {/* A picture element supplies a smaller mobile source than unoptimized static export can. */}
          <img
            className="coin-world-poster"
            src={coin.world.conceptPoster}
            alt={`${coin.name} art-toy world poster`}
            width={1200}
            height={1200}
            decoding="async"
            fetchPriority={compact ? "high" : "auto"}
          />
        </picture>
        {!ready && !failed && <span className="world-loading">Building the world</span>}
        {failed && <span className="world-loading">3D unavailable. Showing poster.</span>}
      </div>
      <div className="coin-world-controls" aria-label="3D world controls">
        <button type="button" onClick={() => controls.current?.turn(-0.4)} aria-label="Turn left">
          ←
        </button>
        <button
          className="world-action"
          type="button"
          disabled={!ready || acting}
          onClick={() => controls.current?.action()}
        >
          {acting ? "Playing action" : coin.world.actionLabel}
        </button>
        <button type="button" onClick={() => controls.current?.turn(0.4)} aria-label="Turn right">
          →
        </button>
        <button
          type="button"
          aria-pressed={paused}
          onClick={() => {
            const next = !paused;
            setPaused(next);
            controls.current?.pause(next);
          }}
        >
          {paused ? "Play" : "Pause"}
        </button>
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
