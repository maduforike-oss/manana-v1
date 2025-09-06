import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const headingVariants = cva(
  "font-bold leading-tight tracking-tight",
  {
    variants: {
      variant: {
        default: "text-foreground",
        gradient: "bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent",
        "gradient-primary": "bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent",
        "gradient-emerald": "bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent",
        muted: "text-muted-foreground",
      },
      size: {
        xs: "text-lg",
        sm: "text-xl",
        md: "text-2xl",
        lg: "text-3xl",
        xl: "text-4xl",
        "2xl": "text-5xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  level?: 1 | 2 | 3 | 4 | 5 | 6
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, variant, size, level = 1, ...props }, ref) => {
    const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
    return (
      <Tag
        className={cn(headingVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Heading.displayName = "Heading"

export { Heading, headingVariants }