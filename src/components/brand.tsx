type BrandLogoProps = {
  className?: string;
  markClassName?: string;
  textClassName?: string;
};

export function BrandLogo({
  className = "",
  markClassName = "",
  textClassName = "",
}: BrandLogoProps) {
  return (
    <span
      className={`inline-flex items-baseline leading-none ${className}`}
      aria-label="QUTB"
    >
      <span
        className={`font-brand-script text-[1.65em] font-bold leading-none ${markClassName}`}
      >
        Q
      </span>
      <span
        className={`font-brand-editorial text-[0.74em] font-normal tracking-[0.08em] ${textClassName}`}
      >
        UTB
      </span>
    </span>
  );
}
