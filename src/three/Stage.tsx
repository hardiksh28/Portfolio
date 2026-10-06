import { Component, Suspense, useMemo, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import Experience from "./Experience";

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err: unknown) {
    console.warn("3D stage disabled:", err);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Fixed, full-screen WebGL backdrop. Falls back to a CSS gradient without WebGL. */
export default function Stage() {
  const webgl = useMemo(hasWebGL, []);
  const lite = useMemo(() => window.innerWidth < 768 || navigator.hardwareConcurrency <= 4, []);

  return (
    <div className="stage" aria-hidden="true">
      <div className="stage-fallback" />
      {webgl && (
        <SceneBoundary>
          <Canvas
            dpr={lite ? [1, 1.4] : [1, 1.75]}
            gl={{ antialias: false, powerPreference: "high-performance" }}
            camera={{ fov: 38, near: 0.1, far: 420, position: [0, 4, 40] }}
          >
            <Suspense fallback={null}>
              <Experience lite={lite} />
            </Suspense>
          </Canvas>
        </SceneBoundary>
      )}
    </div>
  );
}
