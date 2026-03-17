import Image from "next/image";

export default function Logo({
  className,
  ariaLabel,
}: {
  className?: string;
  ariaLabel: string;
}) {
  return (
    <div className="flex items-center space-x-2">
      <Image
        src="/logo.png"
        alt={ariaLabel || "Logo"}
        width={100}
        height={100}
        className={className}
      />
      {/* <span className={className}>PagesPilot</span> */}
    </div>
  );
}
