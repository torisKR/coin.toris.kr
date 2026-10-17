"use client";

import { useEffect, useRef, useState } from "react";
import type * as Three from "three";
import { findCoin, type CoinSymbol } from "@/utils/coins";
import { trackEvent } from "@/utils/analytics";

type WorldControls = {
  turn: (amount: number) => void;
  action: () => void;
  pause: (value: boolean) => void;
};

export function CoinWorld({ symbol, compact = false }: { symbol: CoinSymbol; compact?: boolean }) {
  const coin = findCoin(symbol)!;
  const host = useRef<HTMLDivElement>(null);
  const controls = useRef<WorldControls | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(false);
  const [acting, setActing] = useState(false);
  const [announcement, setAnnouncement] = useState(`Loading ${coin.name}'s world.`);

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let disposed = false;
    let unavailable = false;
    let cleanup = () => {};
    const abort = new AbortController();
    setReady(false);
    setFailed(false);
    setActing(false);
    setAnnouncement(`Loading ${coin.name}'s world.`);

    Promise.all([
      import("three"),
      import("three/addons/loaders/GLTFLoader.js"),
      import("three/addons/environments/RoomEnvironment.js"),
    ]).then(async ([THREE, { GLTFLoader }, { RoomEnvironment }]) => {
      if (disposed) return;
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: compact ? "low-power" : "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, compact ? 1.35 : 1.7));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.AgXToneMapping;
      renderer.toneMappingExposure = 1;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.domElement.setAttribute("aria-hidden", "true");
      container.appendChild(renderer.domElement);
      cleanup = () => { renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); };

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-3.75, 3.75, 3.75, -3.75, .1, 60);
      const target = new THREE.Vector3(0, symbol === "XMASR" ? 2.1 : 1.9, 0);
      camera.position.copy(target).add(new THREE.Vector3(5.3, 6.3 - target.y, 12));
      camera.lookAt(target);
      const pmrem = new THREE.PMREMGenerator(renderer);
      const room = new RoomEnvironment();
      const environment = pmrem.fromScene(room, .04);
      scene.environment = environment.texture;
      scene.environmentIntensity = .65;
      room.dispose();
      pmrem.dispose();
      scene.add(new THREE.HemisphereLight(0xf1f7ff, 0x303a29, .8));
      const key = new THREE.DirectionalLight(0xffdfb4, 3.1);
      key.position.set(-3, 7, 4);
      key.target.position.set(0, 1.5, 0);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.left = -4; key.shadow.camera.right = 4;
      key.shadow.camera.top = 7; key.shadow.camera.bottom = -3;
      key.shadow.camera.near = .1; key.shadow.camera.far = 22;
      key.shadow.normalBias = .035; key.shadow.bias = -.0002;
      key.shadow.radius = 3;
      scene.add(key, key.target);
      const fill = new THREE.DirectionalLight(0xb0d6ff, 1.1);
      fill.position.set(4, 5, 2); scene.add(fill);
      const rim = new THREE.DirectionalLight(0xd6ebff, 2);
      rim.position.set(1, 7, -4); scene.add(rim);

      let model: Three.Object3D | null = null;
      let mixer: Three.AnimationMixer | null = null;
      let idle: Three.AnimationAction | null = null;
      let action: Three.AnimationAction | null = null;
      let isActing = false;
      let frame = 0;
      let visible = true;
      const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
      let userPaused = motion.matches;
      setPaused(userPaused);
      let yaw = 0;
      let targetYaw = 0;
      let last = 0;

      const disposeModel = (object: Three.Object3D) => {
        const geometries = new Set<Three.BufferGeometry>();
        const materials = new Set<Three.Material>();
        const textures = new Set<Three.Texture>();
        object.traverse((child) => {
          const mesh = child as Three.Mesh;
          if (mesh.geometry) geometries.add(mesh.geometry);
          const list = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
          list.forEach((material) => {
            materials.add(material);
            Object.values(material).forEach((value: unknown) => {
              if (value && typeof value === "object" && "isTexture" in value) textures.add(value as Three.Texture);
            });
          });
        });
        textures.forEach((texture) => {
          const bitmap = texture.source?.data;
          if (typeof ImageBitmap !== "undefined" && bitmap instanceof ImageBitmap) bitmap.close();
          texture.dispose();
        });
        geometries.forEach((geometry) => geometry.dispose());
        materials.forEach((material) => material.dispose());
      };

      function draw(now: number) {
        frame = 0;
        if (disposed || !visible || document.hidden || !model) return;
        const dt = last ? Math.min((now - last) / 1000, .05) : 0;
        last = now;
        // User yaw is independent of the authored character animation.
        yaw = THREE.MathUtils.damp(yaw, targetYaw, 12, dt || .016);
        model.rotation.y = yaw;
        if (!userPaused) mixer?.update(dt);
        renderer.render(scene, camera);
        if (!userPaused || Math.abs(targetYaw - yaw) > .0005) frame = requestAnimationFrame(draw);
      }
      function requestDraw() {
        if (!frame && !disposed && visible && !document.hidden) {
          last = 0;
          frame = requestAnimationFrame(draw);
        }
      }
      function suspend() {
        if (frame) cancelAnimationFrame(frame);
        frame = 0; last = 0;
      }
      const resize = () => {
        const rect = container.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        renderer.setSize(rect.width, rect.height, false);
        const aspect = rect.width / rect.height;
        // Fit the whole rotating world and the rocket's maximum ascent.
        const height = Math.max(7.5, 7.5 / aspect);
        camera.left = -height * aspect / 2; camera.right = height * aspect / 2;
        camera.top = height / 2; camera.bottom = -height / 2;
        camera.updateProjectionMatrix();
        requestDraw();
      };
      const finishAction = (event: { action: Three.AnimationAction }) => {
        if (event.action !== action) return;
        action?.stop();
        idle?.reset().fadeIn(.15).play();
        isActing = false;
        setActing(false);
        setAnnouncement(`${coin.name} is ready for another action.`);
      };
      const runAction = () => {
        if (!action || isActing) return;
        // An explicit action request also resumes motion for reduced-motion users.
        userPaused = false; setPaused(false);
        isActing = true; setActing(true);
        idle?.fadeOut(.12);
        action.reset().setEffectiveWeight(1).fadeIn(.12).play();
        setAnnouncement(coin.world.actionDescription);
        trackEvent("coin_selected", { coin_symbol: coin.symbol, selection_method: "world_action" });
        requestDraw();
      };
      controls.current = {
        turn: (amount) => { targetYaw += amount; requestDraw(); },
        action: runAction,
        pause: (value) => { userPaused = value; last = 0; requestDraw(); },
      };

      let dragging = false;
      let pointerId: number | null = null;
      let startX = 0;
      let startY = 0;
      let lastX = 0;
      let distance = 0;
      const onDown = (event: PointerEvent) => {
        if (event.button !== 0 || !event.isPrimary) return;
        dragging = true; pointerId = event.pointerId;
        startX = lastX = event.clientX; startY = event.clientY; distance = 0;
        container.setPointerCapture(event.pointerId);
        container.focus({ preventScroll: true });
      };
      const onMove = (event: PointerEvent) => {
        if (!dragging || event.pointerId !== pointerId) return;
        distance = Math.max(distance, Math.hypot(event.clientX - startX, event.clientY - startY));
        targetYaw += (event.clientX - lastX) * .009; lastX = event.clientX;
        requestDraw();
      };
      const endPointer = (event: PointerEvent, activate: boolean) => {
        if (event.pointerId !== pointerId) return;
        const tap = dragging && Math.max(distance, Math.hypot(event.clientX - startX, event.clientY - startY)) < 6;
        dragging = false; pointerId = null;
        if (container.hasPointerCapture(event.pointerId)) container.releasePointerCapture(event.pointerId);
        if (activate && tap) runAction();
      };
      const onUp = (event: PointerEvent) => endPointer(event, true);
      const onCancel = (event: PointerEvent) => endPointer(event, false);
      const onLostCapture = () => { dragging = false; pointerId = null; };
      const onKey = (event: KeyboardEvent) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault(); controls.current?.turn(event.key === "ArrowLeft" ? -.32 : .32);
        } else if (event.key === " " || event.key === "Enter") {
          event.preventDefault(); runAction();
        }
      };
      const onVisibility = () => { if (document.hidden) suspend(); else requestDraw(); };
      const onMotion = () => {
        if (motion.matches) { userPaused = true; setPaused(true); requestDraw(); }
      };
      const fail = () => {
        if (disposed || unavailable) return;
        unavailable = true; abort.abort();
        suspend(); cleanup(); cleanup = () => {}; setReady(false); setFailed(true); setActing(false);
        controls.current = null;
        setAnnouncement(`${coin.name}'s 3D world is unavailable. The world poster remains available.`);
      };
      const onContextLost = (event: Event) => { event.preventDefault(); fail(); };
      const intersection = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) requestDraw(); else suspend();
      });
      intersection.observe(container);
      const observer = new ResizeObserver(resize); observer.observe(container);
      container.addEventListener("pointerdown", onDown);
      container.addEventListener("pointermove", onMove);
      container.addEventListener("pointerup", onUp);
      container.addEventListener("pointercancel", onCancel);
      container.addEventListener("lostpointercapture", onLostCapture);
      container.addEventListener("keydown", onKey);
      renderer.domElement.addEventListener("webglcontextlost", onContextLost);
      document.addEventListener("visibilitychange", onVisibility);
      motion.addEventListener("change", onMotion);
      resize();

      cleanup = () => {
        suspend(); intersection.disconnect(); observer.disconnect();
        container.removeEventListener("pointerdown", onDown);
        container.removeEventListener("pointermove", onMove);
        container.removeEventListener("pointerup", onUp);
        container.removeEventListener("pointercancel", onCancel);
        container.removeEventListener("lostpointercapture", onLostCapture);
        container.removeEventListener("keydown", onKey);
        renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
        document.removeEventListener("visibilitychange", onVisibility);
        motion.removeEventListener("change", onMotion);
        mixer?.removeEventListener("finished", finishAction);
        mixer?.stopAllAction();
        if (model) { mixer?.uncacheRoot(model); disposeModel(model); }
        scene.environment = null; environment.dispose(); key.shadow.dispose();
        renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
      };

      try {
        const response = await fetch(coin.world.glb, { signal: abort.signal });
        if (!response.ok) throw new Error(`Model HTTP ${response.status}`);
        const gltf = await new GLTFLoader().parseAsync(await response.arrayBuffer(), "/worlds/");
        if (disposed || unavailable) { disposeModel(gltf.scene); return; }
        model = gltf.scene;
        model.traverse((object) => {
          const mesh = object as Three.Mesh;
          if (mesh.isMesh) { mesh.castShadow = true; mesh.receiveShadow = true; }
        });
        scene.add(model);
        const idleClip = THREE.AnimationClip.findByName(gltf.animations, "Idle");
        const actionClip = THREE.AnimationClip.findByName(gltf.animations, "Action");
        if (!idleClip || !actionClip) throw new Error("Character animation clips missing");
        mixer = new THREE.AnimationMixer(model);
        idle = mixer.clipAction(idleClip).play();
        action = mixer.clipAction(actionClip).setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = false;
        mixer.addEventListener("finished", finishAction);
        mixer.update(0);
        // Fit based on geometry as well as the authored square framing.
        const bounds = new THREE.Box3().setFromObject(model);
        const span = bounds.getSize(new THREE.Vector3());
        if (Math.max(span.x, span.z) > 6.9) camera.zoom = 6.9 / Math.max(span.x, span.z);
        resize(); renderer.render(scene, camera);
        setReady(true);
        setAnnouncement(`${coin.name}'s 3D world is ready. Drag to rotate or activate the character action.`);
        requestDraw();
      } catch (error) {
        if (!disposed && !(error instanceof DOMException && error.name === "AbortError")) fail();
      }
    }).catch(() => {
      if (!disposed) {
        cleanup(); setReady(false); setFailed(true);
        setAnnouncement(`${coin.name}'s 3D world is unavailable. The world poster remains available.`);
      }
    });

    return () => { disposed = true; abort.abort(); controls.current = null; cleanup(); };
  }, [coin, compact, symbol]);

  return (
    <div className={`coin-world coin-world-${coin.theme} ${compact ? "is-compact" : ""}`}>
      <div ref={host} className={`coin-world-canvas ${ready ? "is-ready" : ""}`} tabIndex={0} role="application"
        aria-label={`${coin.name} interactive 3D world. Drag or use left and right arrow keys to rotate. Press Enter or Space for the character action.`}>
        <picture>
          <source media="(max-width: 767px)" srcSet={coin.world.poster.replace(".png", "-mobile.webp")} />
          <source type="image/webp" srcSet={coin.world.poster.replace(".png", ".webp")} />
          {/* Same Blender camera and character as the live world. */}
          <img className="coin-world-poster" src={coin.world.poster} alt={`${coin.name} rendered character world`}
            width={1200} height={1200} decoding="async" fetchPriority={compact ? "high" : "auto"} />
        </picture>
        {!ready && !failed && <span className="world-loading">Building the world</span>}
        {failed && <span className="world-loading">3D unavailable. Showing poster.</span>}
      </div>
      <div className="coin-world-controls" aria-label="3D world controls">
        <button type="button" disabled={!ready} onClick={() => controls.current?.turn(-.4)} aria-label="Turn left">←</button>
        <button className="world-action" type="button" disabled={!ready || acting} onClick={() => controls.current?.action()}>
          {acting ? "Playing action" : coin.world.actionLabel}
        </button>
        <button type="button" disabled={!ready} onClick={() => controls.current?.turn(.4)} aria-label="Turn right">→</button>
        <button type="button" disabled={!ready} aria-pressed={paused} onClick={() => {
          const next = !paused; setPaused(next); controls.current?.pause(next);
        }}>{paused ? "Play" : "Pause"}</button>
      </div>
      <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
    </div>
  );
}
