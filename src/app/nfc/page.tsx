"use client";

import { useRouter } from "next/navigation";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "motion/react";
import { useRef, useState } from "react";

export default function NfcInvitationPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const hasRedirected = useRef(false);
  // Une fois la redirection déclenchée, le scroll de la page peut se réinitialiser
  // (reset du navigateur pendant la navigation) : ce drapeau garde le ruban et le
  // cachet masqués sans dépendre de la position de scroll à cet instant.
  const [isLeaving, setIsLeaving] = useState(false);
  // Le ruban et le cachet sont retirés du DOM (pas juste mis à opacité 0) une fois disparus :
  // laissés en place à opacité 0 dans ce contexte 3D (perspective), ils pouvaient réapparaître
  // en fondu fantôme sur certains navigateurs pendant la rotation des volets.
  const [sealVisible, setSealVisible] = useState(true);

  // La hauteur de ce conteneur fixe la distance de scroll nécessaire pour ouvrir
  // complètement l'invitation ; la carte reste épinglée (sticky) pendant ce temps.
  // Entièrement réversible : remonter referme le faire-part.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Le ruban et le cachet disparaissent entièrement avant que les volets ne commencent à pivoter.
  const SEAL_GONE_AT = 0.15;

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setSealVisible(latest < SEAL_GONE_AT);
    if (latest >= 0.995 && !hasRedirected.current) {
      hasRedirected.current = true;
      setIsLeaving(true);
      router.push("/");
    }
  });

  const sealOpacity = useTransform(scrollYProgress, [0, SEAL_GONE_AT], [1, 0]);
  const sealScale = useTransform(scrollYProgress, [0, SEAL_GONE_AT], [1, 0.4]);
  const letterOpacity = useTransform(scrollYProgress, [0, SEAL_GONE_AT], [1, 0]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);
  const leftRotate = useTransform(scrollYProgress, [SEAL_GONE_AT, 1], [0, -180]);
  const rightRotate = useTransform(scrollYProgress, [SEAL_GONE_AT, 1], [0, 180]);

  function handleSealClick() {
    if (reduceMotion) {
      router.push("/");
      return;
    }
    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }

  return (
    <main className="relative bg-[var(--color-bg)]">
      <div ref={containerRef} className="relative h-[220vh]">
        <div className="sticky top-0 flex h-dvh w-full items-center justify-center overflow-hidden">
          <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[var(--color-primary-soft)] opacity-50 blur-3xl" />
          <div className="pointer-events-none absolute bottom-10 right-[-4rem] h-80 w-80 rounded-full bg-[var(--color-accent)] opacity-30 blur-3xl" />

          {/* Carte : toute la hauteur de l'écran, largeur fixe (environ une feuille A5). Les
              volets pivotent progressivement selon la progression du scroll. */}
          <div className="relative h-full" style={{ width: "min(420px, 92vw)", perspective: 2200 }}>
            {/* Panneau central, révélé à l'ouverture des volets */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 border border-white/20 bg-[var(--color-primary)] px-6 text-center shadow-xl">
              <p className="text-xs uppercase tracking-[0.3em] text-white/80">
                Vous êtes invités au mariage de
              </p>
              <p className="font-script text-6xl text-white sm:text-8xl">Tiffany &amp; Simon</p>
            </div>

            {/* Volet gauche, articulé sur le bord extérieur gauche */}
            <motion.div
              className="absolute inset-y-0 left-0 w-1/2 border border-white/20 bg-[var(--color-primary-soft)] shadow-xl"
              style={{ transformOrigin: "left center", rotateY: leftRotate }}
            >
              <motion.div
                className="flex h-full items-center justify-end pr-3"
                style={{ opacity: letterOpacity }}
              >
                <span className="font-script text-3xl text-white opacity-80">T</span>
              </motion.div>
            </motion.div>

            {/* Volet droit, articulé sur le bord extérieur droit */}
            <motion.div
              className="absolute inset-y-0 right-0 w-1/2 border border-white/20 bg-[var(--color-primary-soft)] shadow-xl"
              style={{ transformOrigin: "right center", rotateY: rightRotate }}
            >
              <motion.div
                className="flex h-full items-center justify-start pl-3"
                style={{ opacity: letterOpacity }}
              >
                <span className="font-script text-3xl text-white opacity-80">S</span>
              </motion.div>
            </motion.div>

            {/* Ruban rose qui ferme les deux volets, passe sous le cachet de cire */}
            {sealVisible && !isLeaving && (
              <motion.div
                style={{ opacity: sealOpacity }}
                className="absolute inset-x-0 top-1/2 h-10 -translate-y-1/2 bg-[var(--color-primary)] shadow-[0_2px_8px_rgba(0,0,0,0.25)] sm:h-12"
              >
                <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/20" />
              </motion.div>
            )}

            {/* Cachet de cire, au point de jonction des deux volets */}
            {sealVisible && !isLeaving && (
              <motion.button
                type="button"
                aria-label="Ouvrir l'invitation"
                onClick={handleSealClick}
                style={{ opacity: sealOpacity, scale: sealScale }}
                className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--color-primary)] font-script text-xl text-white shadow-lg ring-4 ring-[var(--color-primary-soft)]/60"
              >
                T&amp;S
              </motion.button>
            )}
          </div>

          <motion.p
            style={{ opacity: hintOpacity }}
            className="pointer-events-none absolute bottom-8 left-0 right-0 z-20 text-center text-sm text-[var(--color-text-muted)]"
          >
            Faites défiler (ou appuyez sur le cachet de cire) pour ouvrir votre invitation
          </motion.p>
        </div>
      </div>
    </main>
  );
}
