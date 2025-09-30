import React, { useEffect, useRef } from "react";
import "./AnimeGirlMascot.css";

export type GirlStatus = "idle" | "loading" | "data" | "nodata";

interface Props {
  status: GirlStatus;
  className?: string;
  style?: React.CSSProperties;
  modelUrl?: string; // Neptune (Cubism2) by default
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

// hit areas
const HEAD_AREAS = ["head", "Head", "HitAreaHead", "FACE", "Face"];
const BODY_AREAS = ["body", "belly", "Body", "HitAreaBody", "BUST", "Bust"];

function isModelHitAt(model: any, x: number, y: number) {
  if (!model) return { head: false, body: false };
  const b = model.getBounds?.();
  if (!b || x < b.x || y < b.y || x > b.x + b.width || y > b.y + b.height) {
    return { head: false, body: false };
  }
  const hasHit = !!model.hitTest;
  const head = hasHit && HEAD_AREAS.some((n) => model.hitTest(n, x, y));
  const body = hasHit && BODY_AREAS.some((n) => model.hitTest(n, x, y));
  return { head: !!head, body: !!body };
}

const clamp = (v: number, a = -1, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const AnimeGirlMascot: React.FC<Props> = ({
  status,
  className,
  style,
  modelUrl = "https://cdn.jsdelivr.net/gh/evrstr/live2d-widget-models/live2d_evrstr/Neptune/model.json",
}) => {
  const holderRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<any>(null);
  const modelRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const destroyedRef = useRef(false);

  // gaze & idle state (ALL HOOKS INSIDE COMPONENT)
  const gazeTargetRef = useRef({ x: 0, y: 0 });   // desired [-1..1]
  const gazeCurrentRef = useRef({ x: 0, y: 0 });  // current (lerped)
  const isPointerInsideRef = useRef(false);

  const lastMoveRef = useRef(Date.now());
  const isDeformedRef = useRef(false);
  const lastVoiceAtRef = useRef(0);
  const initializedRef = useRef(false);

  const EXP: Record<GirlStatus | "deformed", string[]> = {
    idle:    ["idle", "normal", "home", "neutral", "default"],
    loading: ["enjoy", "kira", "excited", "joy"],
    data:    ["happy", "smile", "smile2", "smiling"],
    nodata:  ["sad", "unhappy", "frown", "angry", "trouble"],
    deformed:["deformed", "weird", "surprised", "shock"],
  };

  const setExpression = (candidates: string[]) => {
    const model = modelRef.current;
    if (!model) return;

    const names =
      (model.internalModel?.settings?.expressions || []).map((e: any) => e.name) || [];

    const want =
      candidates.find((w) =>
        names.some((n: string) => n.toLowerCase() === w.toLowerCase())
      ) || names[0];

    try {
      model.expression(want);
    } catch {
      const idx = names.indexOf(want);
      const mgr = model.internalModel?.motionManager?.expressionManager;
      if (mgr && idx >= 0) mgr.setExpression(idx);
    }

    setTimeout(() => {
      try { model.expression(want); } catch {}
    }, 50);
  };

  const applyQuickDeformParams = () => {
    const cm = modelRef.current?.internalModel?.coreModel;
    if (!cm) return;
    const set = (id: string, v: number) => { try { cm.setParamFloat(id, v); } catch {} };
    set("PARAM_ANGLE_X", 20);
    set("PARAM_ANGLE_Y", -15);
    set("PARAM_EYE_L_OPEN", 0.25);
    set("PARAM_EYE_R_OPEN", 0.55);
    set("PARAM_MOUTH_OPEN_Y", 0.9);
    set("PARAM_MOUTH_FORM", -0.6);
  };

  const setStatusLook = (s: GirlStatus) => {
    if (isDeformedRef.current) return;
    setExpression(EXP[s]);
  };

  useEffect(() => {
      if (initializedRef.current) return;
  initializedRef.current = true;

    let cleanup: (() => void) | null = null;

    (async () => {
      const holder = holderRef.current!;
      holder.innerHTML = "";

      // 1) Live2D core
      await loadScript(
        "https://cdn.jsdelivr.net/gh/dylanNew/live2d/webgl/Live2D/lib/live2d.min.js"
      );

      // 2) Pixi + cubism2 build
      const [PIXI, live2d] = await Promise.all([
        import("pixi.js"),
        // @ts-ignore
        import("pixi-live2d-display/cubism2"),
      ]);
      const { Live2DModel } = live2d as any;

      // 3) Pixi app
      const app = new PIXI.Application({
        view: Object.assign(document.createElement("canvas"), { id: "l2dCanvas" }),
        resizeTo: holder,
        backgroundAlpha: 0,
        antialias: true,
      });
      appRef.current = app;
      holder.appendChild(app.view as HTMLCanvasElement);

      app.stage.interactive = false;
      app.stage.interactiveChildren = false;

      // 4) Load model
      const model = await Live2DModel.from(modelUrl);
      modelRef.current = model;
      app.stage.addChild(model);

      setStatusLook(status);

      // 5) Animate + gaze each frame
     app.ticker.add((delta: number) => {
  const internal = model.internalModel;
  const cm = internal?.coreModel;

  // --- 1) LERP GAZE TARGET ---
  const followSpeed = 0.12;
  const relaxSpeed  = 0.06;

  const target = gazeTargetRef.current;
  const current = gazeCurrentRef.current;
  const speed = isPointerInsideRef.current ? followSpeed : relaxSpeed;

  current.x = lerp(current.x, target.x, speed);
  current.y = lerp(current.y, target.y, speed);
  current.x = clamp(current.x);
  current.y = clamp(current.y);

  // --- 2) FEED DRAG MANAGER *BEFORE* UPDATE ---
  // Drag expects roughly [-1..1]
  try {
    internal?.dragManager?.set(current.x, current.y);
  } catch {}

  // --- 3) UPDATE THE MODEL (motions/eyeblink read drag here) ---
  model.update(delta);

  // --- 4) POST-UPDATE OVERRIDE (belt & suspenders) ---
  if (cm) {
    cm.setParamFloat("PARAM_ANGLE_X",    current.x * 25);
    cm.setParamFloat("PARAM_ANGLE_Y",   -current.y * 15);
    cm.setParamFloat("PARAM_EYE_BALL_X", current.x * 0.9);
    cm.setParamFloat("PARAM_EYE_BALL_Y",-current.y * 0.9);
  }
});


      // 6) Fit
      model.anchor.set(0.5, 0.5);
      const fit = () => {
        if (!app.renderer) return;
        const w = app.renderer.width;
        const h = app.renderer.height;
        const targetH = h * 0.9;
        const curH = model.height || 1;
        const s = (targetH / curH) * model.scale.x;
        model.scale.set(s);
        model.position.set(w * 0.5, h * 0.62);
      };
      fit();
      const ro = new ResizeObserver(fit);
      ro.observe(holder);

      // 7) Pointer events
      const canvas = app.view as HTMLCanvasElement;
      canvas.style.touchAction = "none";
      canvas.style.pointerEvents = "auto";

      const playRandomTapBody = () => {
        const settings = model.internalModel?.settings;
        const group = settings?.motions?.tap_body || [];
        if (!group.length) return;
        const idx = Math.floor(Math.random() * group.length);
        const entry = group[idx];
        try {
          model.motion("tap_body", idx);
        } catch {
          model.internalModel?.motionManager?.startMotion("tap_body", idx, 3);
        }
        if (entry?.sound) {
          const base = modelUrl.substring(0, modelUrl.lastIndexOf("/") + 1);
          new Audio(base + entry.sound).play().catch(() => {});
        }
      };

      const onPointerDown = (e: PointerEvent) => {
        const now = Date.now();
        if (now - lastVoiceAtRef.current < 350) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const { head, body } = isModelHitAt(model, x, y);
        if (head) {
          setExpression(["kira", "smile", "happy"]);
          playRandomTapBody();
          lastVoiceAtRef.current = now;
        } else if (body) {
          setExpression(["happy"]);
          playRandomTapBody();
          lastVoiceAtRef.current = now;
        }
      };

      const toCanvasNormXY = (clientX: number, clientY: number) => {
        const rect = canvas.getBoundingClientRect();
        const x = ((clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((clientY - rect.top) / rect.height - 0.5) * 2;
        return { x: clamp(x), y: clamp(y) };
      };

    const onCanvasEnter = () => { isPointerInsideRef.current = true; };
const onCanvasLeave = () => {
  isPointerInsideRef.current = false;
  gazeTargetRef.current = { x: 0, y: 0 }; // smoothly relax to center
};

    const onAnyPointerMove = (e: PointerEvent) => {
  const n = toCanvasNormXY(e.clientX, e.clientY);
  gazeTargetRef.current = n;
  lastMoveRef.current = Date.now();
  if (isDeformedRef.current) {
    isDeformedRef.current = false;
    setStatusLook(status);
  }
};

      canvas.addEventListener("pointerenter", onCanvasEnter);
      canvas.addEventListener("pointerleave", onCanvasLeave);
     window.addEventListener("pointermove", onAnyPointerMove, { passive: true });
      canvas.addEventListener("pointerdown", onPointerDown);

      // 8) Idle → deformed
      const checkIdle = () => {
        if (destroyedRef.current) return;
        const now = Date.now();
        if (!isDeformedRef.current && now - lastMoveRef.current > 20000) {
          const names =
            (model.internalModel?.settings?.expressions || []).map((e: any) => e.name) || [];
          const hasDeform = names.some((n: string) =>
            EXP.deformed.some((w) => w.toLowerCase() === n.toLowerCase())
          );
          if (hasDeform) setExpression(EXP.deformed);
          else applyQuickDeformParams();
          isDeformedRef.current = true;
        }
        rafRef.current = requestAnimationFrame(checkIdle);
      };
      rafRef.current = requestAnimationFrame(checkIdle);

     setStatusLook(status);  // ✅

      cleanup = () => {
        destroyedRef.current = true;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        ro.disconnect();
        canvas.removeEventListener("pointerenter", onCanvasEnter);
        canvas.removeEventListener("pointerleave", onCanvasLeave);
        window.removeEventListener("pointermove", onAnyPointerMove);
        canvas.removeEventListener("pointerdown", onPointerDown);
        app.destroy(true, { children: true, texture: true, baseTexture: true });
        appRef.current = null;
        modelRef.current = null;
        initializedRef.current = false;
      };
    })().catch(console.error);

    return () => {
      if (cleanup) cleanup();
      else destroyedRef.current = true;
      initializedRef.current = false;
    };
}, [modelUrl]); // ✅ only modelUrl


// UPDATE EXPRESSION when status changes
useEffect(() => {
  if (isDeformedRef.current) isDeformedRef.current = false;
  const m = modelRef.current;
  if (!m) {
    queueMicrotask(() => setStatusLook(status));
    return;
  }
  setStatusLook(status);  // ✅ apply on every status change
}, [status]);

  return (
    <div className={["l2d-wrap", className || ""].join(" ").trim()} style={style}>
      <div ref={holderRef} className="l2d-canvas-holder" />
    </div>
  );
};

export default AnimeGirlMascot;
