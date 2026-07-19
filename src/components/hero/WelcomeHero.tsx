"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { useRef } from "react";

interface Props {
  firstName: string;
  venueName: string;
  dateLabel?: string;
}

export default function WelcomeHero({ firstName, venueName, dateLabel }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  // Plusieurs couches à des vitesses différentes = effet de profondeur au scroll.
  const slow = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const medium = useTransform(scrollYProgress, [0, 1], ["0%", "45%"]);
  const fast = useTransform(scrollYProgress, [0, 1], ["0%", "80%"]);
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <div
      ref={ref}
      className="relative flex min-h-[calc(100vh-56px)] flex-col items-center justify-center overflow-hidden px-6 py-20"
    >
      {/* Couches décoratives */}
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
        style={{ opacity: reduceMotion ? 1 : contentOpacity }}
        className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-7 text-center"
      >
        <motion.p
          initial={reduceMotion ? undefined : { opacity: 0, y: -10 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md text-sm uppercase tracking-[0.25em] text-[var(--color-primary)]"
        >
          Bonjour {firstName}, nous avons l&apos;honneur de vous inviter à notre mariage
        </motion.p>

        <motion.h1
          initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-script text-6xl sm:text-8xl"
        >
          Tiffany &amp; Simon
        </motion.h1>

        {/* Photo du couple : remplacer ce bloc par
            <Image src="/images/couple.jpg" alt="Tiffany et Simon" fill className="object-cover" />
            dès que la photo est disponible (voir public/images/). */}
        <motion.div
          style={{ y: reduceMotion ? 0 : photoY }}
          initial={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
          animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative aspect-[4/5] w-full max-w-[280px] overflow-hidden rounded-[2rem] shadow-xl"
        >
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--color-primary-soft)] via-[var(--color-accent)] to-[var(--color-primary)]">
            <span className="font-script text-6xl text-white/90">T &amp; S</span>
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col items-center gap-1"
        >
          {dateLabel && (
            <p className="text-lg font-medium text-[var(--color-primary)]">{dateLabel}</p>
          )}
          <p className="text-[var(--color-text-muted)]">{venueName}</p>
        </motion.div>

        <motion.p
          initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="max-w-md text-[var(--color-text-muted)]"
        >
          Nous serions heureux de vous compter parmi nous pour célébrer ce grand jour.
          Merci de nous faire savoir si vous serez des nôtres.
        </motion.p>

        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-2 flex flex-wrap items-center justify-center gap-4"
        >
          <motion.a
            whileHover={reduceMotion ? undefined : { scale: 1.05 }}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            href="/programme"
            className="rounded-full bg-[var(--color-primary)] px-8 py-3 font-medium text-white"
          >
            Voir le programme
          </motion.a>
          <motion.a
            whileHover={reduceMotion ? undefined : { scale: 1.05 }}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            href="/rsvp"
            className="rounded-full border border-[var(--color-primary)] px-8 py-3 font-medium text-[var(--color-primary)]"
          >
            Je réponds à l&apos;invitation
          </motion.a>
        </motion.div>
      </motion.div>
    </div>
  );
}
