// components/ui/button.jsx
import React from 'react'

export const Button = React.forwardRef(({ 
  children, 
  className = '', 
  variant = 'default', 
  ...props 
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-2xl px-4 py-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
  
  const variants = {
    default: 'bg-green-600 text-white hover:bg-green-700',
    outline: 'border border-green-600 text-green-600 hover:bg-green-50',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
  }

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
})

Button.displayName = 'Button'