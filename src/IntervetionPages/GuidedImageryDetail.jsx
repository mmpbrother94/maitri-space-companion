import React, { useEffect, useRef, useState, Suspense, useMemo } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Sparkles, Moon, ChevronRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

const MotionDiv = motion.div;
const MotionButton = motion.button;
const MotionH1 = motion.h1;
const MotionParagraph = motion.p;

/* ========================================================================
   AUDIO ENGINE (shared context + master bus)
   ======================================================================== */
let __ctx = null;
let __bus = null;
const __voices = new Set();
const __handles = new Set();
let __soundChecked = false;
let __gestureReady = false;

const pushHandle = (type, id) => {
  __handles.add({ type, id });
};

const clearHandles = () => {
  for (const handle of __handles) {
    if (handle.type === "interval") clearInterval(handle.id);
    else clearTimeout(handle.id);
  }
  __handles.clear();
};

const stopVoices = () => {
  for (const voice of __voices) {
    try {
      voice.osc.stop();
    } catch {
      /* noop */
    }
    try {
      voice.osc.disconnect();
      voice.g.disconnect();
      voice.pan.disconnect();
    } catch {
      /* noop */
    }
  }
  __voices.clear();
};

const getCtx = () => {
  if (typeof window === "undefined") return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!__ctx) __ctx = new Ctx();
  return __ctx;
};

const ensureBus = () => {
  if (__bus) return __bus;
  const ctx = getCtx();
  if (!ctx) return null;

  const master = ctx.createGain();
  master.gain.value = 0.35;

  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -10;
  comp.ratio.value = 12;
  comp.attack.value = 0.003;
  comp.release.value = 0.25;

  const analyser = ctx.createAnalyser();
  analyser.fftSize = 1024;
  const meterBuf = new Uint8Array(analyser.frequencyBinCount);

  master.connect(comp).connect(analyser).connect(ctx.destination);

  const split = ctx.createChannelSplitter(2);
  const merge = ctx.createChannelMerger(2);
  const left = ctx.createDelay(1.0);
  const right = ctx.createDelay(1.0);
  const lfb = ctx.createGain();
  const rfb = ctx.createGain();
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";

  master.connect(split);
  split.connect(left, 0);
  split.connect(right, 1);
  left.connect(rfb).connect(right);
  right.connect(lfb).connect(left);
  left.connect(merge, 0, 0);
  right.connect(merge, 0, 1);
  merge.connect(lp).connect(comp);

  __bus = { master, comp, analyser, meterBuf, left, right, lfb, rfb, lp };
  return __bus;
};

const unlockAudioSync = () => {
  const ctx = getCtx();
  if (!ctx) return "running";
  try {
    if (ctx.state === "suspended") ctx.resume();
  } catch {
    /* noop */
  }
  try {
    const buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
    buffer.getChannelData(0)[0] = 1e-6;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(ctx.destination);
    src.start(0);
    pushHandle("timeout", setTimeout(() => {
      try {
        src.stop();
        src.disconnect();
      } catch {
        /* noop */
      }
    }, 20));
  } catch {
    /* noop */
  }
  ensureBus();
  return ctx.state;
};

const setupGestureUnlock = () => {
  if (typeof window === "undefined" || __gestureReady) return;
  const handler = () => {
    try {
      unlockAudioSync();
    } catch {
      /* noop */
    }
  };
  window.addEventListener("pointerdown", handler, { once: true });
  window.addEventListener("touchend", handler, { once: true });
  window.addEventListener("keydown", handler, { once: true });
  __gestureReady = true;
};

const playSoundCheckPing = () => {
  if (__soundChecked) return;
  const ctx = getCtx();
  const bus = ensureBus();
  if (!ctx || !bus) return;

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = 440;
  const gate = ctx.createGain();
  gate.gain.setValueAtTime(0, ctx.currentTime);
  gate.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.05);
  gate.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
  osc.connect(gate).connect(bus.master);

  const noise = ctx.createBufferSource();
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
  const ch = buffer.getChannelData(0);
  let w = 0;
  for (let i = 0; i < ch.length; i += 1) {
    w = w * 0.98 + (Math.random() * 2 - 1) * 0.02;
    ch[i] = w * 0.05;
  }
  noise.buffer = buffer;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0, ctx.currentTime);
  noiseGain.gain.linearRampToValueAtTime(0.24, ctx.currentTime + 0.05);
  noiseGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
  noise.connect(noiseGain).connect(bus.master);

  osc.start();
  noise.start();
  pushHandle("timeout", setTimeout(() => {
    try {
      osc.stop();
      noise.stop();
    } catch {
      /* noop */
    }
  }, 520));
  __soundChecked = true;
};

const isOutputAudible = () => {
  const ctx = getCtx();
  const bus = ensureBus();
  if (!ctx || !bus) return false;
  bus.analyser.getByteTimeDomainData(bus.meterBuf);
  let sum = 0;
  for (let i = 0; i < bus.meterBuf.length; i += 1) {
    const x = (bus.meterBuf[i] - 128) / 128;
    sum += x * x;
  }
  return Math.sqrt(sum / bus.meterBuf.length) > 0.01;
};

const startPad = ({ chord, wave, tempo, filterStart, filterEnd, delay, fb, pan }) => {
  const ctx = getCtx();
  const bus = ensureBus();
  if (!ctx || !bus) return;

  stopVoices();
  clearHandles();

  bus.left.delayTime.value = delay;
  bus.right.delayTime.value = delay;
  bus.lfb.gain.value = fb;
  bus.rfb.gain.value = fb;
  bus.lp.frequency.value = filterStart;

  const lfo = setInterval(() => {
    const now = ctx.currentTime;
    bus.lp.frequency.cancelScheduledValues(now);
    bus.lp.frequency.setValueAtTime(filterStart, now);
    bus.lp.frequency.linearRampToValueAtTime(filterEnd, now + tempo * 0.9);
  }, Math.max(300, tempo * 1000));
  pushHandle("interval", lfo);

  chord.forEach((frequency, index) => {
    const osc = ctx.createOscillator();
    osc.type = wave;
    osc.frequency.value = frequency;
    const g = ctx.createGain();
    g.gain.value = 0;
    const panNode = ctx.createStereoPanner();
    const width = pan ?? 0.6;
    panNode.pan.value = ((index / (chord.length - 1 || 1)) * 2 - 1) * width;

    const schedule = () => {
      const now = ctx.currentTime;
      const duration = tempo + index * 0.6;
      g.gain.cancelScheduledValues(now);
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.35 / chord.length, now + duration * 0.45);
      g.gain.linearRampToValueAtTime(0, now + duration);
      pushHandle("timeout", setTimeout(schedule, duration * 1000));
    };
    pushHandle("timeout", setTimeout(schedule, 80 * index));

    osc.connect(g).connect(panNode).connect(bus.master);
    osc.start();
    __voices.add({ osc, g, pan: panNode });
  });
};

const stopPad = () => {
  stopVoices();
  clearHandles();
};

/* ========================================================================
   ADAPTIVE PERFORMANCE + BACKDROP + CARDS
   ======================================================================== */
const usePerfProfile = () => {
  const [profile, setProfile] = useState({ reduceMotion: false, lowPower: false, scale: 1 });
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cores = navigator.hardwareConcurrency || 2;
    const mem = navigator.deviceMemory || 4;
    const lowPower = cores <= 4 || mem <= 4;
    const scale = (reduceMotion ? 0.6 : 1) * (lowPower ? 0.75 : 1);
    setProfile({ reduceMotion, lowPower, scale });
  }, []);
  return profile;
};

const Starfield = ({ density = 150, scale = 1 }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const stars = [];
    function init() {
      stars.length = 0;
      const count = Math.max(120, Math.floor(density * scale));
      for (let i = 0; i < count; i += 1) {
        stars.push({ x: Math.random() * width, y: Math.random() * height, z: Math.random() * 0.9 + 0.1 });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      const gradient = ctx.createRadialGradient(width * 0.5, height * 0.6, 50, width * 0.5, height * 0.6, Math.max(width, height));
      gradient.addColorStop(0, "#0b1020");
      gradient.addColorStop(1, "#020511");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < stars.length; i += 1) {
        const s = stars[i];
        const size = (1 - s.z) * 1.8 + 0.2;
        ctx.fillStyle = i % 8 === 0 ? "#a9b9ff" : "#e9f1ff";
        ctx.fillRect(s.x, s.y, size, size);
        s.x += (0.3 - s.z) * 0.2;
        if (s.x > width) s.x = 0;
      }
      animRef.current = requestAnimationFrame(draw);
    }

    const onResize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      init();
    };

    init();
    draw();
    window.addEventListener("resize", onResize);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [density, scale]);

  return <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full [image-rendering:pixelated]" />;
};

const ParallaxLayer = ({ speed = 18, children }) => {
  const ref = useRef(null);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rot = useTransform(tiltX, [-30, 30], [-6, 6]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const onMove = (e) => {
      const { left, top, width, height } = node.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 2 - 1;
      const y = ((e.clientY - top) / height) * 2 - 1;
      tiltX.set(x * speed);
      tiltY.set(y * speed);
    };
    node.addEventListener("mousemove", onMove);
    return () => node.removeEventListener("mousemove", onMove);
  }, [speed, tiltX, tiltY]);

  const tx = useTransform(tiltX, (value) => `${value}px`);
  const ty = useTransform(tiltY, (value) => `${value}px`);

  return (
    <MotionDiv ref={ref} style={{ x: tx, y: ty, rotateZ: rot }} className="relative">
      {children}
    </MotionDiv>
  );
};

const IslandCard = ({ title, blurb, onClick }) => (
  <MotionButton
    onClick={onClick}
    whileHover={{ scale: 1.02, y: -4 }}
    whileTap={{ scale: 0.98 }}
    className="group relative w-full rounded-2xl border border-white/10 bg-white/5 p-6 text-left shadow-[0_0_30px_rgba(124,139,255,0.25)] backdrop-blur-md transition-shadow hover:shadow-[0_0_60px_rgba(124,139,255,0.35)]"
  >
    <div className="absolute -top-10 -left-10 size-28 rounded-full bg-gradient-to-br from-indigo-500/40 to-cyan-400/20 blur-2xl" />
    <div className="absolute -bottom-8 -right-6 size-24 rounded-full bg-gradient-to-tr from-fuchsia-500/30 to-sky-300/10 blur-2xl" />
    <div className="flex items-center gap-3">
      <div className="rounded-xl border border-white/20 bg-white/5 p-2">
        <Sparkles className="size-5 opacity-80" />
      </div>
      <h3 className="text-lg font-semibold tracking-wide text-white/95">{title}</h3>
    </div>
    <p className="mt-3 text-sm leading-6 text-white/80">{blurb}</p>
    <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-sky-200/90">
      Begin journey <ChevronRight className="size-4" />
    </div>
  </MotionButton>
);

/* ========================================================================
   3D HELPERS + SCENE GENERATION
   ======================================================================== */
const CameraRig = ({ mouse, ampZ = 0.4, ampX = 1.2, ampY = 0.8 }) => {
  useFrame(({ camera }, t) => {
    const targetZ = -6 + Math.sin(t * 0.2) * ampZ;
    camera.position.z += (targetZ - camera.position.z) * 0.03;
    camera.position.x += (mouse.current.x * ampX - camera.position.x) * 0.03;
    camera.position.y += (-mouse.current.y * ampY - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
  });
  return null;
};

const Rocket = ({ position = [0, 0, 0], hue = "#b8c0ff" }) => {
  const ref = useRef();
  useFrame((_, t) => {
    if (!ref.current) return;
    ref.current.position.y = position[1] + Math.sin(t * 1.5) * 0.15;
    ref.current.rotation.y = Math.sin(t * 0.6) * 0.2;
  });
  return (
    <group ref={ref} position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.25, 0.25, 1.2, 20]} />
        <meshStandardMaterial color={hue} metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.7, 0]} castShadow>
        <coneGeometry args={[0.25, 0.5, 20]} />
        <meshStandardMaterial color="#96a3ff" metalness={0.7} roughness={0.3} />
      </mesh>
      {[-1, 1].map((x, i) => (
        <mesh key={i} position={[0.22 * x, -0.3, 0]} rotation={[0, 0, (Math.PI / 10) * -x]}>
          <boxGeometry args={[0.02, 0.35, 0.25]} />
          <meshStandardMaterial color="#6aa9ff" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 0.2, 0.251]}>
        <circleGeometry args={[0.09, 24]} />
        <meshStandardMaterial color="#dff8ff" emissive="#88e5ff" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, -0.7, 0]}>
        <coneGeometry args={[0.12, 0.5, 16]} />
        <meshStandardMaterial color="#ffb347" emissive="#ff6a00" emissiveIntensity={0.9} transparent opacity={0.9} />
      </mesh>
    </group>
  );
};

const StarPoints = ({ count = 2000, color = "#e9f1ff", spread = 80 }) => {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * spread;
      arr[i * 3 + 1] = (Math.random() - 0.5) * spread;
      arr[i * 3 + 2] = (Math.random() - 0.5) * spread;
    }
    return arr;
  }, [count, spread]);

  useFrame((_, t) => {
    if (ref.current) ref.current.rotation.y = t * 0.01;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={positions.length / 3} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color={color} sizeAttenuation />
    </points>
  );
};

const NebulaCloud = ({ count = 5000 }) => {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const angle = i * 0.015;
      const radius = 1.2 + 0.03 * i;
      arr[i * 3 + 0] = Math.cos(angle) * radius * (Math.random() * 0.2 + 0.9);
      arr[i * 3 + 1] = (Math.random() - 0.5) * 1.2;
      arr[i * 3 + 2] = Math.sin(angle) * radius * (Math.random() * 0.2 + 0.9);
    }
    return arr;
  }, [count]);
  useFrame((_, t) => {
    if (ref.current) ref.current.rotation.y = t * 0.05;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={positions.length / 3} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#b58dff" transparent opacity={0.6} />
    </points>
  );
};

const AuroraRibbons = ({ bands = 3, amp = 0.35 }) => {
  const groups = useMemo(() => Array.from({ length: bands }, () => React.createRef()), [bands]);
  useFrame((_, t) => {
    groups.forEach((ref, i) => {
      const grp = ref.current;
      if (!grp) return;
      grp.children.forEach((mesh, j) => {
        mesh.position.y = Math.sin(t * 0.7 + j * 0.8 + i) * amp + 0.3;
      });
      grp.rotation.y = Math.sin(t * 0.1 + i) * 0.2;
    });
  });
  const ribbon = (phase, color) => {
    const pts = [];
    for (let i = 0; i < 16; i += 1) {
      pts.push(new THREE.Vector3(-4 + i * 0.5, Math.sin(i * 0.5 + phase) * 0.3, -2 - i * 0.1));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    return (
      <mesh key={phase}>
        <tubeGeometry args={[curve, 120, 0.05, 8, false]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.4} metalness={0.1} />
      </mesh>
    );
  };
  return (
    <>
      {groups.map((ref, i) => (
        <group ref={ref} key={i}>
          {ribbon(i * 0.6, i % 2 ? "#67ffb8" : "#b89bff")}
          {ribbon(i * 0.6 + 0.3, i % 2 ? "#a6ffd9" : "#d2c7ff")}
        </group>
      ))}
    </>
  );
};

const CrystalField = ({ count = 24, scale = 1 }) => {
  const group = useRef();
  const crystals = useMemo(
    () =>
      Array.from({ length: Math.floor(count * scale) }).map(() => ({
        position: [(Math.random() - 0.5) * 5, -0.7 + Math.random() * 0.4, (Math.random() - 0.5) * 4],
        scale: [0.15 + Math.random() * 0.25, 0.6 + Math.random() * 0.8, 0.15 + Math.random() * 0.25],
        glow: Math.random() * 0.6 + 0.4,
      })),
    [count, scale],
  );
  useFrame((_, t) => {
    if (group.current) group.current.rotation.y = Math.sin(t * 0.1) * 0.05;
  });
  return (
    <group ref={group}>
      {crystals.map((c, i) => (
        <mesh key={i} position={c.position} scale={c.scale}>
          <boxGeometry />
          <meshStandardMaterial color="#88a0ff" emissive="#88a0ff" emissiveIntensity={c.glow} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
};

const MeteorShower = ({ count = 60, scale = 1 }) => {
  const group = useRef();
  const meteors = useMemo(
    () =>
      Array.from({ length: Math.floor(count * scale) }).map(() => ({
        position: [(Math.random() - 0.5) * 6, Math.random() * 2 + 0.5, -2 - Math.random() * 2],
        velocity: -0.02 - Math.random() * 0.06,
        length: 0.4 + Math.random() * 0.4,
      })),
    [count, scale],
  );
  useFrame(() => {
    if (!group.current) return;
    group.current.children.forEach((mesh, i) => {
      mesh.position.y += meteors[i].velocity;
      if (mesh.position.y < -1.5) mesh.position.y = 2.2;
    });
  });
  return (
    <group ref={group}>
      {meteors.map((meteor, i) => (
        <mesh key={i} position={meteor.position} rotation={[0, 0, -Math.PI / 8]}>
          <boxGeometry args={[0.01, meteor.length, 0.01]} />
          <meshStandardMaterial color="#d8e0ff" emissive="#88aaff" emissiveIntensity={0.6} />
        </mesh>
      ))}
    </group>
  );
};

const SolarRings = () => {
  const ref = useRef();
  useFrame((_, t) => {
    if (ref.current) ref.current.rotation.z = t * 0.25;
  });
  return (
    <group ref={ref}>
      {[1.2, 1.6, 2.1].map((radius, i) => (
        <mesh key={radius} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius, 0.02, 12, 120]} />
          <meshStandardMaterial color="#ffd79a" emissive="#ffbe6b" emissiveIntensity={0.4 - i * 0.08} />
        </mesh>
      ))}
    </group>
  );
};

const EXTRA_RENDERERS = {
  nebula: ({ scale }) => <NebulaCloud count={Math.floor(5000 * scale)} />,
  aurora: ({ scale }) => <AuroraRibbons bands={3} amp={0.35 * scale} />,
  crystals: ({ scale }) => <CrystalField count={24} scale={scale} />,
  meteors: ({ scale }) => <MeteorShower count={60} scale={scale} />,
  rings: () => <SolarRings />,
};

const SCENE_CONFIG = {
  starlight: {
    stars: { count: 1600, color: "#e9f1ff" },
    planets: [
      { position: [2.1, 0.4, -2], radius: 0.85, color: "#9bd0ff" },
      { position: [-1.8, -0.1, -1.6], radius: 0.55, color: "#ffd1a8" },
    ],
    rockets: [[0, -0.1, 0]],
    extras: [],
  },
  nebula: {
    stars: { count: 1200, color: "#79ffe1" },
    planets: [],
    rockets: [[-0.6, -0.2, 0.2, "#ffd08a"], [0.6, 0.1, -0.1, "#b8c0ff"]],
    extras: [{ type: "nebula" }],
  },
  aurora: {
    stars: { count: 2000, color: "#dfffe9" },
    planets: [],
    rockets: [[0, -0.2, 0, "#b8ffd6"], [0.9, 0.2, -0.2, "#ffd08a"]],
    extras: [{ type: "aurora" }],
  },
  cavern: {
    stars: { count: 800, color: "#aab8ff", spread: 50 },
    planets: [],
    rockets: [[0, -0.25, 0, "#b8c0ff"]],
    extras: [{ type: "crystals" }, { type: "asteroids" }],
  },
  terrace: {
    stars: { count: 1500, color: "#cfe6ff" },
    planets: [
      { position: [2.0, 0.2, -1.9], radius: 0.8, color: "#bcc7ff", ring: true },
    ],
    rockets: [[0, -0.05, 0, "#b8c0ff"]],
    extras: [{ type: "meteors" }],
  },
  dawn: {
    stars: { count: 1900, color: "#fff1cf" },
    planets: [{ position: [0, 0, 0], radius: 0.9, color: "#ffc58a", emissive: "#ffb060" }],
    rockets: [[0, -0.15, 0, "#ffd08a"], [-0.8, 0.1, -0.1, "#cfe4ff"]],
    extras: [{ type: "rings" }],
  },
};

const renderPlanets = (planets = []) =>
  planets.map((planet, i) => (
    <group key={i} position={planet.position}>
      <mesh>
        <sphereGeometry args={[planet.radius, 32, 32]} />
        <meshStandardMaterial color={planet.color} emissive={planet.emissive ?? "#000"} emissiveIntensity={planet.emissive ? 0.7 : 0} roughness={0.6} />
      </mesh>
      {planet.ring && (
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[planet.radius * 1.5, 0.03, 16, 80]} />
          <meshStandardMaterial color="#cfe8ff" />
        </mesh>
      )}
    </group>
  ));

const AsteroidBelt = ({ count = 140, radius = 4.4, color = "#b5c7e6", scale = 1 }) => {
  const ref = useRef();
  const positions = useMemo(() => {
    const total = Math.floor(count * scale);
    const arr = new Float32Array(total * 3);
    for (let i = 0; i < total; i += 1) {
      const r = radius + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 1.2;
      arr[i * 3 + 0] = Math.cos(theta) * r;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = Math.sin(theta) * r;
    }
    return arr;
  }, [count, radius, scale]);

  useFrame((_, t) => {
    if (ref.current) ref.current.rotation.y = t * 0.02;
  });

  const total = positions.length / 3;
  return (
    <group ref={ref}>
      {Array.from({ length: total }).map((_, i) => {
        const x = positions[i * 3 + 0];
        const y = positions[i * 3 + 1];
        const z = positions[i * 3 + 2];
        const s = 0.05 + Math.random() * 0.18;
        return (
          <mesh key={i} position={[x, y, z]}>
            <icosahedronGeometry args={[s, 0]} />
            <meshStandardMaterial color={color} roughness={0.9} metalness={0.05} />
          </mesh>
        );
      })}
    </group>
  );
};

const SceneContent = ({ themeKey, scale }) => {
  const config = SCENE_CONFIG[themeKey] || SCENE_CONFIG.starlight;
  return (
    <>
      <StarPoints count={Math.floor((config.stars?.count ?? 1600) * scale)} color={config.stars?.color ?? "#e9f1ff"} spread={config.stars?.spread ?? 80} />
      {renderPlanets(config.planets)}
      {(config.rockets ?? []).map((r, i) => (
        <Rocket key={i} position={[r[0], r[1], r[2]]} hue={r[3] ?? "#b8c0ff"} />
      ))}
      {config.extras?.map((extra, i) => {
        if (extra.type === "asteroids") return <AsteroidBelt key={`extra-${i}`} scale={scale} />;
        const Renderer = EXTRA_RENDERERS[extra.type];
        return Renderer ? <Renderer key={`extra-${i}`} scale={scale} /> : null;
      })}
    </>
  );
};

/* ========================================================================
   HUD + WORLD META + PORTAL WORLD + TIMER + PAGE
   ======================================================================== */
const PortalHUD = ({ title, onClose, musicOn, setMusicOn, audioBlocked, onEnableAudio, audioLive }) => (
  <Html fullscreen>
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
    <div className="absolute left-5 top-5 z-50 flex flex-wrap items-center gap-2">
      <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/90 backdrop-blur-sm">{title}</span>
      <button
        onClick={() => setMusicOn((v) => !v)}
        className="pointer-events-auto rounded-full border border-white/25 bg-black/40 px-3 py-1.5 text-xs text-white/90 backdrop-blur hover:bg-black/60"
      >
        {musicOn ? "Music: On" : "Music: Off"}
      </button>
      {audioBlocked && (
        <button
          onClick={onEnableAudio}
          className="pointer-events-auto rounded-full border border-emerald-300/40 bg-emerald-400/20 px-3 py-1.5 text-xs text-emerald-100 shadow hover:bg-emerald-400/30"
        >
          Enable sound
        </button>
      )}
      {!audioBlocked && !audioLive && (
        <button
          onClick={() => {
            unlockAudioSync();
            playSoundCheckPing();
          }}
          className="pointer-events-auto rounded-full border border-yellow-300/40 bg-yellow-400/20 px-3 py-1.5 text-xs text-yellow-100 hover:bg-yellow-400/30"
        >
          Sound check
        </button>
      )}
    </div>
    <div className="absolute right-5 top-5 z-50">
      <button
        onClick={onClose}
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/40 px-3 py-1.5 text-xs text-white/90 backdrop-blur hover:bg-black/60"
      >
        <X className="size-4" /> Exit
      </button>
    </div>
  </Html>
);

const WORLD_META = {
  starlight: { bg: "#050712", amp: { x: 1.0, y: 0.7, z: 0.35 }, chord: [164.81, 207.65, 261.63, 329.63], wave: "sine", tempo: 7.5, filterStart: 1100, filterEnd: 2200, delay: 0.22, fb: 0.22, pan: 0.5 },
  nebula: { bg: "#0a0614", amp: { x: 1.4, y: 0.9, z: 0.5 }, chord: [174.61, 220.0, 261.63, 349.23], wave: "triangle", tempo: 6.6, filterStart: 1200, filterEnd: 2400, delay: 0.25, fb: 0.28, pan: 0.6 },
  aurora: { bg: "#04100f", amp: { x: 1.6, y: 1.1, z: 0.55 }, chord: [196.0, 246.94, 311.13, 392.0], wave: "triangle", tempo: 5.6, filterStart: 1500, filterEnd: 2800, delay: 0.19, fb: 0.26, pan: 0.7 },
  cavern: { bg: "#04060a", amp: { x: 0.8, y: 0.6, z: 0.25 }, chord: [146.83, 196.0, 246.94, 293.66], wave: "sine", tempo: 8.2, filterStart: 900, filterEnd: 1600, delay: 0.24, fb: 0.18, pan: 0.4 },
  terrace: { bg: "#070812", amp: { x: 0.6, y: 0.5, z: 0.2 }, chord: [130.81, 174.61, 220.0, 261.63], wave: "sine", tempo: 9.2, filterStart: 1000, filterEnd: 1700, delay: 0.27, fb: 0.2, pan: 0.35 },
  dawn: { bg: "#120a06", amp: { x: 1.2, y: 0.8, z: 0.45 }, chord: [155.56, 196.0, 246.94, 329.63], wave: "sawtooth", tempo: 5.0, filterStart: 1700, filterEnd: 3000, delay: 0.17, fb: 0.3, pan: 0.7 },
};

const PortalWorld = ({ themeKey = "starlight", onClose, scale = 1 }) => {
  const mouse = useRef({ x: 0, y: 0 });
  const [musicOn, setMusicOn] = useState(true);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [audioLive, setAudioLive] = useState(false);

  const meta = WORLD_META[themeKey] || WORLD_META.starlight;

  useEffect(() => {
    const ctx = getCtx();
    ensureBus();
    if (!ctx) return undefined;
    const updateState = () => setAudioBlocked(ctx.state !== "running");
    updateState();
    ctx.onstatechange = updateState;
    const meter = setInterval(() => setAudioLive(isOutputAudible()), 300);
    return () => {
      ctx.onstatechange = null;
      clearInterval(meter);
    };
  }, []);

  useEffect(() => {
    if (musicOn && !audioBlocked) {
      unlockAudioSync();
      startPad(meta);
      playSoundCheckPing();
    } else {
      stopPad();
      setAudioLive(false);
    }
    return () => {
      stopPad();
    };
  }, [themeKey, musicOn, audioBlocked, meta]);

  const onEnableAudio = () => {
    unlockAudioSync();
    setTimeout(() => {
      if (!audioLive) playSoundCheckPing();
      const ctx = getCtx();
      if (ctx) setAudioBlocked(ctx.state !== "running");
    }, 0);
  };

  return (
    <div className="fixed inset-0 z-[60]">
      <Canvas
        camera={{ position: [0, 0, -12], fov: 60 }}
        onPointerMove={(e) => {
          const x = (e.clientX / window.innerWidth) * 2 - 1;
          const y = (e.clientY / window.innerHeight) * 2 - 1;
          mouse.current = { x, y };
        }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={[meta.bg]} />
        <hemisphereLight intensity={0.6} color="#bcd7ff" groundColor="#06070a" />
        <directionalLight position={[4, 6, 5]} intensity={1.2} castShadow />
        <directionalLight position={[-6, -3, -4]} intensity={0.4} />

        <Suspense fallback={null}>
          <CameraRig mouse={mouse} ampZ={meta.amp.z * scale} ampX={meta.amp.x} ampY={meta.amp.y} />
          <SceneContent themeKey={themeKey} scale={scale} />
          <PortalHUD
            title="Inner World"
            onClose={onClose}
            musicOn={musicOn}
            setMusicOn={setMusicOn}
            audioBlocked={audioBlocked}
            onEnableAudio={onEnableAudio}
            audioLive={audioLive}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

const TimerModal = ({ open, onClose, minutes }) => {
  const [remaining, setRemaining] = useState(minutes * 60);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    setRemaining(minutes * 60);
    setRunning(true);
  }, [minutes, open]);

  useEffect(() => {
    if (!open || !running) return undefined;
    const id = setInterval(() => setRemaining((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [open, running]);

  useEffect(() => {
    if (remaining === 0) setRunning(false);
  }, [remaining]);

  if (!open) return null;

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-white/10 p-6 text-white shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Session Timer</h3>
          <button onClick={onClose} className="rounded-full border border-white/20 p-1.5 hover:bg-white/10">
            <X className="size-4" />
          </button>
        </div>
        <p className="text-sm text-white/80">Close your eyes, breathe gently, and follow the imagery. I'll keep time.</p>
        <div className="mt-6 text-center">
          <div className="text-5xl font-semibold tabular-nums tracking-wide">
            {mm}:{ss}
          </div>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button onClick={() => setRunning((v) => !v)} className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm hover:bg-white/15">
              {running ? "Pause" : "Resume"}
            </button>
            <button
              onClick={() => {
                setRemaining(minutes * 60);
                setRunning(true);
              }}
              className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm hover:bg-white/15"
            >
              Restart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function GuidedImageryDetail() {
  const navigate = useNavigate();
  const perf = usePerfProfile();
  const [timerOpen, setTimerOpen] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [portal, setPortal] = useState(null);

  useEffect(() => {
    setupGestureUnlock();
  }, []);

  const openPortal = (key) => {
    unlockAudioSync();
    setPortal(key);
  };

  const actions = {
    starlight: () => openPortal("starlight"),
    nebula: () => openPortal("nebula"),
    aurora: () => openPortal("aurora"),
    cavern: () => openPortal("cavern"),
    terrace: () => openPortal("terrace"),
    dawn: () => openPortal("dawn"),
  };

  return (
    <div className="relative w-full min-h-[calc(100dvh-4rem)] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#040612] via-[#071229] to-[#020713]" />
      <Starfield density={1.0} scale={perf.scale} />
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_280px_120px_rgba(0,0,0,0.7)]" />

      <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 0.8, y: 0 }} transition={{ duration: 1.2 }} className="absolute right-12 top-10 flex items-center gap-2 text-white/80">
        <Moon className="size-5" />
        <span className="text-xs uppercase tracking-wider">Guided Imagery</span>
      </MotionDiv>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-24">
        <ParallaxLayer speed={18}>
          <MotionH1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center text-3xl font-semibold tracking-tight text-white md:text-5xl">
            Step Into Your Inner Cosmos
          </MotionH1>
          <MotionParagraph initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.15 }} className="mx-auto mt-3 max-w-2xl text-center text-white/80">
            Each island opens a distinct 3D world with tuned, built-in music. If your device blocks autoplay, tap "Enable sound" or "Sound check".
          </MotionParagraph>
        </ParallaxLayer>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <IslandCard title="Starlight Shore (2-3 min)" blurb="Classic planets + one companion rocket." onClick={actions.starlight} />
          <IslandCard title="Nebula Garden (5-7 min)" blurb="Swirling magenta-cyan nebula with twin rockets." onClick={actions.nebula} />
          <IslandCard title="Aurora Bridge (10-12 min)" blurb="Shimmering aurora ribbons that arc overhead." onClick={actions.aurora} />
          <IslandCard title="Crystal Cavern (Deep Focus)" blurb="Glowing crystal pillars in a dark cave." onClick={actions.cavern} />
          <IslandCard title="Moonlit Terrace (Sleep)" blurb="Ringed moon + slow meteor shower." onClick={actions.terrace} />
          <IslandCard title="Dawn Spire (Recharge)" blurb="Rising sun with solar rings & flares." onClick={actions.dawn} />
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => {
              setTimerMinutes(2);
              setTimerOpen(true);
            }}
            className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur hover:bg-white/15"
          >
            Quick Start (2 min)
          </button>
          <button onClick={() => navigate("/mindfulness-meditation")} className="rounded-full border border-sky-300/30 bg-sky-400/20 px-4 py-2 text-sm text-sky-100 shadow-[0_0_30px_rgba(56,189,248,0.25)] hover:bg-sky-400/30">
            Personalized Journey
          </button>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 to-transparent" />

      <TimerModal open={timerOpen} onClose={() => setTimerOpen(false)} minutes={timerMinutes} />

      {portal && <PortalWorld themeKey={portal} onClose={() => setPortal(null)} scale={perf.scale} />}
    </div>
  );
}



