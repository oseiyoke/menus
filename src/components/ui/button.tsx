import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-400 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary-400 text-white shadow hover:bg-primary-500",
        destructive: "bg-red-500 text-white shadow-sm hover:bg-red-600",
        outline: "border border-primary-300 bg-transparent shadow-sm hover:bg-primary-50 text-primary-500",
        secondary: "bg-surface-100 text-gray-900 shadow-sm hover:bg-surface-200",
        ghost: "hover:bg-primary-50 hover:text-primary-500",
        link: "text-primary-500 underline-offset-4 hover:underline",
        accent: "bg-accent-300 text-white shadow hover:bg-accent-400",
        // Meal type variants
        breakfast: "bg-orange-100 text-orange-800 border border-orange-200 hover:bg-orange-200",
        lunch: "bg-primary-100 text-primary-800 border border-primary-200 hover:bg-primary-200",
        dinner: "bg-purple-100 text-purple-800 border border-purple-200 hover:bg-purple-200",
        snack: "bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-yellow-200",
      },
      size: {
        default: "h-8 px-4 py-1.5",
        sm: "h-7 rounded-md px-3 text-xs",
        lg: "h-9 rounded-md px-6",
        icon: "h-8 w-8",
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
  ({ className, variant, size, asChild = false, ...props }, ref) => {
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