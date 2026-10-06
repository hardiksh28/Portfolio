import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import { RESUME_DATA } from "../data";

/* HDR colours (> 1) so they bloom. */
const AMBER = new THREE.Color(4.2, 2.1, 0.8);
const TEAL = new THREE.Color(0.5, 2.6, 2.8);
const WHITE = new THREE.Color(2.4, 2.3, 2.1);

/* ------------------------------------------------------------------ */
/* Fake volumetric light cone                                          */
/* ------------------------------------------------------------------ */
const beamVert = /* glsl */ `
  uniform float uHeight;
  varying float vH;
  varying vec3 vNormalV;
  varying vec3 vViewDir;
  void main() {
    vH = (position.y + uHeight * 0.5) / uHeight;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormalV = normalize(normalMatrix * normal);
    vViewDir = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
const beamFrag = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vH;
  varying vec3 vNormalV;
  varying vec3 vViewDir;
  void main() {
    float facing = pow(abs(dot(vNormalV, vViewDir)), 2.5);
    float fade = pow(vH, 1.6);
    gl_FragColor = vec4(uColor, facing * fade * uOpacity);
  }
`;

export function LightBeam({
  position,
  color = "#ffd2a0",
  height = 14,
  radius = 3.4,
  opacity = 0.22,
}: {
  position: [number, number, number];
  color?: string;
  height?: number;
  radius?: number;
  opacity?: number;
}) {
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
      uHeight: { value: height },
    }),
    [color, opacity, height],
  );
  return (
    <mesh position={position}>
      <cylinderGeometry args={[0.15, radius, height, 64, 1, true]} />
      <shaderMaterial
        vertexShader={beamVert}
        fragmentShader={beamFrag}
        args={[{ uniforms }]}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
        fog={false}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 00 / 01 — the liquid-metal core inside two rings              */
/* ------------------------------------------------------------------ */
export function Core() {
  const group = useRef<THREE.Group>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);

  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.06;
    if (ringA.current) {
      ringA.current.rotation.x += dt * 0.12;
      ringA.current.rotation.y += dt * 0.05;
    }
    if (ringB.current) {
      ringB.current.rotation.y -= dt * 0.09;
      ringB.current.rotation.z += dt * 0.04;
    }
  });

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[1.55, 128, 128]} />
        <MeshDistortMaterial
          color="#0c0c12"
          metalness={1}
          roughness={0.14}
          envMapIntensity={2.2}
          distort={0.36}
          speed={1.3}
        />
      </mesh>
      <mesh ref={ringA} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[3.1, 0.012, 12, 256]} />
        <meshBasicMaterial color={AMBER} toneMapped={false} />
      </mesh>
      <mesh ref={ringB} rotation={[0.3, 0.9, 0]}>
        <torusGeometry args={[3.7, 0.008, 12, 256]} />
        <meshBasicMaterial color={TEAL} toneMapped={false} />
      </mesh>
      <LightBeam position={[0, 6.2, 0]} />
      <pointLight color="#ffa64d" intensity={40} distance={12} position={[3.2, 1.2, 1.5]} />
      <pointLight color="#4fe0ff" intensity={30} distance={12} position={[-3.4, -0.8, 0.5]} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 02 — the Arsenal: one orbit per skill category                */
/* ------------------------------------------------------------------ */
export function Arsenal({ position }: { position: [number, number, number] }) {
  const orbits = useRef<(THREE.Group | null)[]>([]);
  const core = useRef<THREE.Mesh>(null);
  const palette = [TEAL, AMBER, WHITE, TEAL];

  useFrame((state, dt) => {
    orbits.current.forEach((g, i) => {
      if (g) g.rotation.y += dt * (0.18 + i * 0.07) * (i % 2 ? -1 : 1);
    });
    if (core.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 1.6) * 0.06;
      core.current.scale.setScalar(s);
    }
  });

  return (
    <group position={position}>
      <mesh ref={core}>
        <icosahedronGeometry args={[0.55, 4]} />
        <meshBasicMaterial color={TEAL} toneMapped={false} />
      </mesh>
      <pointLight color="#6ff5ff" intensity={30} distance={14} />
      {RESUME_DATA.skills.map((group, i) => {
        const r = 1.9 + i * 1.15;
        return (
          <group key={group.category} rotation={[0.35 + i * 0.32, 0, i * 0.55]}>
            <group ref={(el) => void (orbits.current[i] = el)}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[r, 0.006, 8, 200]} />
                <meshBasicMaterial color="#5a6470" transparent opacity={0.55} />
              </mesh>
              {group.items.map((item, k) => {
                const a = (k / group.items.length) * Math.PI * 2 + i;
                return (
                  <mesh key={item} position={[Math.cos(a) * r, 0, Math.sin(a) * r]}>
                    <sphereGeometry args={[0.085, 16, 16]} />
                    <meshBasicMaterial color={palette[i]} toneMapped={false} />
                  </mesh>
                );
              })}
            </group>
          </group>
        );
      })}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 03 — monoliths, one per project                               */
/* ------------------------------------------------------------------ */
const screenFrag = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  void main() {
    vec2 uv = vUv;
    float band = smoothstep(0.08, 0.0, abs(fract(uv.y - uTime * 0.08) - 0.5));
    float lines = 0.55 + 0.45 * sin(uv.y * 420.0);
    float glow = pow(1.0 - abs(uv.x - 0.5) * 2.0, 2.0) * pow(1.0 - abs(uv.y - 0.5) * 2.0, 0.6);
    float grain = hash(uv * 512.0 + uTime) * 0.08;
    vec3 col = uColor * (0.06 + glow * 0.32 + band * 0.9) * lines + grain * uColor * 0.4;
    gl_FragColor = vec4(col, 1.0);
  }
`;
const screenVert = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

export function Monolith({
  position,
  color,
  tilt = 0,
}: {
  position: [number, number, number];
  color: string;
  tilt?: number;
}) {
  const group = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);
  const base = useMemo(() => new THREE.Color(color), [color]);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uColor: { value: new THREE.Color() } }), []);
  const edgeMat = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false }), []);
  const world = useMemo(() => new THREE.Vector3(...position), [position]);

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    // Emissive shaders ignore fog, so fade the glow out with camera distance by hand.
    const fade = 1 - THREE.MathUtils.smoothstep(state.camera.position.distanceTo(world), 15, 32);
    uniforms.uColor.value.copy(base).multiplyScalar(2.2 * fade);
    edgeMat.color.copy(base).multiplyScalar(3 * fade);
    if (light.current) light.current.intensity = 18 * fade;
    if (group.current) {
      group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.6 + position[2]) * 0.12;
    }
  });

  const W = 2.3;
  const H = 5;
  const D = 0.32;
  return (
    <group ref={group} position={position} rotation={[0, tilt, 0]}>
      <mesh>
        <boxGeometry args={[W, H, D]} />
        <meshStandardMaterial color="#07070a" metalness={0.9} roughness={0.22} envMapIntensity={1.2} />
      </mesh>
      <mesh position={[0, 0, D / 2 + 0.002]}>
        <planeGeometry args={[W - 0.18, H - 0.18]} />
        <shaderMaterial vertexShader={screenVert} fragmentShader={screenFrag} args={[{ uniforms }]} toneMapped={false} />
      </mesh>
      {/* Glowing frame edges */}
      {[
        [0, H / 2, W, 0.025],
        [0, -H / 2, W, 0.025],
        [W / 2, 0, 0.025, H],
        [-W / 2, 0, 0.025, H],
      ].map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, D / 2 + 0.004]} material={edgeMat}>
          <planeGeometry args={[w, h]} />
        </mesh>
      ))}
      <pointLight ref={light} color={color} intensity={18} distance={9} position={[0, 0, 1.6]} />
      {/* Reflection pool under the slab */}
      <mesh position={[0, -H / 2 - 0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.8, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.035} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 04 — corridor of light gates to fly through                   */
/* ------------------------------------------------------------------ */
export function Gates({ start, count = 8, gap = 4 }: { start: number; count?: number; gap?: number }) {
  const refs = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const pulse = 0.55 + 0.45 * Math.sin(t * 2 - i * 0.7);
      m.color.copy(AMBER).multiplyScalar(0.35 + pulse * 0.65);
    });
  });
  const W = 5.4;
  const H = 3.6;
  const T = 0.03;
  return (
    <group>
      {Array.from({ length: count }, (_, i) => (
        <group key={i} position={[0, 0.2, start - i * gap]}>
          {[
            [0, H / 2, W, T],
            [0, -H / 2, W, T],
            [W / 2, 0, T, H],
            [-W / 2, 0, T, H],
          ].map(([x, y, w, h], k) => (
            <mesh key={k} position={[x, y, 0]}>
              <boxGeometry args={[w, h, T]} />
              <meshBasicMaterial ref={(m) => void (k === 0 && (refs.current[i] = m))} color={AMBER} toneMapped={false} />
            </mesh>
          ))}
        </group>
      ))}
      <LightBeam position={[0, 5, start - (count * gap) / 2]} height={10} radius={5} opacity={0.12} color="#ffb070" />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 05 — the eclipse on the horizon                               */
/* ------------------------------------------------------------------ */
const coronaFrag = /* glsl */ `
  uniform float uTime;
  uniform float uFade;
  varying vec2 vUv;
  void main() {
    vec2 p = vUv - 0.5;
    float r = length(p) * 2.0;
    float a = atan(p.y, p.x);
    float flicker = 0.85 + 0.15 * sin(a * 9.0 + uTime * 0.7) * sin(a * 4.0 - uTime * 0.4);
    float ring = smoothstep(0.62, 0.5, r) * smoothstep(0.36, 0.5, r);
    float halo = pow(max(0.0, 1.0 - r), 3.0) * flicker;
    vec3 col = vec3(3.6, 1.6, 0.55) * (ring * 1.25 + halo * 1.1);
    gl_FragColor = vec4(col * uFade, clamp(ring + halo, 0.0, 1.0) * uFade);
  }
`;

/* Sunlight column reflected on the glossy floor, like a low sun on water. */
const streakFrag = /* glsl */ `
  uniform float uTime;
  uniform float uFade;
  varying vec2 vUv;
  void main() {
    float x = (vUv.x - 0.5) * 2.0;
    float core = exp(-x * x * 18.0);
    float wide = exp(-x * x * 3.0) * 0.25;
    float ripple = 0.75 + 0.25 * sin(vUv.y * 140.0 - uTime * 2.0 + sin(vUv.x * 30.0));
    float len = pow(vUv.y, 1.4);
    float a = (core + wide) * len * ripple * uFade;
    gl_FragColor = vec4(vec3(3.2, 1.35, 0.45) * a, a);
  }
`;

const hazeFrag = /* glsl */ `
  uniform float uFade;
  varying vec2 vUv;
  void main() {
    float y = (vUv.y - 0.5) * 2.0;
    float x = (vUv.x - 0.5) * 2.0;
    float a = exp(-y * y * 6.0) * exp(-x * x * 5.0) * 0.55 * uFade;
    gl_FragColor = vec4(vec3(1.8, 0.7, 0.25) * a, a);
  }
`;

const fadeIn = (z: number) => THREE.MathUtils.smoothstep(-z, 92, 128);

export function Eclipse({ position }: { position: [number, number, number] }) {
  const group = useRef<THREE.Group>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uFade: { value: 0 } }), []);
  useFrame((s) => {
    uniforms.uTime.value = s.clock.elapsedTime;
    // This set piece ignores fog, so it is only switched on near the final shot.
    const fade = fadeIn(s.camera.position.z);
    uniforms.uFade.value = fade;
    if (group.current) group.current.visible = fade > 0.001;
  });
  const [x, y, z] = position;
  const floorY = -2.2;

  return (
    <group ref={group} visible={false}>
      <group position={[x, y, z]}>
        <mesh position={[0, 0, -0.5]}>
          <planeGeometry args={[52, 52]} />
          <shaderMaterial
            vertexShader={screenVert}
            fragmentShader={coronaFrag}
            args={[{ uniforms }]}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
            fog={false}
          />
        </mesh>
        <mesh>
          <circleGeometry args={[12.6, 96]} />
          <meshBasicMaterial color="#000000" fog={false} />
        </mesh>
      </group>
      <mesh position={[0, floorY, z + 30]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[400, 220]} />
        <meshStandardMaterial color="#060405" metalness={0.7} roughness={0.38} />
      </mesh>
      <mesh position={[x, floorY + 0.02, z + 46]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[26, 92]} />
        <shaderMaterial
          vertexShader={screenVert}
          fragmentShader={streakFrag}
          args={[{ uniforms }]}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          fog={false}
        />
      </mesh>
      {/* Horizon haze */}
      <mesh position={[0, floorY + 0.4, z + 4]}>
        <planeGeometry args={[400, 6]} />
        <shaderMaterial
          vertexShader={screenVert}
          fragmentShader={hazeFrag}
          args={[{ uniforms }]}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          fog={false}
        />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Atmosphere — dust drifting through every shot                       */
/* ------------------------------------------------------------------ */
const dustVert = /* glsl */ `
  attribute float aRand;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.y += sin(uTime * 0.25 + aRand * 40.0) * 0.4;
    p.x += cos(uTime * 0.18 + aRand * 25.0) * 0.3;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (14.0 + aRand * 26.0) * uPixelRatio / -mv.z;
    vAlpha = smoothstep(60.0, 4.0, -mv.z) * (0.35 + aRand * 0.65);
  }
`;
const dustFrag = /* glsl */ `
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d) * vAlpha;
    gl_FragColor = vec4(1.0, 0.86, 0.68, a * 0.8);
  }
`;

export function Dust({ count }: { count: number }) {
  const { geometry, uniforms } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const rand = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 22 + 2;
      pos[i * 3 + 2] = 24 - Math.random() * 270;
      rand[i] = Math.random();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));
    return {
      geometry: g,
      uniforms: { uTime: { value: 0 }, uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) } },
    };
  }, [count]);
  useFrame((s) => (uniforms.uTime.value = s.clock.elapsedTime));
  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        vertexShader={dustVert}
        fragmentShader={dustFrag}
        args={[{ uniforms }]}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
