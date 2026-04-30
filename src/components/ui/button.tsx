import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const variantStyles = {
      default: "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-sm hover:opacity-95 hover:shadow-md",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline: "border border-primary/30 bg-white/90 text-primary hover:bg-primary/5",
      secondary: "bg-white/90 text-primary border border-primary/25 hover:bg-white",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
    }
    
    const sizeStyles = {
      default: "h-11 px-4 py-2",
      sm: "h-9 rounded-xl px-3",
      lg: "h-12 rounded-xl px-8",
      icon: "h-10 w-10 rounded-xl",
    }
    
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
