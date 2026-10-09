import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-sky-600 text-white shadow hover:bg-sky-700 dark:bg-sky-500",
        secondary:
          "border-transparent bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
        destructive:
          "border-transparent bg-rose-500 text-white shadow hover:bg-rose-600",
        outline: "text-slate-900 border-slate-300 dark:text-slate-100 dark:border-slate-700",
        success:
          "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300/40",
        warning:
          "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300/40",
        info:
          "border-transparent bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-300/40",
        purple:
          "border-transparent bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300/40",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
