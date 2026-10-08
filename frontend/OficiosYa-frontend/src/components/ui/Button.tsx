import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  children?: ReactNode
}

function Button({
  variant = 'primary',
  children,
  className,
  ...props
}: ButtonProps) {
  const buttonClassName = className
    ? `button button-${variant} ${className}`
    : `button button-${variant}`

  return (
    <button className={buttonClassName} {...props}>
      {children}
    </button>
  )
}

export default Button