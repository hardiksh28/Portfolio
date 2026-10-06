import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, Stars } from "@react-three/drei";
import { Bloom, ChromaticAberration, EffectComposer, Vignette } from "@react-three/postprocessing";
import type { ChromaticAberrationEffect } from "postprocessing";
import * as THREE from "three";
import { cinema } from "../lib/cinema";
import { Arsenal, Core, Dust, Eclipse, Gates, Monolith } from "./objects";

type Shot = { pos: [number, number, number]; look: [number, number, number]; tint: string };

/** One camera "shot" per scene, in the same order as SCENES. */
const SHOTS: Shot[] = [
  { pos: [0, 0.25, 9.5], look: [0, 0, 0], tint: "#05060a" }, // opening titles
  { pos: [1.4, 0.4, 6.2], look: [1.5, 0.1, -1], tint: "#0a0708" }, // protagonist
  { pos: [0, 5, -21.5], look: [0, 0.8, -34], tint: "#03090b" }, // arsenal
  { pos: [1.1, 0.5, -52], look: [-1.2, 0.2, -60], tint: "#07060a" }, // reel I
  { pos: [-1.1, 0.5, -70], look: [1.2, 0.2, -78], tint: "#040809" }, // reel II
  { pos: [1.1, 0.5, -88], look: [-1.2, 0.2, -96], tint: "#06080a" }, // reel III
  { pos: [-1.8, 0.3, -106], look: [-1.8, 0.2, -130], tint: "#0a0604" }, // origins
  { pos: [0, 0.6, -152], look: [0, 4.5, -230], tint: "#0c0503" }, // credits
  { pos: [-4, 1.4, -160], look: [-14, 5, -230], tint: "#0c0503" }, // casting
];

const smootherstep = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

function CameraRig() {
  const { camera, scene } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  const look = useRef(new THREE.Vector3(0, 0, 0));
  const roll = useRef(0);
  const tmp = useMemo(
    () => ({
      p: new THREE.Vector3(),
      l: new THREE.Vector3(),
      a: new THREE.Vector3(),
      c: new THREE.Color(),
      tints: SHOTS.map((s) => new THREE.Color(s.tint)),
    }),
    [],
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const s = THREE.MathUtils.clamp(cinema.scene, 0, SHOTS.length - 1);
    const i = Math.floor(s);
    const j = Math.min(i + 1, SHOTS.length - 1);
    const f = smootherstep(s - i);

    tmp.p.fromArray(SHOTS[i].pos).lerp(tmp.a.fromArray(SHOTS[j].pos), f);
    tmp.l.fromArray(SHOTS[i].look).lerp(tmp.a.fromArray(SHOTS[j].look), f);
    tmp.c.copy(tmp.tints[i]).lerp(tmp.tints[j], f);

    // Opening dolly-in: start high and far back, glide into the first shot.
    const intro = 1 - easeOutCubic(cinema.intro);
    tmp.p.y += intro * 4;
    tmp.p.z += intro * 30;

    // Handheld sway + pointer parallax.
    const t = state.clock.elapsedTime;
    tmp.p.x += cinema.pointerX * 0.45 + Math.sin(t * 0.55) * 0.05;
    tmp.p.y += cinema.pointerY * 0.28 + Math.sin(t * 0.83 + 1.3) * 0.04;

    const k = 1 - Math.exp(-2.6 * dt);
    cam.position.lerp(tmp.p, k);
    look.current.lerp(tmp.l, k);
    cam.lookAt(look.current);

    // Dutch tilt + lens breathing driven by scroll speed.
    const v = THREE.MathUtils.clamp(cinema.velocity, -60, 60);
    roll.current += (v * -0.0012 - roll.current) * k;
    cam.rotateZ(roll.current);
    const fov = 38 + Math.min(Math.abs(v) * 0.16, 9);
    cam.fov += (fov - cam.fov) * k;
    cam.updateProjectionMatrix();

    (scene.background as THREE.Color).copy(tmp.c);
    scene.fog?.color.copy(tmp.c);
  });
  return null;
}

/** Keeps the starfield centred on the camera so it never runs out. */
function FollowStars() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ camera }) => ref.current?.position.copy(camera.position));
  return (
    <group ref={ref}>
      <Stars radius={90} depth={40} count={2500} factor={3.2} saturation={0} fade speed={0.4} />
    </group>
  );
}

function Grade() {
  const ca = useRef<ChromaticAberrationEffect>(null);
  const offset = useMemo(() => new THREE.Vector2(0.0006, 0.0006), []);
  useFrame(() => {
    const amt = 0.0006 + Math.min(Math.abs(cinema.velocity) * 0.00008, 0.004);
    if (ca.current) ca.current.offset.set(amt, amt * 0.6);
  });
  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur intensity={1.15} luminanceThreshold={0.32} luminanceSmoothing={0.25} radius={0.78} />
      <ChromaticAberration ref={ca} offset={offset} radialModulation modulationOffset={0.25} />
      <Vignette offset={0.22} darkness={0.82} />
    </EffectComposer>
  );
}

export default function Experience({ lite }: { lite: boolean }) {
  return (
    <>
      <color attach="background" args={["#05060a"]} />
      <fogExp2 attach="fog" args={["#05060a", 0.034]} />

      <ambientLight intensity={0.12} />
      <directionalLight position={[6, 8, 4]} intensity={1.4} color="#ffcf9e" />
      <directionalLight position={[-8, -2, -6]} intensity={0.9} color="#5fe3ff" />

      {/* Studio lighting baked into an env map — teal & orange grade for reflections */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.4} color="#ffb35c" position={[6, 1, 2]} rotation-y={-Math.PI / 2.4} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={2} color="#4fd8e8" position={[-6, 0, -1]} rotation-y={Math.PI / 2.4} scale={[10, 3, 1]} />
        <Lightformer form="circle" intensity={2.5} color="#fff3e2" position={[0, 7, 0]} rotation-x={Math.PI / 2} scale={6} />
        <Lightformer form="rect" intensity={0.5} color="#ffffff" position={[0, -4, 4]} scale={[14, 1, 1]} />
      </Environment>

      <CameraRig />
      <FollowStars />
      <Dust count={lite ? 900 : 2200} />

      <Core />
      <Arsenal position={[0, 0, -34]} />
      <Monolith position={[-3, 0, -60]} color="#ff9a3d" tilt={0.28} />
      <Monolith position={[3, 0, -78]} color="#3fd6e6" tilt={-0.28} />
      <Monolith position={[-3, 0, -96]} color="#e8e2d4" tilt={0.28} />
      <Gates start={-112} />
      <Eclipse position={[0, 9, -232]} />

      <Grade />
    </>
  );
}
