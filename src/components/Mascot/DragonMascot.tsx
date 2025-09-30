import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import "./DragonMascot.css";

export type DragonStatus = "idle" | "loading" | "data" | "nodata";

interface Props {
  status: DragonStatus;
  className?: string;
  style?: React.CSSProperties;
}

const DragonMascot: React.FC<Props> = ({ status, className, style }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // three refs
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rafRef = useRef<number | null>(null);

  // dragon parts
  const dragonRef = useRef<THREE.Group | null>(null);
  const partsRef = useRef<any>({});
  const basePoseRef = useRef<any>(null);

  // orbit & look
  const isMouseDownRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const targetRotRef = useRef({ x: 0, y: 0 });
  const rotRef = useRef({ x: 0, y: 0 });

  const raycaster = useRef(new THREE.Raycaster()).current;
  const mouseNDC = useRef(new THREE.Vector2(0, 0)).current;
  const lookTarget = useRef(new THREE.Vector3()).current;
  const lookYawBody = useRef(0);
  const lookYawHead = useRef(0);
  const lookPitchHead = useRef(0);

  const LOOK = {
    maxYawBody: 0.30,
    maxYawHead: 0.60,
    maxPitchHead: 0.35,
    bodyShare: 0.45,
    damp: 0.12,
    pupilMax: 0.65,
  };

  // theme from the latest HTML
  const THEME = {
    body:   0x1fa34a,
    belly:  0xf3d36a,
    spines: 0xf1c40f,
    fin:    0xc21807,
    horn:   0xfff3cf,
    claw:   0xf6d34a,
    eye:    0xffffff,
    pupil:  0x111111,
  };

  // current phase (derived from status)
  const phaseRef = useRef<"idle" | "dance" | "fly" | "roar" | "sit">("idle");

  // map status -> phase
  useEffect(() => {
    if (status === "idle") phaseRef.current = "idle";
    if (status === "loading") phaseRef.current = "dance";
    if (status === "data") phaseRef.current = "fly";
    if (status === "nodata") {
      phaseRef.current = "roar";
      const t = setTimeout(() => {
        if (phaseRef.current === "roar") phaseRef.current = "sit";
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [status]);

  // init three scene
  useEffect(() => {
    const host = containerRef.current!;
    const scene = new THREE.Scene();
    scene.background = null;
    scene.fog = new THREE.Fog(0x000000, 100, 300);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60,
      host.clientWidth / host.clientHeight,
      1,
      1000
    );
    camera.position.set(0, 20, 80);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // modern color-space API (r152+)
    (renderer as any).outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    host.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // lights
    scene.add(new THREE.AmbientLight(0x404040, 0.3));

    const dir = new THREE.DirectionalLight(0xffffff, 1);
    dir.position.set(50, 50, 50);
    dir.castShadow = true;
    dir.shadow.mapSize.set(2048, 2048);
    scene.add(dir);

    const gold = new THREE.PointLight(0xffd700, 2, 100);
    gold.position.set(0, 10, 20);
    scene.add(gold);

    const red = new THREE.PointLight(0xff4500, 1.5, 80);
    red.position.set(-20, 5, 10);
    scene.add(red);

    const rim = new THREE.DirectionalLight(0xff6600, 0.8);
    rim.position.set(-50, 20, -30);
    scene.add(rim);

    // dragon build
    const dragon = new THREE.Group();
    dragonRef.current = dragon;
    scene.add(dragon);

    const parts: any = {};
    partsRef.current = parts;

    // ==== HEAD ====
    const headGroup = new THREE.Group();
    headGroup.position.y = 15;

    // head (green)
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(7.5, 22, 22),
      new THREE.MeshPhongMaterial({ color: THEME.body, shininess: 80, specular: 0xffffff })
    );
    head.scale.set(1.25, 1, 1.55);
    head.castShadow = head.receiveShadow = true;
    headGroup.add(head);

    // snout
    const snout = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 4.2, 8, 20),
      new THREE.MeshPhongMaterial({ color: 0x2aa95a })
    );
    snout.rotation.x = Math.PI / 2;
    snout.position.set(0, 0.3, 8.2);
    snout.castShadow = true;
    headGroup.add(snout);

    // tongue (no CapsuleGeometry in older builds → cylinder + sphere)
    {
      const tongueMat = new THREE.MeshPhongMaterial({ color: 0xc62828 });
      const tongue = new THREE.Group();
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 3.6, 16), tongueMat);
      shaft.rotation.x = Math.PI / 2;
      tongue.add(shaft);
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 16), tongueMat);
      tip.position.z = 1.8 + 0.6;
      tongue.add(tip);
      tongue.rotation.x = Math.PI / 2.2;
      tongue.position.set(0, -0.5, 10.5);
      headGroup.add(tongue);
    }

    // eyes + pupils (vertical-ish pupils)
    const eyeGeo = new THREE.SphereGeometry(1.5, 16, 16);
    const leftEye = new THREE.Mesh(eyeGeo, new THREE.MeshPhongMaterial({ color: THEME.eye }));
    const rightEye = new THREE.Mesh(eyeGeo, new THREE.MeshPhongMaterial({ color: THEME.eye }));
    leftEye.position.set(-3.1, 2.4, 8.8);
    rightEye.position.set(3.1, 2.4, 8.8);
    headGroup.add(leftEye, rightEye);

    const pupilGeo = new THREE.SphereGeometry(0.55, 12, 12);
    const pupilMat = new THREE.MeshPhongMaterial({ color: THEME.pupil });
    const leftP = new THREE.Mesh(pupilGeo, pupilMat);
    const rightP = new THREE.Mesh(pupilGeo, pupilMat);
    leftP.scale.set(0.7, 1.8, 0.7);
    rightP.scale.set(0.7, 1.8, 0.7);
    leftP.position.set(0, 0.15, 1.15);
    rightP.position.set(0, 0.15, 1.15);
    leftEye.add(leftP);
    rightEye.add(rightP);

    // horns
    const hornMat = new THREE.MeshPhongMaterial({ color: THEME.horn });
    const lh = new THREE.Mesh(new THREE.ConeGeometry(1.2, 4.4, 10), hornMat);
    const rh = new THREE.Mesh(new THREE.ConeGeometry(1.2, 4.4, 10), hornMat);
    lh.position.set(-2.4, 8.8, -1.2);
    rh.position.set(2.4, 8.8, -1.2);
    lh.rotation.x = rh.rotation.x = Math.PI / 9;
    headGroup.add(lh, rh);

    // whiskers (tubes)
    const makeWhisker = (side = 1) => {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(1.4 * side, 1.2, 9.5),
        new THREE.Vector3(5.0 * side, 2.0, 12.0),
        new THREE.Vector3(9.0 * side, 3.5, 9.2),
      ]);
      const geo = new THREE.TubeGeometry(curve, 20, 0.18, 8, false);
      return new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ color: THEME.horn, shininess: 30 }));
    };
    headGroup.add(makeWhisker(1), makeWhisker(-1));

    // short golden spines behind head
    for (let i = 0; i < 5; i++) {
      const c = new THREE.Mesh(
        new THREE.ConeGeometry(0.9, 2.0, 6),
        new THREE.MeshPhongMaterial({ color: THEME.spines })
      );
      c.position.set(0, 6.6 + i * 0.25, -1.5 - i * 0.9);
      headGroup.add(c);
    }

    parts.head = headGroup;
    parts.leftPupil = leftP;
    parts.rightPupil = rightP;
    parts.leftEye = leftEye;
    parts.rightEye = rightEye;
    dragon.add(headGroup);

    // ==== BODY (S-curve) ====
    const pts = [
      new THREE.Vector3(0, 12, 5),
      new THREE.Vector3(4, 10, -2),
      new THREE.Vector3(-5, 8, -12),
      new THREE.Vector3(6, 6, -22),
      new THREE.Vector3(-4, 4, -34),
      new THREE.Vector3(3, 3, -48),
      new THREE.Vector3(0, 2, -64),
    ];
    const path = new THREE.CatmullRomCurve3(pts);

    const bodyGeo = new THREE.TubeGeometry(path, 120, 3.2, 12, false);
    const bodyMat = new THREE.MeshPhongMaterial({ color: THEME.body, shininess: 40 });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.castShadow = bodyMesh.receiveShadow = true;
    parts.body = bodyMesh;
    dragon.add(bodyMesh);

    // belly (slightly offset tube)
    const bellyPts = pts.map((p) => p.clone().add(new THREE.Vector3(0, -1.2, 0)));
    const bellyGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(bellyPts), 120, 1.85, 10, false);
    const bellyMat = new THREE.MeshPhongMaterial({ color: THEME.belly, shininess: 10 });
    const belly = new THREE.Mesh(bellyGeo, bellyMat);
    belly.castShadow = belly.receiveShadow = true;
    dragon.add(belly);

    // long spines along body
    const spines = new THREE.Group();
    for (let t = 0.04; t <= 0.98; t += 0.06) {
      const p = path.getPointAt(t);
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.9, 2.2, 6),
        new THREE.MeshPhongMaterial({ color: THEME.spines })
      );
      cone.position.set(p.x, p.y + 3.3, p.z);
      spines.add(cone);
    }
    parts.spines = spines;
    dragon.add(spines);

    // ==== LEGS ====
    const legGeo = new THREE.CylinderGeometry(1.4, 2.0, 8, 12);
    const legMat = new THREE.MeshPhongMaterial({ color: THEME.body });
    const legPos: Array<[number, number, number]> = [
      [-4, -2, 2],
      [4, -2, 2],
      [-4, -2, -12],
      [4, -2, -12],
    ];
    parts.legs = [];
    legPos.forEach((pos) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(...pos);
      leg.castShadow = true;
      dragon.add(leg);
      parts.legs.push(leg);

      // claws (gold)
      const clawGeo = new THREE.ConeGeometry(0.5, 2.0, 6);
      const clawMat = new THREE.MeshPhongMaterial({ color: THEME.claw });
      for (let i = 0; i < 4; i++) {
        const claw = new THREE.Mesh(clawGeo, clawMat);
        claw.position.set(pos[0] + (i - 1.5) * 0.7, pos[1] - 5, pos[2] + 1);
        claw.rotation.x = Math.PI;
        dragon.add(claw);
      }
    });

    // ==== TAIL ====
    const tailGroup = new THREE.Group();
    for (let i = 0; i < 10; i++) {
      const r = 3 - i * 0.28;
      const seg = new THREE.Mesh(
        new THREE.SphereGeometry(r, 12, 12),
        new THREE.MeshPhongMaterial({ color: i > 7 ? 0xc9df69 : THEME.body })
      );
      seg.position.set(0, -i * 1.6, -30 - i * 4);
      seg.scale.set(1, 0.85, 1.5);
      seg.castShadow = true;
      tailGroup.add(seg);
    }
    const fin = new THREE.Mesh(
      new THREE.ConeGeometry(2.6, 4.8, 6),
      new THREE.MeshPhongMaterial({ color: THEME.spines })
    );
    fin.position.set(0, -1.6 * 10, -30 - 4 * 10 - 2.5);
    fin.rotation.x = Math.PI;
    tailGroup.add(fin);

    parts.tail = tailGroup;
    dragon.add(tailGroup);

    // ==== WINGS (red fins) ====
    const wingGroup = new THREE.Group();
    const finMat = new THREE.MeshPhongMaterial({
      color: THEME.fin,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
    });
    const leftWing = new THREE.Mesh(new THREE.ConeGeometry(5, 12, 3), finMat);
    leftWing.position.set(-6, 9, -2);
    leftWing.rotation.z = -Math.PI / 3;
    leftWing.castShadow = true;

    const rightWing = new THREE.Mesh(new THREE.ConeGeometry(5, 12, 3), finMat);
    rightWing.position.set(6, 9, -2);
    rightWing.rotation.z = Math.PI / 3;
    rightWing.castShadow = true;

    wingGroup.add(leftWing, rightWing);
    parts.wings = wingGroup;
    parts.leftWing = leftWing;
    parts.rightWing = rightWing;
    dragon.add(wingGroup);

    // base pose snapshot (from actual parts)
    basePoseRef.current = {
      dragonY: dragon.position.y || 0,
      dragonRotY: dragon.rotation.y || 0,
      legs: (parts.legs || []).map((leg: THREE.Mesh) => ({
        rx: leg.rotation.x,
        ry: leg.rotation.y,
        rz: leg.rotation.z,
        pos: [leg.position.x, leg.position.y, leg.position.z],
      })),
      leftWing: { x: leftWing.rotation.x, y: leftWing.rotation.y, z: leftWing.rotation.z },
      rightWing: { x: rightWing.rotation.x, y: rightWing.rotation.y, z: rightWing.rotation.z },
      head: { x: headGroup.rotation.x, y: headGroup.rotation.y, z: headGroup.rotation.z },
    };

    // events
    const onDown = (e: MouseEvent) => {
      isMouseDownRef.current = true;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onUp = () => { isMouseDownRef.current = false; };
    const onMove = (e: MouseEvent) => {
      if (isMouseDownRef.current) {
        targetRotRef.current.y += (e.clientX - lastMouseRef.current.x) * 0.01;
        targetRotRef.current.x += (e.clientY - lastMouseRef.current.y) * 0.01;
        targetRotRef.current.x = Math.max(-1.5, Math.min(1.5, targetRotRef.current.x));
        lastMouseRef.current = { x: e.clientX, y: e.clientY };
      }
      // mouse for look-at
      const rect = renderer.domElement.getBoundingClientRect();
      mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    const onWheel = (e: WheelEvent) => {
      if (!cameraRef.current) return;
      cameraRef.current.position.z += e.deltaY * 0.1;
      cameraRef.current.position.z = Math.max(30, Math.min(150, cameraRef.current.position.z));
    };
    const onResize = () => {
      if (!rendererRef.current || !cameraRef.current) return;
      const w = host.clientWidth;
      const h = host.clientHeight;
      rendererRef.current.setSize(w, h);
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
    };

    renderer.domElement.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mousemove", onMove);
    renderer.domElement.addEventListener("wheel", onWheel as EventListener, { passive: true });
    window.addEventListener("resize", onResize);

    // animate
    const clock = new THREE.Clock();

    function computeLookTarget() {
      if (!parts.head || !cameraRef.current) return;
      const headWorld = new THREE.Vector3();
      parts.head.getWorldPosition(headWorld);
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -headWorld.y);
      raycaster.setFromCamera(mouseNDC, cameraRef.current);
      const hit = raycaster.ray.intersectPlane(plane, new THREE.Vector3());
      if (hit) {
        lookTarget.copy(hit);
      } else {
        lookTarget
          .set(0, headWorld.y, -50)
          .applyMatrix4(cameraRef.current.matrixWorld);
      }
    }

    function updateLook() {
      if (!parts.head) return;
      computeLookTarget();
      const headWorld = new THREE.Vector3();
      parts.head.getWorldPosition(headWorld);
      const dir = new THREE.Vector3().subVectors(lookTarget, headWorld);
      const yaw = Math.atan2(dir.x, dir.z);
      const pitch = Math.atan2(dir.y, Math.sqrt(dir.x * dir.x + dir.z * dir.z));

      const yawBodyTarget = THREE.MathUtils.clamp(yaw * LOOK.bodyShare, -LOOK.maxYawBody, LOOK.maxYawBody);
      const yawHeadTarget = THREE.MathUtils.clamp(yaw, -LOOK.maxYawHead, LOOK.maxYawHead);
      const pitchHeadTarget = THREE.MathUtils.clamp(pitch, -LOOK.maxPitchHead, LOOK.maxPitchHead);

      lookYawBody.current  = THREE.MathUtils.lerp(lookYawBody.current,  yawBodyTarget,  LOOK.damp);
      lookYawHead.current  = THREE.MathUtils.lerp(lookYawHead.current,  yawHeadTarget,  LOOK.damp);
      lookPitchHead.current= THREE.MathUtils.lerp(lookPitchHead.current, pitchHeadTarget, LOOK.damp);

      const nx = THREE.MathUtils.clamp(lookYawHead.current / LOOK.maxYawHead, -1, 1);
      const ny = THREE.MathUtils.clamp(lookPitchHead.current / LOOK.maxPitchHead, -1, 1);
      const px = nx * LOOK.pupilMax;
      const py = ny * LOOK.pupilMax;
      if (parts.leftPupil)  parts.leftPupil.position.set(px, py, 1.2);
      if (parts.rightPupil) parts.rightPupil.position.set(px, py, 1.2);
    }

    function animate() {
      rafRef.current = requestAnimationFrame(animate);

      // base idle rotate when not dragging
      if (!isMouseDownRef.current && phaseRef.current === "idle") {
        targetRotRef.current.y += 0.003;
      }
      rotRef.current.x += (targetRotRef.current.x - rotRef.current.x) * 0.05;
      rotRef.current.y += (targetRotRef.current.y - rotRef.current.y) * 0.05;

      updateLook();

      if (dragonRef.current) {
        let bodyY = rotRef.current.y + lookYawBody.current;
        dragonRef.current.rotation.x = rotRef.current.x;
        dragonRef.current.rotation.y = bodyY;

        const t = clock.getElapsedTime();

        // idle micro motions
        if (phaseRef.current === "idle") {
          dragonRef.current.position.y = Math.sin(t * 1.0) * 2;
          if (parts.wings) {
            const wingX = Math.sin(t * 0.8) * 0.1;
            parts.leftWing.rotation.x = wingX;
            parts.rightWing.rotation.x = wingX;
          }
        }

        // dance
        if (phaseRef.current === "dance") {
          dragonRef.current.position.y = Math.sin(t * 6) * 2;
          dragonRef.current.rotation.z = Math.sin(t * 6) * THREE.MathUtils.degToRad(6);
          if (parts.tail) parts.tail.rotation.x = Math.sin(t * 8) * 0.2;
        } else {
          dragonRef.current.rotation.z = 0;
        }

        // fly (wing flap + bob + tail waves)
        if (phaseRef.current === "fly") {
          dragonRef.current.position.y = Math.sin(t * 2.8) * 3.5;
          const flap = Math.sin(t * 10) * 0.5;
          parts.leftWing.rotation.z = -Math.PI / 3 + flap * 0.24;
          parts.rightWing.rotation.z = Math.PI / 3 - flap * 0.24;

          if (parts.tail) {
            const ch = parts.tail.children as THREE.Object3D[];
            for (let i = 0; i < ch.length; i++) {
              ch[i].rotation.y = Math.sin(t * 6 + i * 0.45) * 0.35;
              ch[i].rotation.x = Math.cos(t * 4 + i * 0.35) * 0.10;
            }
          }
        } else {
          // relax wing z back to base when not flying
          parts.leftWing.rotation.z = THREE.MathUtils.lerp(parts.leftWing.rotation.z, -Math.PI / 3, 0.1);
          parts.rightWing.rotation.z = THREE.MathUtils.lerp(parts.rightWing.rotation.z, Math.PI / 3, 0.1);
        }

        // roar → stronger head pitch, bob
        if (phaseRef.current === "roar") {
          parts.head.rotation.x = THREE.MathUtils.lerp(parts.head.rotation.x, 0.25 + lookPitchHead.current, 0.15);
          dragonRef.current.position.y = Math.sin(t * 4) * 1.5;
        } else {
          parts.head.rotation.x = THREE.MathUtils.lerp(
            parts.head.rotation.x,
            (basePoseRef.current?.head?.x || 0) + lookPitchHead.current,
            0.2
          );
          parts.head.rotation.y = THREE.MathUtils.lerp(
            parts.head.rotation.y,
            (basePoseRef.current?.head?.y || 0) + lookYawHead.current,
            0.2
          );
        }

        // sit
        if (phaseRef.current === "sit") {
          dragonRef.current.position.y = THREE.MathUtils.lerp(dragonRef.current.position.y, -6, 0.08);
          (parts.legs as THREE.Mesh[]).forEach((leg) => {
            leg.rotation.x = THREE.MathUtils.lerp(leg.rotation.x, Math.PI / 2, 0.1);
            leg.position.y = THREE.MathUtils.lerp(leg.position.y, -3, 0.1);
          });
          parts.leftWing.rotation.z = THREE.MathUtils.lerp(parts.leftWing.rotation.z, -0.1, 0.08);
          parts.rightWing.rotation.z = THREE.MathUtils.lerp(parts.rightWing.rotation.z, 0.1, 0.08);
        }
      }

      renderer.render(scene, camera);
    }

    animate();

    // cleanup
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("mousedown", onDown);
      renderer.domElement.removeEventListener("wheel", onWheel as any);
      renderer.dispose();
      host.removeChild(renderer.domElement);

      scene.traverse((obj: THREE.Object3D) => {
        if ((obj as THREE.Mesh).geometry) {
          const geo = (obj as THREE.Mesh).geometry as THREE.BufferGeometry;
          geo.dispose?.();
        }
        const mat = (obj as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) {
          mat.forEach((m: THREE.Material) => m.dispose?.());
        } else {
          mat?.dispose?.();
        }
      });
    };
  }, []); // mount once

  return (
    <div className={["dragon3d-wrap", className || ""].join(" ").trim()} style={style}>
      <div ref={containerRef} className="dragon3d-canvas-holder" />
    </div>
  );
};

export default DragonMascot;
