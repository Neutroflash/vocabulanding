export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const text = size === "lg" ? "text-4xl sm:text-5xl" : "text-xl";
  return (
    <span className={`${text} font-black tracking-tight text-brand`}>
      <span aria-hidden="true">🚀 </span>
      Vocabu<span className="text-sun-dark">landing</span>
    </span>
  );
}
