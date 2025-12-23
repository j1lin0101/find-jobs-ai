import React from 'react'
import { cn } from '../../lib/cn'

interface InputProps extends React.ComponentProps<'input'> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
    <input
        ref={ref}
        type={type}
        className={cn(
            'flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-base placeholder:text-gray-500 transition-colors outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
            className
        )}
        {...props}
    />
))

Input.displayName = 'Input'

export { Input }
