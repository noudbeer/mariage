"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useAnimationFrame,
  useReducedMotion,
  type MotionValue,
} from "motion/react";

type Shape = "circle" | "blob" | "blob2" | "oval";

// Idées de couleurs de tenue pour les invités : bleu électrique, rose fuchsia (comme le rose
// du site), orange, jaune, vert — et une déclinaison plus douce de chacun.
// Chaque couleur dérive indépendamment dans son coin du nuage (position, amplitude, vitesse et
// phase propres) pour un effet désordonné, et accélère toutes ensemble au scroll ou au clic.
// Les formes (shape) sont toutes arrondies, sans angle. pullStrength/lag font que chaque
// pastille esquive la souris différemment (certaines vite et loin, d'autres plus mollement),
// et curlAmount courbe sa fuite au lieu d'une ligne droite.
// left/top évitent la bande centrale (où est le texte) sur grand écran ; leftMobile/topMobile
// reprennent la disposition d'origine, étalée sur tout l'écran — sur téléphone le texte a un
// fond flouté assez léger pour que ça reste lisible même avec des pastilles dessous.
const COLORS: Array<{
  name: string;
  hex: string;
  left: number;
  top: number;
  leftMobile: number;
  topMobile: number;
  ampX: number;
  ampY: number;
  speedX: number;
  speedY: number;
  phase: number;
  size: number;
  shape: Shape;
  pullStrength: number;
  lag: number;
  curlAmount: number;
}> = [
  { name: "Bleu électrique", hex: "#2e6bff", left: 8, top: 14, leftMobile: 8, topMobile: 18, ampX: 24, ampY: 18, speedX: 0.5, speedY: 0.7, phase: 0.2, size: 96, shape: "circle", pullStrength: 70, lag: 0.06, curlAmount: 18 },
  { name: "Vert sauge", hex: "#9caf88", left: 24, top: 80, leftMobile: 24, topMobile: 58, ampX: 30, ampY: 22, speedX: 0.35, speedY: 0.55, phase: 1.1, size: 84, shape: "blob", pullStrength: 40, lag: 0.03, curlAmount: 26 },
  { name: "Bleu ciel", hex: "#6fa8f5", left: 40, top: 9, leftMobile: 40, topMobile: 10, ampX: 20, ampY: 28, speedX: 0.6, speedY: 0.4, phase: 2.0, size: 104, shape: "oval", pullStrength: 85, lag: 0.1, curlAmount: 14 },
  { name: "Rose", hex: "#eb6fa6", left: 78, top: 78, leftMobile: 78, topMobile: 56, ampX: 18, ampY: 26, speedX: 0.4, speedY: 0.6, phase: 2.6, size: 92, shape: "blob", pullStrength: 35, lag: 0.02, curlAmount: 30 },
  { name: "Rose fuchsia", hex: "#d6336c", left: 88, top: 12, leftMobile: 86, topMobile: 14, ampX: 28, ampY: 20, speedX: 0.5, speedY: 0.45, phase: 0.4, size: 80, shape: "oval", pullStrength: 65, lag: 0.07, curlAmount: 20 },
  { name: "Vert", hex: "#3cb464", left: 15, top: 84, leftMobile: 15, topMobile: 80, ampX: 22, ampY: 30, speedX: 0.65, speedY: 0.35, phase: 3.0, size: 96, shape: "blob2", pullStrength: 50, lag: 0.05, curlAmount: 24 },
  { name: "Orange", hex: "#f2762e", left: 46, top: 17, leftMobile: 46, topMobile: 42, ampX: 26, ampY: 24, speedX: 0.3, speedY: 0.5, phase: 1.4, size: 88, shape: "circle", pullStrength: 80, lag: 0.09, curlAmount: 16 },
  { name: "Jaune", hex: "#f7c331", left: 68, top: 83, leftMobile: 68, topMobile: 84, ampX: 20, ampY: 22, speedX: 0.55, speedY: 0.6, phase: 2.2, size: 100, shape: "blob", pullStrength: 45, lag: 0.035, curlAmount: 28 },
];

function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    setIsMobile(mql.matches);
    function handleChange(event: MediaQueryListEvent) {
      setIsMobile(event.matches);
    }
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, [breakpoint]);

  return isMobile;
}

// Dimensions et rayon : aucune forme n'a d'angle, seule la rondeur change.
// Important : "50%" (et non une valeur en pixels comme 9999px) pour que les formes non carrées
// (oval) deviennent de vraies ellipses — en pixels, un rayon trop grand sur un rectangle produit
// une "pilule" avec des bords droits sur les côtés longs, pas une ellipse.
function shapeBox(shape: Shape, size: number): { width: number; height: number; style: React.CSSProperties } {
  switch (shape) {
    case "circle":
      return { width: size, height: size, style: { borderRadius: "50%" } };
    case "oval":
      return { width: size * 1.3, height: size * 0.78, style: { borderRadius: "50%" } };
    case "blob":
      return { width: size, height: size, style: { borderRadius: "63% 37% 54% 46% / 55% 48% 52% 45%" } };
    case "blob2":
      return { width: size, height: size, style: { borderRadius: "38% 62% 65% 35% / 44% 40% 60% 56%" } };
  }
}

// Rayons en fraction de la taille du conteneur (0 à 1). En dessous de DODGE_RADIUS la pastille
// fuit la souris ; au-delà et jusqu'à MAGNET_RADIUS elle est au contraire attirée vers elle.
const DODGE_RADIUS = 0.13;
const MAGNET_RADIUS = 0.42;

interface ChipProps {
  name: string;
  hex: string;
  left: number;
  top: number;
  ampX: number;
  ampY: number;
  speedX: number;
  speedY: number;
  phase: number;
  size: number;
  shape: Shape;
  pullStrength: number;
  lag: number;
  curlAmount: number;
  velocityFactor: MotionValue<number>;
  mouseFracX: MotionValue<number>;
  mouseFracY: MotionValue<number>;
  reduceMotion: boolean;
}

function FloatingChip({
  name,
  hex,
  left,
  top,
  ampX,
  ampY,
  speedX,
  speedY,
  phase,
  size,
  shape,
  pullStrength,
  lag,
  curlAmount,
  velocityFactor,
  mouseFracX,
  mouseFracY,
  reduceMotion,
}: ChipProps) {
  const t = useRef(0);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useMotionValue(0);
  // Réaction souris lissée : rattrape sa cible à son propre rythme, au lieu de sauter
  // instantanément comme toutes les autres pastilles.
  const smooth = useRef({ x: 0, y: 0 });

  useAnimationFrame((_, delta) => {
    if (reduceMotion) return;
    const speedMultiplier = 1 + velocityFactor.get();
    t.current += (delta / 1000) * speedMultiplier;

    // Vecteur qui pointe de la souris vers la pastille.
    const dx = left / 100 - mouseFracX.get();
    const dy = top / 100 - mouseFracY.get();
    const dist = Math.hypot(dx, dy);

    let targetX = 0;
    let targetY = 0;
    let curlFactor = 0;

    if (dist < DODGE_RADIUS) {
      // Trop près : repousse, de plus en plus fort à mesure que la souris se rapproche.
      const repelStrength = 1 - dist / DODGE_RADIUS;
      const safeDist = dist || 0.0001;
      targetX = (dx / safeDist) * repelStrength * pullStrength;
      targetY = (dy / safeDist) * repelStrength * pullStrength;
      curlFactor = repelStrength;
    } else if (dist < MAGNET_RADIUS) {
      // Plus loin mais dans la zone d'influence : effet aimant, attire vers la souris.
      const attractStrength = 1 - (dist - DODGE_RADIUS) / (MAGNET_RADIUS - DODGE_RADIUS);
      targetX = -dx * pullStrength * attractStrength;
      targetY = -dy * pullStrength * attractStrength;
      curlFactor = attractStrength * 0.5;
    }

    // Réaction plus vive que la dérive ambiante, pour que ça se sente immédiat.
    const reactivity = Math.min(lag * 4, 0.3);
    smooth.current.x += (targetX - smooth.current.x) * reactivity;
    smooth.current.y += (targetY - smooth.current.y) * reactivity;

    // Courbure perpendiculaire, pour que la pastille ne file jamais en ligne droite —
    // seulement active quand la souris a une influence.
    const curl = Math.sin(t.current * 1.6 + phase) * curlAmount * curlFactor;
    const safeDist = dist || 1;
    const curlX = (-dy / safeDist) * curl;
    const curlY = (dx / safeDist) * curl;

    x.set(Math.sin(t.current * speedX + phase) * ampX + smooth.current.x + curlX);
    y.set(Math.cos(t.current * speedY + phase) * ampY + smooth.current.y + curlY);
    rotate.set(Math.sin(t.current * speedX * 0.6 + phase) * 10);
  });

  const { width, height, style } = shapeBox(shape, size);

  return (
    <motion.div
      className="absolute flex flex-col items-center gap-2"
      style={{ left: `${left}%`, top: `${top}%`, x, y, rotate }}
    >
      <div
        className="border border-black/10 shadow-md"
        style={{ width, height, background: hex, ...style }}
      />
      <p className="text-xs font-medium text-[var(--color-text)] sm:text-sm">{name}</p>
    </motion.div>
  );
}

export default function ColorCloud() {
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();

  // Le nuage tient dans un seul écran : la page elle-même ne défile pas forcément, donc on capte
  // directement le geste de scroll (molette / tactile) et le clic plutôt que la position de
  // scroll réelle. Chaque geste ajoute un "boost" qui s'estompe tout seul au fil du temps.
  const velocityFactor = useMotionValue(0);
  // Position de la souris dans le conteneur, en fraction (0 à 1). Centrée par défaut.
  const mouseFracX = useMotionValue(0.5);
  const mouseFracY = useMotionValue(0.5);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduceMotion) return;

    let touchStartY: number | null = null;

    function addBoost(amount: number) {
      velocityFactor.set(Math.min(velocityFactor.get() + amount, 6));
    }
    function onWheel(event: WheelEvent) {
      addBoost(Math.abs(event.deltaY) * 0.02);
    }
    function onTouchStart(event: TouchEvent) {
      touchStartY = event.touches[0]?.clientY ?? null;
    }
    function onTouchMove(event: TouchEvent) {
      if (touchStartY === null) return;
      const currentY = event.touches[0]?.clientY ?? touchStartY;
      addBoost(Math.abs(touchStartY - currentY) * 0.08);
      touchStartY = currentY;
    }
    function onClick() {
      addBoost(3);
    }
    function onMouseMove(event: MouseEvent) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseFracX.set((event.clientX - rect.left) / rect.width);
      mouseFracY.set((event.clientY - rect.top) / rect.height);
    }

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("click", onClick);
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("click", onClick);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [reduceMotion, velocityFactor, mouseFracX, mouseFracY]);

  useAnimationFrame((_, delta) => {
    if (reduceMotion) return;
    // Décroissance exponentielle du boost, pour un retour en douceur au rythme de repos.
    velocityFactor.set(velocityFactor.get() * Math.pow(0.002, delta / 1000));
  });

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      {COLORS.map((color) => (
        <FloatingChip
          key={color.name}
          {...color}
          left={isMobile ? color.leftMobile : color.left}
          top={isMobile ? color.topMobile : color.top}
          velocityFactor={velocityFactor}
          mouseFracX={mouseFracX}
          mouseFracY={mouseFracY}
          reduceMotion={Boolean(reduceMotion)}
        />
      ))}
    </div>
  );
}
