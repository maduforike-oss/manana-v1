import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const headingVariants = cva(
  "font-semibold tracking-tight",
  {
    variants: {
      variant: {
        default: "text-foreground",
        gradient: "bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent",
        primary: "text-primary",
        secondary: "text-secondary",
        muted: "text-muted-foreground",
      },
      size: {
        h1: "text-3xl font-bold",
        h2: "text-2xl",
        h3: "text-xl",
        h4: "text-lg font-medium",
        h5: "text-base font-medium",
        h6: "text-sm font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "h2",
    },
  }
);

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, variant, size, as = "h2", ...props }, ref) => {
    const Comp = as;
    return (
      <Comp
        className={cn(headingVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Heading.displayName = "Heading";

export { Heading, headingVariants };