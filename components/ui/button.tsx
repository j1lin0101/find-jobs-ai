import React from 'react'
import { cn } from '../../lib/cn'

const buttonVariants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50',
    ghost: 'hover:bg-gray-100 text-gray-900',
}

const buttonSizes = {
    default: 'h-9 px-4 py-2',
    sm: 'h-8 rounded-md px-3 text-sm',
    lg: 'h-10 rounded-md px-6 text-base',
    icon: 'h-9 w-9 rounded-md',
}

interface ButtonProps extends React.ComponentProps<'button'> {
    variant?: keyof typeof buttonVariants
    size?: keyof typeof buttonSizes
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', ...props }, ref) => (
        <button
            ref={ref}
            className={cn(
                'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                buttonVariants[variant],
                buttonSizes[size],
                className
            )}
            {...props}
        />
    )
)

Button.displayName = 'Button'

export { Button }
