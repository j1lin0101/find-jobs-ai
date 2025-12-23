import React from 'react'
import { cn } from '../../lib/cn'

interface LabelProps extends React.ComponentProps<'label'> { }

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(({ className, ...props }, ref) => (
    <label
        ref={ref}
        className={cn('text-sm leading-none font-medium select-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)}
        {...props}
    />
))

Label.displayName = 'Label'

export { Label }
