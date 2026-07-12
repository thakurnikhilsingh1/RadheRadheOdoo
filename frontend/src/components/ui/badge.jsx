import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold leading-4 transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-slate-900 text-white",
        secondary: "border-transparent bg-slate-100 text-slate-600",
        success: "border-transparent bg-slate-100 text-slate-700",
        info: "border-transparent bg-slate-100 text-slate-700",
        warning: "border-transparent bg-amber-50 text-amber-700",
        destructive: "border-transparent bg-red-50 text-red-600",
        outline: "border-slate-200 text-slate-600",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
