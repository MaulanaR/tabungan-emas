import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-2 focus-visible:outline-offset-2",
  {
    variants: {
      variant: {
        default: 'bg-gold-gradient text-on-primary-container font-extrabold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0',
        destructive:
          'bg-error text-white hover:bg-error/90 font-semibold',
        outline:
          'bg-surface-container-lowest border border-outline-variant shadow-sm hover:bg-surface-container hover:shadow-md',
        secondary:
          'bg-surface-container text-on-surface font-semibold hover:bg-surface-container-low shadow-sm',
        ghost:
          'bg-transparent hover:bg-surface-container',
        link: 'text-primary underline-offset-4 hover:underline font-medium',
        gold: 'bg-gold-gradient text-on-primary-container font-display font-extrabold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0',
      },
      size: {
        default: 'h-10 px-4 py-2.5 has-[>svg]:px-3',
        sm: 'h-8 rounded-lg gap-1.5 px-3 has-[>svg]:px-2.5 py-2',
        lg: 'h-12 rounded-xl px-8 py-3 has-[>svg]:px-6',
        icon: 'size-10 rounded-full',
        'icon-sm': 'size-8 rounded-full',
        'icon-lg': 'size-12 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
