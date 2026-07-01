import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  headingLevel?: "h1" | "h2" | "h3";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  headingLevel: Heading = "h2",
}: SectionHeadingProps) {
  return (
    <div
      className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}
    >
      {eyebrow ? (
        <div
          className={cn(
            "mb-4 inline-flex rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary",
            align === "center" && "mx-auto",
          )}
        >
          {eyebrow}
        </div>
      ) : null}

      <Heading className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
        {title}
      </Heading>

      {description ? (
        <p className="mt-5 text-base leading-8 text-muted-foreground sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
