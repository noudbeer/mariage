"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { useRef } from "react";

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  // Trois couches à des vitesses différentes = effet de profondeur.
  const slow = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const medium = useTransform(scrollYProgress, [0, 1], ["0%", "45%"]);
  const fast = useTransform(scrollYProgress, [0, 1], ["0%", "80%"]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <div ref={ref} className="relative flex h-screen items-center justify-center overflow-hidden">
      {/* Couches décoratives (à remplacer par de vraies photos du couple si souhaité) */}
      <motion.div
        style={{ y: reduceMotion ? 0 : slow }}
        className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-[var(--color-primary-soft)] opacity-60 blur-3xl"
      />
      <motion.div
        style={{ y: reduceMotion ? 0 : medium }}
        className="absolute right-[-4rem] top-1/3 h-96 w-96 rounded-full bg-[var(--color-accent)] opacity-40 blur-3xl"
      />
      <motion.div
        style={{ y: reduceMotion ? 0 : fast }}
        className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[var(--color-primary)] opacity-20 blur-3xl"
      />

      <motion.div
        style={{ opacity: reduceMotion ? 1 : titleOpacity }}
        className="relative z-10 flex flex-col items-center gap-6 px-6 text-center"
      >
        <motion.p
          initial={reduceMotion ? undefined : { opacity: 0, y: -10 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-sm uppercase tracking-[0.3em] text-[var(--color-primary)]"
        >
          Nous nous marions
        </motion.p>
        <motion.h1
          initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-script text-6xl sm:text-8xl"
        >
          Tiffany &amp; Simon
        </motion.h1>
        <motion.p
          initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-md text-[var(--color-text-muted)]"
        >
          Retrouvez ici le programme du week-end, le plan et de quoi confirmer votre
          présence.
        </motion.p>
        <motion.a
          initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          whileHover={reduceMotion ? undefined : { scale: 1.05 }}
          whileTap={reduceMotion ? undefined : { scale: 0.97 }}
          href="/connexion"
          className="mt-4 rounded-full bg-[var(--color-primary)] px-8 py-3 font-medium text-white"
        >
          Accéder au site
        </motion.a>
      </motion.div>
    </div>
  );
}
