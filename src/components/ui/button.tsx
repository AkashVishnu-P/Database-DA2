import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] transition-all",
  {
    variants: {
      variant: {
        default:
          "bg-sky-600 text-white shadow-sm hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600",
        destructive:
          "bg-rose-600 text-white shadow-sm hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-800",
        outline:
          "border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800",
        secondary:
          "bg-slate-100 text-slate-900 shadow-sm hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
        ghost:
          "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:text-slate-200 dark:hover:text-white",
        link: "text-sky-600 underline-offset-4 hover:underline dark:text-sky-400",
        success:
          "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-lg px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
