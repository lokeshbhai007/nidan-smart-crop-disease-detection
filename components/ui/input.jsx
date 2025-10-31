// components/ui/input.jsx
import React from 'react'

export const Input = React.forwardRef(({ className = '', type = 'text', ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={`flex h-10 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  )
})

Input.displayName = 'Input'