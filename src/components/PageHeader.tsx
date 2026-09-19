export default function PageHeader({
  eyebrow,
  title,
  text,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-court-deep pt-28 pb-16 text-white court-grid">
      <div className="absolute inset-0 bg-gradient-to-br from-court/40 to-court-deep" />
      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        {eyebrow ? (
          <p className="text-sm font-semibold tracking-[0.28em] text-gold uppercase">{eyebrow}</p>
        ) : null}
        <h1 className="mt-3 max-w-4xl font-display text-4xl leading-tight md:text-6xl">{title}</h1>
        {text ? <p className="mt-5 max-w-2xl text-lg leading-8 text-white/75">{text}</p> : null}
      </div>
    </section>
  );
}
