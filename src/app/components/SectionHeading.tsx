interface SectionHeadingProps {
  title: string;
  description?: string;
  id?: string;
}

export default function SectionHeading({ title, description, id }: SectionHeadingProps) {
  return (
    <div>
      <h2
        id={id}
        className="max-w-2xl font-display text-[2.25rem] font-bold leading-[1.02] tracking-[-0.025em] text-ink sm:text-5xl lg:text-[3.5rem]"
      >
        {title}
      </h2>
      {description && (
        <p className="mt-4 max-w-lg text-lg leading-relaxed text-ink-soft lg:mt-5 lg:text-xl">
          {description}
        </p>
      )}
    </div>
  );
}
