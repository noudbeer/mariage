"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";

interface Props {
  firstName: string;
  venueName: string;
  dateLabel?: string;
}

export default function WelcomeHero({ firstName, venueName, dateLabel }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [photoFailed, setPhotoFailed] = useState(false);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const contentOpacity = useTransform(scrollYProgress, [0.25, 0.85], [1, 0]);

  return (
    <div
      ref={ref}
      className="relative flex min-h-[calc(100vh-56px)] flex-col items-center justify-center px-6 py-20"
    >
      {/* Couches décoratives : fixes, derrière tout le contenu de la page (pas seulement le hero) */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-[var(--color-primary-soft)] opacity-60 blur-3xl" />
        <div className="absolute right-[-4rem] top-1/3 h-96 w-96 rounded-full bg-[var(--color-accent)] opacity-40 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[var(--color-primary)] opacity-20 blur-3xl" />
      </div>

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
          initial={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
          animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative aspect-[4/5] w-full max-w-[380px] overflow-hidden rounded-[2rem] shadow-xl"
        >
          <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--color-primary-soft)] via-[var(--color-accent)] to-[var(--color-primary)]">
            {photoFailed ? (
              <span className="font-script text-6xl text-white/90">T &amp; S</span>
            ) : (
              <>
                <Image
                  src="/photos/Screenshot_20260622-193234~2.jpg"
                  alt="Tiffany et Simon"
                  fill
                  priority
                  sizes="380px"
                  onError={() => setPhotoFailed(true)}
                  className="object-cover transition duration-300 hover:scale-105"
                  style={{ filter: "saturate(0.85) sepia(0.12) contrast(1.05)" }}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/25 via-transparent to-[var(--color-accent)]/25 mix-blend-multiply" />
              </>
            )}
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
