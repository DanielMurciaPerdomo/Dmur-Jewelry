const MATERIALS = [
  {
    title: "Oro 18K",
    description: "Brillo duradero y valor perdurable. Ideal para piezas que quieras heredar.",
  },
  {
    title: "Plata 925",
    description: "Ligera y versátil, con excelente acabado. Perfecta para el día a día con estilo.",
  },
  {
    title: "Acero quirúrgico",
    description:
      "Resistente y hipoalergénico. Opción moderna y cuidada para quienes priorizan confort.",
  },
] as const;

export const Materials = () => {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="text-center font-serif text-3xl font-light tracking-tight text-metallic-gold-900 dark:text-ocean-mist-100 sm:text-4xl">
          Materiales y garantía
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-base text-metallic-gold-700 dark:text-ocean-mist-300">
          Trabajamos con materiales certificados y procesos que priorizan la calidad y tu
          tranquilidad.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MATERIALS.map((item) => (
            <article
              key={item.title}
              className="rounded-lg border border-metallic-gold-200 bg-metallic-gold-50/80 p-6 shadow-sm transition dark:border-ocean-mist-700 dark:bg-slate-900/60"
            >
              <h3 className="text-lg font-medium text-metallic-gold-900 dark:text-ocean-mist-100">
                {item.title}
              </h3>
              <p className="mt-2 text-base leading-relaxed text-metallic-gold-800/90 dark:text-ocean-mist-200/85">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
