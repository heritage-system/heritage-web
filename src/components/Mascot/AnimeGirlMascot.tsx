import React, { useEffect, useRef } from "react";
import "./AnimeGirlMascot.css";

export type GirlStatus = "idle" | "loading" | "data" | "nodata";
const FOOT_GAP_PX = 0; // ← add 4–8 if you want a tiny breathing room
interface Props {
  status: GirlStatus;
  className?: string;
  style?: React.CSSProperties;
  modelUrl?: string; // Neptune (Cubism2) by default
   /** NEW: log every expression change */
  onExpression?: (e: { name: string; source: string; at: number }) => void;
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



const clamp = (v: number, a = -1, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const AnimeGirlMascot: React.FC<Props> = ({
  status,
  className,
  style,
  modelUrl = "https://cdn.jsdelivr.net/gh/evrstr/live2d-widget-models/live2d_evrstr/Neptune/model.json",
  onExpression,
}) => {
  const holderRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const destroyedRef = useRef(false);
  const appRef = useRef<any>(null);
const modelRef = useRef<any>(null);
const canvasElRef = useRef<HTMLCanvasElement | null>(null);
const handlersRef = useRef<{ lost?: (e: Event)=>void; restored?: (e: Event)=>void }>({});
const contextLostRef = useRef(false);
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
 const lastExprRef = useRef<{name:string; at:number} | null>(null);

const report = (name: string, source: string) => {
  const now = Date.now();
  const last = lastExprRef.current;
  // if same name within 150ms, skip
  if (last && last.name === name && (now - last.at) < 150) return;
  lastExprRef.current = { name, at: now };
  try { onExpression?.({ name, source, at: now }); } catch {}
};
  const setExpression = (candidates: string[], source = "unknown") => {
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

  // belt & suspenders
  setTimeout(() => {
    try { modelRef.current?.expression(want); } catch {}
  }, 50);

  report(want, source); // NEW
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
  setExpression(EXP[s], `status:${s}`);
};

  useEffect(() => {
      if (initializedRef.current) return;
  initializedRef.current = true;



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
    Live2DModel.registerTicker(PIXI.Ticker);

      // 3) Pixi app
      const app = new PIXI.Application({
        view: Object.assign(document.createElement("canvas"), { id: "l2dCanvas" }),
        resizeTo: holder,
        backgroundAlpha: 0,
        antialias: true,
      });
     appRef.current = app;
holder.appendChild(app.view as HTMLCanvasElement);
(app.view as HTMLCanvasElement).style.display = 'block'; // remove inline-canvas whitespace
(app.view as HTMLCanvasElement).style.margin = '0';
(app.view as HTMLCanvasElement).style.padding = '0';
canvasElRef.current = app.view as HTMLCanvasElement;

      app.stage.interactive = false;
      app.stage.interactiveChildren = false;

      // 4) Load model
      const model = await Live2DModel.from(modelUrl);
      
      // --- runtime widen of broken custom hit areas (safe, local only) ---
const settings = model.internalModel?.settings as any;
const expandRect = (rx: number[], ry: number[], m = 0.15) => {
  const [x1, x2] = rx, [y1, y2] = ry;
  return {
    rx: [Math.min(x1, x2) - m, Math.max(x1, x2) + m],
    ry: [Math.min(y1, y2) - m, Math.max(y1, y2) + m],
  };
};
const shrinkRect = (rx: number[], ry: number[], m = 0.15) => {
  const [x1, x2] = rx, [y1, y2] = ry;
  return {
    rx: [Math.min(x1, x2) + m, Math.max(x1, x2) - m],
    ry: [Math.min(y1, y2) + m, Math.max(y1, y2) - m],
  };
};
// Optional: keep your widen
if (settings?.hitAreasCustom) {
  settings.hitAreasCustom.body_x  = [-0.45,  0.45];
  settings.hitAreasCustom.body_y  = [ 0.10, -0.85];
  settings.hitAreasCustom.belly_x = [-0.35,  0.35];
  settings.hitAreasCustom.belly_y = [-0.05, -0.75];
}

// Build effective rects that reduce overlap: shrink head, expand body
const EFFECT = (() => {
  const c = settings?.hitAreasCustom;
  if (!c) return null;

  // Head: shrink a bit so it doesn’t “steal” torso clicks
  const head = shrinkRect(c.head_x ?? [-0.3, 0.3], c.head_y ?? [0.15, -0.2], 0.12);

  // Body: union of (expanded) body & belly
  const b  = expandRect(c.body_x ?? [-0.4, 0.4], c.body_y ?? [0.1, -0.8], 0.18);
  const be = c.belly_x && c.belly_y ? expandRect(c.belly_x, c.belly_y, 0.18) : null;

  return { head, body: b, belly: be };
})();


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
try {
  const h = app.renderer.height;
  const b = model.getBounds();
  const dy = (h - FOOT_GAP_PX) - b.bottom;
  if (Math.abs(dy) > 0.5) model.y += dy; // tiny correction, no visible jitter
} catch {}
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
  const fitModel = (
  app: any,
  model: any,
  mode: 'cover' | 'contain' = 'cover',
  bottomGapPx: number = FOOT_GAP_PX
) => {
  if (!app?.renderer || !model) return;
  const w = app.renderer.width, h = app.renderer.height;
  if (!w || !h) return;

  // base (unscaled) size
  const baseW = (model.width  || 1) / (model.scale?.x || 1);
  const baseH = (model.height || 1) / (model.scale?.y || 1);

  const scale =
    mode === 'cover'
      ? Math.max(w / baseW, h / baseH)
      : Math.min(w / baseW, h / baseH);

  model.anchor.set(0.5, 0.5);
  model.scale.set(scale);
  model.position.set(w * 0.5, h * 0.5);

  // bottom-align after bounds are valid
  requestAnimationFrame(() => {
    try {
      const b = model.getBounds();
      const dy = (h - bottomGapPx) - b.bottom;
      model.y += dy;                    // feet → bottom edge
    } catch {}
  });
};
fitModel(app, model, 'cover', FOOT_GAP_PX);
const ro = new ResizeObserver(() => fitModel(app, model, 'cover', FOOT_GAP_PX));
ro.observe(holder);



      // 7) Pointer events
   const canvas = app.view as HTMLCanvasElement;

handlersRef.current.lost = (e: Event) => {
  e.preventDefault();
  try { app.ticker.stop(); } catch {}
};

handlersRef.current.restored = async () => {
  try {
    const { Live2DModel } = await import("pixi-live2d-display/cubism2");
    if (modelRef.current) {
      try {
        app.stage.removeChild(modelRef.current);
        modelRef.current.destroy({ children: true, texture: true, baseTexture: true });
      } catch {}
      modelRef.current = null;
    }
    const model = await Live2DModel.from(modelUrl);
    if (destroyedRef.current) { try { model.destroy(); } catch {}; return; }

    modelRef.current = model;
    app.stage.addChild(model);

    // re-fit safely
    const w = app.renderer?.width ?? 0, h = app.renderer?.height ?? 0;
    if (w && h) {
      model.anchor.set(0.5);
    fitModel(app, model, 'cover', FOOT_GAP_PX);

    }

    setStatusLook(status);
  } finally {
    try { app.ticker.start(); } catch {}
  }
};

canvas.addEventListener("webglcontextlost", handlersRef.current.lost!, false);
canvas.addEventListener("webglcontextrestored", handlersRef.current.restored!, false);
      canvas.style.touchAction = "none";
      canvas.style.pointerEvents = "auto";
handlersRef.current.lost = (e: Event) => {
  e.preventDefault();
  contextLostRef.current = true;
  const app = appRef.current;
  if (app?.ticker) { try { app.ticker.stop(); } catch {} }
};

handlersRef.current.restored = async () => {
  const app = appRef.current;
  if (!app || destroyedRef.current) return;
  try {
    const { Live2DModel } = await import("pixi-live2d-display/cubism2");

    // remove & destroy old model completely
    if (modelRef.current) {
      try {
        app.stage.removeChild(modelRef.current);
        modelRef.current.destroy({ children: true, texture: true, baseTexture: true });
      } catch {}
      modelRef.current = null;
    }

    const model = await Live2DModel.from(modelUrl);
    if (destroyedRef.current) { try { model.destroy(); } catch {}; return; }
    modelRef.current = model;
    app.stage.addChild(model);

    // re-fit; guard 0x0
    const w = app.renderer?.width ?? 0, h = app.renderer?.height ?? 0;
    if (w && h) {
      model.anchor.set(0.5, 0.5);
      const targetH = h * 0.9, curH = model.height || 1;
      model.scale.set((targetH / curH) * model.scale.x);
      model.position.set(w * 0.5, h * 0.62);
    }

    setStatusLook(status);
  } finally {
    contextLostRef.current = false;
    try { app.ticker.start(); } catch {}
  }
};



     const drawDebugRects = true;
if (drawDebugRects && settings?.hitAreasCustom) {
  const g = new PIXI.Graphics();
  const draw = (rx: number[], ry: number[], color: number) => {
    // sample the 4 corners in normalized space and map back to world
    const corners = [
      { nx: Math.min(...rx), ny: Math.min(...ry) },
      { nx: Math.max(...rx), ny: Math.min(...ry) },
      { nx: Math.max(...rx), ny: Math.max(...ry) },
      { nx: Math.min(...rx), ny: Math.max(...ry) },
    ].map(({nx, ny}) => {
      // normalized -> local px
      const halfW = model.width/2, halfH = model.height/2;
      const local = new PIXI.Point(nx * halfW, -ny * halfH);
      return model.worldTransform.apply(local); // world px
    });
    g.lineStyle(2, color, 0.9);
    g.moveTo(corners[0].x, corners[0].y);
    for (let i=1;i<corners.length;i++) g.lineTo(corners[i].x, corners[i].y);
    g.lineTo(corners[0].x, corners[0].y);
  };
  draw(settings.hitAreasCustom.head_x,  settings.hitAreasCustom.head_y,  0x33ccff);
  draw(settings.hitAreasCustom.body_x,  settings.hitAreasCustom.body_y,  0x33dd66);
  if (settings.hitAreasCustom.belly_x && settings.hitAreasCustom.belly_y)
    draw(settings.hitAreasCustom.belly_x, settings.hitAreasCustom.belly_y, 0xffaa33);
  app.stage.addChild(g);
}

   const getRendererXY = (e: PointerEvent) => {
  const rect = (app.view as HTMLCanvasElement).getBoundingClientRect();
  const r = app.renderer.resolution; // devicePixelRatio
  return { x: (e.clientX - rect.left) * r, y: (e.clientY - rect.top) * r };
};


// replace your onPointerDown with this
const toLocalNorm = (model: any, x: number, y: number) => {
  const pt = new PIXI.Point(x, y);
  const local = model.worldTransform.applyInverse(pt);  // model-local px
  const halfW = model.width  / 2 || 1;
  const halfH = model.height / 2 || 1;
  const nx = local.x / halfW;
  const ny = -local.y / halfH; // invert Y so up is +
  return { nx, ny };
};

const inRect = (nx: number, ny: number, rx: number[], ry: number[]) => {
  const [x1, x2] = rx, [y1, y2] = ry;
  const minx = Math.min(x1, x2), maxx = Math.max(x1, x2);
  const miny = Math.min(y1, y2), maxy = Math.max(y1, y2);
  return nx >= minx && nx <= maxx && ny >= miny && ny <= maxy;
};

// "is the click even on the sprite area" guard
const insideModelBounds = (model: any, x: number, y: number) => {
  const b = model.getBounds?.();
  return !!b && x >= b.x && y >= b.y && x <= b.x + b.width && y <= b.y + b.height;
};
const onPointerDown = (e: PointerEvent) => {
  const now = Date.now();
  if (now - lastVoiceAtRef.current < 200) return;

  const { x, y } = getRendererXY(e);
  if (!insideModelBounds(model, x, y)) { report("tap", "outside-model"); return; }

  const settings = model.internalModel?.settings as any;
  const custom = settings?.hitAreasCustom;

  let isHead = false, isBody = false;

  if (custom && EFFECT) {
    const { nx, ny } = toLocalNorm(model, x, y);

    // ✅ BODY FIRST (expanded), then head (shrunk)
    const bodyHit  = inRect(nx, ny, EFFECT.body.rx,  EFFECT.body.ry);
    const bellyHit = EFFECT.belly ? inRect(nx, ny, EFFECT.belly.rx, EFFECT.belly.ry) : false;
    isBody = bodyHit || bellyHit;

    if (!isBody) {
      isHead = inRect(nx, ny, EFFECT.head.rx, EFFECT.head.ry);
    }
  } else {
    // Fallback to engine hit areas (may be tiny): still prioritize body
    const bodyNames = ["body","belly","Body","BUST","Bust"];
    const headNames = ["head","Head","FACE","Face"];
    isBody = bodyNames.some(n => model.hitTest?.(n, x, y));
    if (!isBody) isHead = headNames.some(n => model.hitTest?.(n, x, y));
  }

  if (isBody) {
    report("tap", "tap");
    try { model.motion("tap_body"); } catch {}
    lastVoiceAtRef.current = now;
    return;
  }
  if (isHead) {
    report("tap", "tap");
    try { model.motion("tap_body"); } catch {}
    lastVoiceAtRef.current = now;
    return;
  }

  // Final fallback: split by Y if neither rect caught
  const pt = new PIXI.Point(x, y);
  const local = model.worldTransform.applyInverse(pt);
  const h = model.height || 1;
  const top = model.y - h/2;
  const y01 = (local.y - top) / h;
  if (y01 > 0.45) { // lower half → body
    report("tap", "tap:body-fallback");
    try { model.motion("tap_body"); } catch {}
  } else {
    report("tap", "tap:head-fallback");
    try { model.motion("tap_body"); } catch {}
  }
  lastVoiceAtRef.current = now;
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
         if (hasDeform) setExpression(EXP.deformed, "idle:deformed");
  else { applyQuickDeformParams(); report("quick-deform", "idle:deformed"); }
  isDeformedRef.current = true;
        }
        rafRef.current = requestAnimationFrame(checkIdle);
      };
      rafRef.current = requestAnimationFrame(checkIdle);

    

    })().catch(console.error);

    return () => {
  
      destroyedRef.current = true;
      initializedRef.current = false;
    };
}, [modelUrl]); // ✅ only modelUrl


// UPDATE EXPRESSION when status changes
useEffect(() => {
  if (!modelRef.current) return;          // ⬅️ guard, don’t queue another apply
  if (isDeformedRef.current) isDeformedRef.current = false;
  setStatusLook(status);
}, [status]);


  return (
    <div className={["l2d-wrap", className || ""].join(" ").trim()} style={style}>
      <div ref={holderRef} className="l2d-canvas-holder" />
    </div>
  );
};

export default AnimeGirlMascot;
