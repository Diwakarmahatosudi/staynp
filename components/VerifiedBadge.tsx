import { MdVerified } from "react-icons/md";

interface VerifiedBadgeProps {
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function VerifiedBadge({
  size = "md",
  showLabel = true,
}: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: "text-xs gap-1 px-2 py-0.5",
    md: "text-xs gap-1.5 px-3 py-1",
    lg: "text-sm gap-2 px-4 py-1.5",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full bg-nepal-forest/10 font-semibold text-nepal-forest ${sizeClasses[size]}`}
    >
      <MdVerified className={iconSizes[size]} />
      {showLabel && "Verified Local"}
    </span>
  );
}
