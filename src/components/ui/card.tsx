import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm", // Default shadow-sm
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

// Changed CardTitle to use h3 for better semantics
const CardTitle = React.forwardRef<
  HTMLHeadingElement, // Changed from HTMLDivElement
  React.HTMLAttributes<HTMLHeadingElement> // Changed from HTMLDivElement
>(({ className, ...props }, ref) => (
  <h3 // Changed from div
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight", // Adjusted default size to text-xl
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

// Changed CardDescription to use p tag
const CardDescription = React.forwardRef<
  HTMLParagraphElement, // Changed from HTMLDivElement
  React.HTMLAttributes<HTMLParagraphElement> // Changed from HTMLDivElement
>(({ className, ...props }, ref) => (
  <p // Changed from div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
