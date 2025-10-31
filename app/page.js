// app/page.jsx

'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/context/auth-context'
import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function Home() {
  const { user } = useAuth()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }

  const floatingVariants = {
    animate: {
      y: [0, -12, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  return (
    <div className=" bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 -mt-10 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        {/* Floating Elements */}
        {/* <motion.div
          animate={{ y: [-20, 20, -20], x: [-10, 10, -10] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 left-10 w-32 h-32 bg-green-200/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [20, -20, 20], x: [10, -10, 10] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-20 right-10 w-40 h-40 bg-lime-200/30 rounded-full blur-3xl"
        /> */}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={isVisible ? "visible" : "hidden"}
              className="text-center lg:text-left"
            >
              {/* Badge */}
              <motion.div
                variants={itemVariants}
                className="inline-flex items-center px-4 py-2 bg-green-600/10 border border-green-600/20 rounded-full text-green-700 text-sm font-medium mb-6"
              >
                <span className="mr-2">✨</span>
                AI-Powered Crop Protection
              </motion.div>

              <motion.h1 
                className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
                variants={itemVariants}
              >
                Protect Your Crops with
                <span className="block text-green-600 mt-2">Smart AI Detection</span>
              </motion.h1>

              <motion.p 
                className="text-lg lg:text-xl text-gray-600 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0"
                variants={itemVariants}
              >
                Instantly identify crop diseases through AI image analysis and get expert guidance. Save your harvest, reduce losses, and maximize your yield.
              </motion.p>

              {/* Action Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12"
                variants={itemVariants}
              >
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Link href="/detection">
                    <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3 w-full sm:w-auto justify-center">
                      <span>📸</span>
                      Detect Disease
                    </button>
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Link href="/chatbot">
                    <button className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center gap-3 w-full sm:w-auto justify-center">
                      <span>💬</span>
                      Ask AI Assistant
                    </button>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Stats */}
              {/* <motion.div 
                variants={itemVariants}
                className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200"
              >
                {[
                  { number: '50K+', label: 'Farmers Helped' },
                  { number: '95%', label: 'Accuracy Rate' },
                  { number: '24/7', label: 'AI Support' }
                ].map((stat) => (
                  <div key={stat.label} className="text-center lg:text-left">
                    <div className="text-2xl font-bold text-green-600">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </motion.div> */}
            </motion.div>

            {/* Hero Visual - Banner Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-white rounded-4xl shadow-2xl  transform rotate-0 hover:rotate-2 transition-transform duration-500">
                <div className="relative h-72 lg:h-[400px] w-full rounded-4xl cursor-pointer">
                  <Image
                    // src="/farmer.webp"
                    src="/photo1.webp"
                    alt="AI Crop Disease Detection - Smart Farming Technology"
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                  />
                  {/* Overlay with app info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-white text-sm font-medium">AI Analysis Active</span>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                      <div className="text-xs text-green-200 mb-1">Real-time Detection</div>
                      <div className="text-sm font-semibold text-white">Healthy Crop - 98% Confidence</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Icons */}
              {/* <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-orange-500 text-white rounded-full p-4 shadow-lg z-10"
              >
                <span className="text-xl">⚡</span>
              </motion.div>

              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                className="absolute -bottom-4 -left-4 bg-blue-500 text-white rounded-full p-4 shadow-lg z-10"
              >
                <span className="text-xl">🛡️</span>
              </motion.div> */}
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Simple three-step process to identify and treat crop diseases effectively with AI-powered precision
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                step: '1', 
                title: 'Upload Images', 
                desc: 'Capture and upload clear photos of affected crop areas from multiple angles for accurate analysis',
                icon: '📸',
                gradient: 'from-blue-500 to-cyan-500'
              },
              { 
                step: '2', 
                title: 'AI Analysis', 
                desc: 'Our advanced neural network analyzes images against 50+ disease patterns with 95% accuracy',
                icon: '🤖',
                gradient: 'from-purple-500 to-pink-500'
              },
              { 
                step: '3', 
                title: 'Get Solutions', 
                desc: 'Receive detailed diagnosis and organic treatment recommendations tailored to your crop',
                icon: '💡',
                gradient: 'from-green-500 to-emerald-500'
              }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="relative group"
              >
                <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 h-full">
                  {/* Icon with Gradient */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${item.gradient} rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                  
                  <div className="absolute top-6 right-6 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-md">
                    {item.step}
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-green-600 transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.desc}
                  </p>

                  {/* Hover Arrow */}
                  <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center text-green-600 font-medium">
                      <span className="text-sm">Learn more</span>
                      <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </div>
                  </div>
                </div>

                {/* Connecting Line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 border-t-2 border-dashed border-gray-300 z-10" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Farming
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Comprehensive AI-powered tools designed specifically for farmers to detect, prevent, and treat crop diseases
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { 
                title: 'Multi-Language Support', 
                desc: 'Available in English, Hindi, and Bengali to serve farmers across different regions',
                icon: '🌐',
                gradient: 'from-blue-500 to-cyan-500'
              },
              { 
                title: 'Voice Interaction', 
                desc: 'Ask questions using voice commands and receive spoken responses for hands-free operation',
                icon: '🎤',
                gradient: 'from-purple-500 to-pink-500'
              },
              { 
                title: 'Offline Access', 
                desc: 'Core features work offline with PWA technology and auto-sync when connected',
                icon: '📡',
                gradient: 'from-green-500 to-emerald-500'
              },
              { 
                title: 'Smart Image Analysis', 
                desc: 'Advanced AI processes images with automatic enhancement and pattern recognition',
                icon: '📷',
                gradient: 'from-orange-500 to-red-500'
              },
              { 
                title: 'Detection History', 
                desc: 'Track analyses with searchable history, trends, and seasonal disease patterns',
                icon: '📜',
                gradient: 'from-indigo-500 to-blue-500'
              },
              { 
                title: 'Analytics Dashboard', 
                desc: 'Visualize crop health trends and treatment effectiveness with interactive charts',
                icon: '📊',
                gradient: 'from-teal-500 to-green-500'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group"
              >
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 h-full">
                  <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r ${feature.gradient} rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-2xl">{feature.icon}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-green-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.desc}
                  </p>

                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center text-green-600 font-medium text-sm">
                      <span>Explore</span>
                      <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-16"
          >
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-8 lg:p-12 text-white shadow-2xl">
              <div className="text-center max-w-3xl mx-auto">
                <h3 className="text-2xl lg:text-3xl font-bold mb-4">Ready to Protect Your Crops?</h3>
                <p className="text-lg text-green-100 mb-8">
                  Join thousands of farmers who are already using AI to detect diseases early and save their harvests
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/detection">
                      <button className="bg-white text-green-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-300 flex items-center justify-center space-x-2 w-full sm:w-auto">
                        <span>📸</span>
                        <span>Start Detection</span>
                      </button>
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/chatbot">
                      <button className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-green-600 transition-all duration-300 flex items-center justify-center space-x-2 w-full sm:w-auto">
                        <span>💬</span>
                        <span>Try AI Assistant</span>
                      </button>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🌱</span>
                </div>
                <span className="text-2xl font-bold">Nidan</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
                Empowering farmers with AI-powered crop disease detection and expert guidance. Protecting harvests and building sustainable agriculture.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4 text-lg">Quick Links</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/detection" className="hover:text-green-400 transition-colors">Disease Detection</Link></li>
                <li><Link href="/chatbot" className="hover:text-green-400 transition-colors">AI Assistant</Link></li>
                <li><Link href="/history" className="hover:text-green-400 transition-colors">Detection History</Link></li>
                <li><Link href="/analytics" className="hover:text-green-400 transition-colors">Analytics</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4 text-lg">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-green-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>© {new Date().getFullYear()} CropCare AI. All rights reserved.</p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <span>🇮🇳 Made in India</span>
              <span>🛡️ Secure & Trusted</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}