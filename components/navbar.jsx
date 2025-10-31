// components/navbar.jsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown, LogOut, User } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/detection', label: 'Detect Disease' },
    { href: '/chatbot', label: 'AI Assistant' },
    { href: '/history', label: 'History' },
    // { href: '/dashboard', label: 'Dashboard' },
    { href: '/about-us', label: 'About us' },
  ]

  return (
    <nav
      className={`bg-white border-b sticky top-0 z-50 transition-all duration-300 px-6 py-1 ${
        scrolled ? 'border-green-200 shadow-md' : 'border-green-100'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="relative w-22 h-22 transition-transform group-hover:scale-110 duration-300">
              <Image
                src="/logo2.png"
                alt="Nidan Logo"
                fill
                className="object-contain bg-blend-color-burn"
                priority
              />
            </div>
            <span className="font-bold -ml-3 text-3xl text-green-800 group-hover:text-green-600 transition-colors">
              Nidan
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-4 py-2 rounded-2xl font-medium transition-colors ${
                    isActive ? 'text-green-700' : 'text-gray-600 hover:text-green-600'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 bg-green-100 rounded-2xl -z-10"
                      layoutId="navbar-active"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-2xl hover:bg-green-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown Menu */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden"
                    >
                      <Link
                        href="/profile"
                        className="flex items-center space-x-2 px-4 py-3 hover:bg-green-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-700">Profile</span>
                      </Link>
                      <button
                        onClick={() => {
                          logout()
                          setUserMenuOpen(false)
                        }}
                        className="flex items-center space-x-2 px-4 py-3 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-red-600">Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors px-4 py-2"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-2xl text-sm font-medium transition-all hover:shadow-lg hover:shadow-green-200"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-green-50 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-green-100 py-4"
            >
              <div className="flex flex-col space-y-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-4 py-3 rounded-2xl font-medium transition-colors ${
                        isActive
                          ? 'bg-green-100 text-green-700'
                          : 'text-gray-600 hover:bg-green-50 hover:text-green-600'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                })}

                {/* Mobile Auth Section */}
                <div className="pt-4 border-t border-green-100 space-y-2">
                  {user ? (
                    <>
                      <div className="px-4 py-2 flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{user.name}</span>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center space-x-2 px-4 py-3 rounded-2xl hover:bg-green-50 transition-colors"
                      >
                        <User className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-700">Profile</span>
                      </Link>
                      <button
                        onClick={logout}
                        className="flex items-center space-x-2 px-4 py-3 rounded-2xl hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-red-600">Logout</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        className="block px-4 py-3 rounded-2xl text-center font-medium text-gray-600 hover:bg-green-50 hover:text-green-600 transition-colors"
                      >
                        Login
                      </Link>
                      <Link
                        href="/auth/register"
                        className="block bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-2xl text-center font-medium transition-colors"
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}