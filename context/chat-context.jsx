// context/chat-context.jsx
'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const ChatContext = createContext()

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([])
  const [language, setLanguage] = useState('en')
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [gpsLocation, setGpsLocation] = useState(null)
  const [locationStatus, setLocationStatus] = useState('idle') // idle, detecting, detected, failed

  // Auto-detect GPS location on mount
  useEffect(() => {
    detectLocation()
  }, [])

  const detectLocation = async () => {
    try {
      // Check localStorage cache (1 hour validity)
      const cached = localStorage.getItem('gps_location_cache')
      if (cached) {
        const { location, timestamp } = JSON.parse(cached)
        const age = Date.now() - timestamp
        const ONE_HOUR = 60 * 60 * 1000

        if (age < ONE_HOUR) {
          console.log('📍 Using cached GPS location')
          setGpsLocation(location)
          setLocationStatus('detected')
          return
        } else {
          console.log('📍 Cache expired, fetching fresh location')
          localStorage.removeItem('gps_location_cache')
        }
      }

      // Check if geolocation is available
      if (!navigator.geolocation) {
        console.warn('⚠️ Geolocation not supported')
        setLocationStatus('failed')
        return
      }

      setLocationStatus('detecting')

      // Get GPS coordinates
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          }

          // Cache for 1 hour
          localStorage.setItem('gps_location_cache', JSON.stringify({
            location: locationData,
            timestamp: Date.now()
          }))

          setGpsLocation(locationData)
          setLocationStatus('detected')
          console.log('✅ GPS location detected:', locationData)
        },
        (error) => {
          console.error('❌ GPS detection failed:', error.message)
          setLocationStatus('failed')
          // Continue without location - backend will use fallback
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    } catch (error) {
      console.error('Location detection error:', error)
      setLocationStatus('failed')
    }
  }

  const addMessage = (message) => {
    setMessages(prev => [...prev, message])
  }

  const clearMessages = () => {
    setMessages([])
  }

  const sendMessage = async (content, image = null) => {
    const userMessage = { 
      id: Date.now().toString(), 
      content, 
      image, 
      role: 'user', 
      timestamp: new Date() 
    }
    addMessage(userMessage)

    // Add loading indicator
    const loadingMessage = {
      id: (Date.now() + 1).toString(),
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      loading: true
    }
    addMessage(loadingMessage)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: content, 
          image, 
          language,
          gpsLocation: gpsLocation, // Automatically send GPS location to backend
          conversationHistory: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      })

      // Remove loading message
      setMessages(prev => prev.filter(msg => msg.id !== loadingMessage.id))

      if (response.ok) {
        const data = await response.json()
        const aiMessage = {
          id: (Date.now() + 2).toString(),
          content: data.response,
          role: 'assistant',
          timestamp: new Date(),
          suggestions: data.suggestions,
          weatherData: data.weatherData,
          marketData: data.marketData,
          userLocation: data.userLocation
        }
        addMessage(aiMessage)

        // Voice output if enabled
        if (voiceEnabled && 'speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(data.response)
          utterance.lang = getVoiceLang(language)
          window.speechSynthesis.speak(utterance)
        }
      } else {
        throw new Error('API request failed')
      }
    } catch (error) {
      console.error('Chat API error:', error)
      
      // Remove loading message
      setMessages(prev => prev.filter(msg => msg.id !== loadingMessage.id))
      
      const errorMessage = {
        id: (Date.now() + 2).toString(),
        content: "I'm having trouble connecting right now. Please try again later.",
        role: 'assistant',
        timestamp: new Date(),
        error: true
      }
      addMessage(errorMessage)
    }
  }

  const getVoiceLang = (langCode) => {
    const langMap = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'bn': 'bn-IN',
      'te': 'te-IN',
      'ta': 'ta-IN',
      'mr': 'mr-IN',
      'gu': 'gu-IN',
      'kn': 'kn-IN',
      'pa': 'pa-IN',
      'ml': 'ml-IN',
      'or': 'or-IN'
    }
    return langMap[langCode] || 'en-US'
  }

  return (
    <ChatContext.Provider value={{
      messages,
      language,
      voiceEnabled,
      gpsLocation,
      locationStatus,
      setLanguage,
      setVoiceEnabled,
      sendMessage,
      clearMessages,
      addMessage,
      detectLocation
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}