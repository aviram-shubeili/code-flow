import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', size = 'md', loading = false, disabled, children, ...props },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

    const variantStyles = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
      outline: 'border border-gray-300 bg-transparent hover:bg-gray-100',
      ghost: 'hover:bg-gray-100',
    }

    const sizeStyles = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-11 px-8 text-base',
    }

    const styles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className || ''}`

    return (
      <button ref={ref} className={styles} disabled={disabled || loading} {...props}>
        {loading ? (
          <>
            <span className="mr-2 animate-spin">⏳</span>
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
