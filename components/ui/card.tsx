import React from 'react'
import { cn } from '../../lib/cn'

function Card({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            className={cn(
                'bg-white text-foreground flex flex-col gap-6 rounded-xl border border-gray-200 shadow-sm',
                className
            )}
            {...props}
        />
    )
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            className={cn('grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6', className)}
            {...props}
        />
    )
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
    return <h4 className={cn('leading-none font-medium', className)} {...props} />
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
    return <p className={cn('text-gray-600 text-sm', className)} {...props} />
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
    return <div className={cn('px-6 pb-6', className)} {...props} />
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
    return <div className={cn('flex items-center px-6 pb-6', className)} {...props} />
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
