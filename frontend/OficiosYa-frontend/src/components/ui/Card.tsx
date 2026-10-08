import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}

function Card({ children, className, ...props }: CardProps) {
  const cardClassName = className ? `card ${className}` : 'card'

  return (
    <div className={cardClassName} {...props}>
      {children}
    </div>
  )
}

export default Card