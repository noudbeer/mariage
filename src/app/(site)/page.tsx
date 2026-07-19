import Hero from "@/components/hero/Hero";
import ScrollReveal from "@/components/hero/ScrollReveal";

const HIGHLIGHTS = [
  {
    title: "Le programme",
    text: "Cérémonie, vin d'honneur, repas, soirée, brunch du lendemain — chacun voit ce à quoi il est convié.",
  },
  {
    title: "Confirmez votre présence",
    text: "Répondez pour vous et les membres de votre foyer, événement par événement.",
  },
  {
    title: "Les souvenirs",
    text: "Après le mariage, retrouvez ici les photos du week-end.",
  },
];

export default function Home() {
  return (
    <main>
      <Hero />

      <section className="mx-auto max-w-4xl px-6 py-24">
        <div className="grid gap-10 sm:grid-cols-3">
          {HIGHLIGHTS.map((item, i) => (
            <ScrollReveal key={item.title} delay={i * 0.1}>
              <h2 className="text-lg font-medium text-[var(--color-primary)]">
                {item.title}
              </h2>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">{item.text}</p>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <ScrollReveal className="mx-auto max-w-2xl px-6 pb-24 text-center">
        <p className="text-[var(--color-text-muted)]">
          Une question ?{" "}
          <a href="/contact" className="underline">
            Contactez-nous
          </a>
          .
        </p>
      </ScrollReveal>
    </main>
  );
}
