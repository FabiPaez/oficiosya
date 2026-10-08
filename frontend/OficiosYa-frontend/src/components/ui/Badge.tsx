import type { HTMLAttributes, ReactNode } from 'react'

type BadgeVariant = 'premium' | 'excellent' | 'premium-excellent'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant: BadgeVariant
  children?: ReactNode
}

function Badge({
  variant,
  children,
  className,
  ...props
}: BadgeProps) {
  const badgeClassName = className
    ? `badge badge-${variant} ${className}`
    : `badge badge-${variant}`

  return (
    <span className={badgeClassName} {...props}>
      {children}
    </span>
  )
}

export default Badge