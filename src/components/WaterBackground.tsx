'use client';

import { Canvas, createPortal, useFrame, useThree } from '@react-three/fiber';
import { useFBO } from '@react-three/drei';
import { useEffect, useRef, useState, type JSX } from 'react';
import * as THREE from 'three';

// Simulation shader - classic 2D water ripple algorithm
const simulationShader = `
  uniform sampler2D uState;
  uniform sampler2D uPrevState;
  uniform vec2 uSimResolution;
  uniform vec2 uScreenResolution;
  uniform vec2 uMouse;
  uniform float uMouseVelocity;
  uniform vec4 uClicks[5];
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec2 texel = 1.0 / uSimResolution;

    // Classic water ripple algorithm:
    // new = ((avg_neighbors * 2) - previous) * damping

    float left = texture2D(uState, vUv + vec2(-texel.x, 0.0)).r;
    float right = texture2D(uState, vUv + vec2(texel.x, 0.0)).r;
    float top = texture2D(uState, vUv + vec2(0.0, texel.y)).r;
    float bottom = texture2D(uState, vUv + vec2(0.0, -texel.y)).r;

    float average = (left + right + top + bottom) * 0.5;
    float prev = texture2D(uPrevState, vUv).r;

    float newHeight = average - prev;
    newHeight *= 0.99; // Damping

    // Boundary - clamp at edges
    if (vUv.x < texel.x || vUv.x > 1.0 - texel.x ||
        vUv.y < texel.y || vUv.y > 1.0 - texel.y) {
      newHeight = 0.0;
    }

    // Continuous ambient ripples for visibility
    float time = uTime * 0.5;
    float ambient = 0.0;
    ambient += sin(vUv.x * 15.0 + time) * cos(vUv.y * 12.0 - time * 0.8) * 0.01;
    ambient += sin((vUv.x + vUv.y) * 8.0 + time * 1.2) * 0.008;
    newHeight += ambient;

    // Mouse disturbance - stronger influence
    vec2 mouseUv = uMouse / uScreenResolution;
    mouseUv.y = 1.0 - mouseUv.y;
    float mouseDist = distance(vUv, mouseUv);

    if (uMouseVelocity > 0.01 && mouseDist < 0.1) {
      float influence = (1.0 - mouseDist / 0.1) * uMouseVelocity;
      newHeight += influence * 0.5;
    }

    // Click ripples - initial disturbance
    for(int i = 0; i < 5; i++) {
      if (uClicks[i].w > 0.5) {
        vec2 clickUv = uClicks[i].xy / uScreenResolution;
        clickUv.y = 1.0 - clickUv.y;
        float clickDist = distance(vUv, clickUv);
        float clickAge = uClicks[i].z;

        if (clickAge < 0.15 && clickDist < 0.12) {
          float ripple = (1.0 - clickDist / 0.12);
          ripple *= exp(-clickAge * 8.0);
          newHeight += ripple * 0.8;
        }
      }
    }

    gl_FragColor = vec4(newHeight, 0.0, 0.0, 1.0);
  }
`;

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Render shader - visualizes the water simulation
const fragmentShader = `
  uniform sampler2D uWaterState;
  uniform vec2 uSimResolution;
  varying vec2 vUv;

  void main() {
    vec2 texel = 1.0 / uSimResolution;

    // Sample height field
    float height = texture2D(uWaterState, vUv).r;

    // Calculate normals from height field for lighting
    float left = texture2D(uWaterState, vUv + vec2(-texel.x, 0.0)).r;
    float right = texture2D(uWaterState, vUv + vec2(texel.x, 0.0)).r;
    float top = texture2D(uWaterState, vUv + vec2(0.0, texel.y)).r;
    float bottom = texture2D(uWaterState, vUv + vec2(0.0, -texel.y)).r;

    vec3 normal = normalize(vec3(
      (left - right) * 2.0,
      (bottom - top) * 2.0,
      1.0
    ));

    // Lighting
    vec3 lightDir = normalize(vec3(0.5, 0.5, 1.0));
    float diffuse = max(dot(normal, lightDir), 0.0);
    float specular = pow(max(dot(reflect(-lightDir, normal), vec3(0.0, 0.0, 1.0)), 0.0), 32.0);

    // Color palette - enhanced visibility
    vec3 deepColor = vec3(0.02, 0.02, 0.02);
    vec3 waterColor = vec3(0.06, 0.10, 0.16);
    vec3 highlightColor = vec3(0.15, 0.22, 0.32);
    vec3 peakColor = vec3(0.25, 0.35, 0.45);

    // Base color with height variation
    float heightFactor = clamp(height * 8.0 + 0.5, 0.0, 1.0);
    vec3 color = mix(deepColor, waterColor, heightFactor);

    // Bright highlights on peaks and troughs
    float peakIntensity = smoothstep(0.02, 0.1, abs(height));
    color = mix(color, peakColor, peakIntensity * 0.8);

    // Lighting adds dimension
    color += diffuse * vec3(0.08, 0.12, 0.16) * 0.5;
    color += specular * vec3(0.5, 0.6, 0.7) * peakIntensity;

    // Fresnel rim lighting
    float fresnel = pow(1.0 - abs(dot(normal, vec3(0.0, 0.0, 1.0))), 2.5);
    color += fresnel * vec3(0.1, 0.15, 0.2) * 0.6;

    gl_FragColor = vec4(color, 1.0);
  }
`;

interface WaterPlaneProps {
  mousePos: THREE.Vector2;
  mouseVelocity: number;
  clicks: Array<{ pos: THREE.Vector2; time: number }>;
}

function WaterPlane({
  mousePos,
  mouseVelocity,
  clicks,
}: WaterPlaneProps): JSX.Element {
  const { viewport, size, gl, scene, camera } = useThree();

  // Simulation resolution
  const simRes = 256;

  // Create FBOs for ping-pong rendering
  const fbo1 = useFBO(simRes, simRes, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
  });

  const fbo2 = useFBO(simRes, simRes, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
  });

  const fboRef = useRef({ read: fbo1, write: fbo2, prev: fbo1 });

  // Simulation scene
  const simScene = useRef(new THREE.Scene());
  const simCamera = useRef(new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1));
  const simMesh = useRef<THREE.Mesh>();

  // Create simulation material
  const simMaterial = useRef(
    new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader: simulationShader,
      uniforms: {
        uState: { value: null },
        uPrevState: { value: null },
        uSimResolution: { value: new THREE.Vector2(simRes, simRes) },
        uScreenResolution: {
          value: new THREE.Vector2(size.width, size.height),
        },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uMouseVelocity: { value: 0 },
        uClicks: {
          value: [
            new THREE.Vector4(0, 0, 0, 0),
            new THREE.Vector4(0, 0, 0, 0),
            new THREE.Vector4(0, 0, 0, 0),
            new THREE.Vector4(0, 0, 0, 0),
            new THREE.Vector4(0, 0, 0, 0),
          ],
        },
        uTime: { value: 0 },
      },
    }),
  );

  // Create render material
  const renderMaterial = useRef(
    new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uWaterState: { value: null },
        uSimResolution: { value: new THREE.Vector2(simRes, simRes) },
      },
    }),
  );

  // Initialize simulation mesh
  useEffect(() => {
    if (!simMesh.current) {
      const geometry = new THREE.PlaneGeometry(2, 2);
      const mesh = new THREE.Mesh(geometry, simMaterial.current);
      simScene.current.add(mesh);
      simMesh.current = mesh;
    }
  }, []);

  useFrame((state) => {
    // Update uniforms
    simMaterial.current.uniforms.uMouse.value.copy(mousePos);
    simMaterial.current.uniforms.uMouseVelocity.value = mouseVelocity;
    simMaterial.current.uniforms.uScreenResolution.value.set(
      size.width,
      size.height,
    );
    simMaterial.current.uniforms.uTime.value = state.clock.elapsedTime;

    // Update clicks
    const now = Date.now();
    const clickData = clicks.slice(0, 5).map((c) => {
      const age = (now - c.time) / 1000;
      return new THREE.Vector4(c.pos.x, c.pos.y, age, 1);
    });
    while (clickData.length < 5) {
      clickData.push(new THREE.Vector4(0, 0, 999, 0));
    }
    simMaterial.current.uniforms.uClicks.value = clickData;

    // Run simulation - ping pong between FBOs
    simMaterial.current.uniforms.uState.value = fboRef.current.read.texture;
    simMaterial.current.uniforms.uPrevState.value = fboRef.current.prev.texture;

    gl.setRenderTarget(fboRef.current.write);
    gl.render(simScene.current, simCamera.current);
    gl.setRenderTarget(null);

    // Swap buffers
    const temp = fboRef.current.prev;
    fboRef.current.prev = fboRef.current.read;
    fboRef.current.read = fboRef.current.write;
    fboRef.current.write = temp;

    // Update render material
    renderMaterial.current.uniforms.uWaterState.value =
      fboRef.current.read.texture;
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <primitive attach="material" object={renderMaterial.current} />
    </mesh>
  );
}

export function WaterBackground(): JSX.Element {
  const [mousePos, setMousePos] = useState(new THREE.Vector2(0.5, 0.5));
  const [mouseVelocity, setMouseVelocity] = useState(0);
  const [clicks, setClicks] = useState<
    Array<{ pos: THREE.Vector2; time: number }>
  >([]);

  const prevMousePos = useRef(new THREE.Vector2(0.5, 0.5));
  const lastMoveTime = useRef(Date.now());

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const currentPos = new THREE.Vector2(e.clientX, e.clientY);
      const now = Date.now();
      const deltaTime = (now - lastMoveTime.current) / 1000;

      // Calculate velocity
      const distance = currentPos.distanceTo(prevMousePos.current);
      const velocity = deltaTime > 0 ? distance / deltaTime : 0;

      setMousePos(currentPos);
      setMouseVelocity(Math.min(velocity / 1000, 1)); // Normalize velocity

      prevMousePos.current.copy(currentPos);
      lastMoveTime.current = now;
    };

    const handleClick = (e: MouseEvent) => {
      const clickPos = new THREE.Vector2(e.clientX, e.clientY);
      setClicks((prev) => [...prev, { pos: clickPos, time: Date.now() }]);

      // Clean up old clicks after 3 seconds
      setTimeout(() => {
        setClicks((prev) => prev.filter((c) => Date.now() - c.time < 3000));
      }, 3000);
    };

    // Decay velocity over time
    const velocityDecay = setInterval(() => {
      setMouseVelocity((v) => Math.max(0, v * 0.9));
    }, 50);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      clearInterval(velocityDecay);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 1] }}
        orthographic
        style={{ height: '100%', width: '100%' }}
      >
        <WaterPlane
          clicks={clicks}
          mousePos={mousePos}
          mouseVelocity={mouseVelocity}
        />
      </Canvas>
    </div>
  );
}
