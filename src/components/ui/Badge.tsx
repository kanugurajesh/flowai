import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-zinc-800 text-zinc-300",
        indigo: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30",
        green: "bg-green-500/20 text-green-300 border border-green-500/30",
        yellow: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
        red: "bg-red-500/20 text-red-300 border border-red-500/30",
        blue: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
        purple: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
