import React from 'react'
import { cn } from '../../lib/cn'

interface TextareaProps extends React.ComponentProps<'textarea'> { }

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
    <textarea
        ref={ref}
        className={cn(
            'flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base placeholder:text-gray-500 transition-colors outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed resize-none',
            className
        )}
        {...props}
    />
))

Textarea.displayName = 'Textarea'

export { Textarea }
