// app/api/chat/route.js
// Automatically processes GPS location from frontend

import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { ObjectId } from 'mongodb'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY)

export async function POST(req) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token' }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-fallback-secret-key')
    } catch (error) {
      console.error('JWT verification error:', error)
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 })
    }

    const { message, image, language, conversationHistory, gpsLocation } = await req.json()
    
    const client = await clientPromise
    const db = client.db('smart-crop-disease')
    
    const user = await db.collection('users').findOne({ 
      _id: new ObjectId(decoded.userId)
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Process and geocode GPS location automatically
    let locationInfo = await processLocation(gpsLocation, user, db)

    const userLanguage = language || user.preferredLanguage || 'en'

    console.log('🌍 Using location:', locationInfo.displayName)

    // Fetch real-time data using GPS coordinates (most accurate)
    const [weatherData, marketData, cropAdvice] = await Promise.all([
      fetchWeatherData(locationInfo),
      fetchMarketPrices(locationInfo),
      fetchCropAdvisory(locationInfo.state || locationInfo.city)
    ])

    console.log('🌦️ Weather:', weatherData.temperature !== 'N/A' ? `${weatherData.temperature}°C` : 'N/A')
    console.log('💰 Market source:', marketData.source)

    const contextPrompt = buildContextPrompt(
      user, 
      locationInfo,
      weatherData, 
      marketData, 
      cropAdvice, 
      userLanguage,
      conversationHistory
    )

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    let result
    if (image) {
      const imageParts = [{
        inlineData: {
          data: image.split(',')[1],
          mimeType: 'image/jpeg'
        }
      }]

      const imagePrompt = `${contextPrompt}\n\nUser uploaded an image and asks: ${message}\n\nAnalyze this crop image for diseases, pests, nutrient deficiencies, or other issues. Provide detailed diagnosis and treatment recommendations in ${getLanguageName(userLanguage)}.`

      result = await model.generateContent([imagePrompt, ...imageParts])
    } else {
      const fullPrompt = `${contextPrompt}\n\nUser: ${message}\n\nAssistant:`
      result = await model.generateContent(fullPrompt)
    }

    const response = result.response.text()

    // Save conversation with location data
    await db.collection('conversations').insertOne({
      userId: user._id,
      userEmail: user.email,
      message,
      response,
      image: image ? true : false,
      language: userLanguage,
      location: locationInfo,
      weatherData,
      marketData,
      timestamp: new Date()
    })

    return NextResponse.json({
      response,
      weatherData,
      marketData,
      cropAdvice,
      userLocation: locationInfo.displayName,
      locationDetails: locationInfo
    })

  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { error: 'Failed to process request', details: error.message },
      { status: 500 }
    )
  }
}

// Process GPS location and reverse geocode
async function processLocation(gpsLocation, user, db) {
  let locationInfo = {}

  // PRIORITY 1: Use GPS from frontend (most accurate)
  if (gpsLocation?.latitude && gpsLocation?.longitude) {
    console.log('📍 Processing GPS coordinates from frontend')
    
    try {
      // Reverse geocode GPS coordinates
      const geocoded = await reverseGeocode(gpsLocation.latitude, gpsLocation.longitude)
      
      locationInfo = {
        coordinates: { 
          latitude: gpsLocation.latitude, 
          longitude: gpsLocation.longitude 
        },
        city: geocoded.city,
        state: geocoded.state,
        pincode: geocoded.pincode,
        district: geocoded.district,
        country: geocoded.country || 'India',
        displayName: geocoded.city && geocoded.state
          ? `${geocoded.city}, ${geocoded.state}`
          : geocoded.fullAddress || 'Unknown Location'
      }

      // Update user's location in database for future use
      await db.collection('users').updateOne(
        { _id: user._id },
        {
          $set: {
            location: locationInfo.displayName,
            city: locationInfo.city,
            state: locationInfo.state,
            pincode: locationInfo.pincode,
            district: locationInfo.district,
            gpsCoordinates: locationInfo.coordinates,
            locationUpdatedAt: new Date()
          }
        }
      )

      console.log('✅ Location geocoded and saved:', locationInfo.displayName)
      
    } catch (error) {
      console.error('Geocoding error:', error)
      // Fallback to coordinates
      locationInfo = {
        coordinates: gpsLocation,
        displayName: `${gpsLocation.latitude.toFixed(4)}, ${gpsLocation.longitude.toFixed(4)}`
      }
    }
  } 
  // PRIORITY 2: Use stored GPS coordinates from user profile
  else if (user.gpsCoordinates?.latitude && user.gpsCoordinates?.longitude) {
    console.log('📍 Using stored GPS coordinates from user profile')
    locationInfo = {
      coordinates: user.gpsCoordinates,
      city: user.city,
      state: user.state,
      pincode: user.pincode,
      district: user.district,
      displayName: user.location || `${user.city}, ${user.state}`
    }
  }
  // PRIORITY 3: Use text-based location from user profile
  else {
    console.log('📍 Using text-based location from user profile')
    locationInfo = {
      city: user.city,
      state: user.state,
      pincode: user.pincode,
      displayName: user.location || user.city || 'Delhi, India'
    }
  }

  return locationInfo
}

// Reverse geocode GPS coordinates to address
async function reverseGeocode(latitude, longitude) {
  try {
    // Try OpenStreetMap Nominatim (free, no API key)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'SmartCropDiseaseApp/1.0'
        }
      }
    )

    if (response.ok) {
      const data = await response.json()
      const addr = data.address

      return {
        city: addr.city || addr.town || addr.village || addr.county || addr.state_district,
        state: addr.state,
        country: addr.country,
        pincode: addr.postcode,
        district: addr.state_district || addr.county,
        fullAddress: data.display_name
      }
    }

    throw new Error('Geocoding failed')

  } catch (error) {
    console.error('Reverse geocode error:', error)
    
    // Fallback: Try to extract state from coordinates using rough mapping
    const state = getStateFromCoordinates(latitude, longitude)
    
    return {
      city: 'Unknown',
      state: state,
      country: 'India',
      pincode: null,
      fullAddress: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
    }
  }
}

// Approximate state detection from coordinates
function getStateFromCoordinates(lat, lon) {
  // Rough coordinate bounds for major Indian states
  if (lat >= 22.5 && lat <= 24.9 && lon >= 87.7 && lon <= 89.0) return 'West Bengal'
  if (lat >= 18.9 && lat <= 20.2 && lon >= 72.7 && lon <= 73.3) return 'Maharashtra'
  if (lat >= 28.4 && lat <= 28.9 && lon >= 76.8 && lon <= 77.4) return 'Delhi'
  if (lat >= 12.8 && lat <= 13.2 && lon >= 77.4 && lon <= 77.8) return 'Karnataka'
  if (lat >= 12.9 && lat <= 13.2 && lon >= 80.1 && lon <= 80.3) return 'Tamil Nadu'
  if (lat >= 17.3 && lat <= 17.5 && lon >= 78.3 && lon <= 78.6) return 'Telangana'
  if (lat >= 26.8 && lat <= 27.0 && lon >= 80.8 && lon <= 81.0) return 'Uttar Pradesh'
  if (lat >= 23.0 && lat <= 23.3 && lon >= 72.5 && lon <= 72.7) return 'Gujarat'
  if (lat >= 26.8 && lat <= 27.0 && lon >= 75.7 && lon <= 75.9) return 'Rajasthan'
  if (lat >= 30.7 && lat <= 30.8 && lon >= 76.7 && lon <= 76.9) return 'Punjab'
  
  return 'India'
}

function buildContextPrompt(user, locationInfo, weather, market, advisory, language, history) {
  const languageName = getLanguageName(language)
  
  let conversationContext = ''
  if (history && history.length > 0) {
    conversationContext = '\n\nPrevious conversation:\n' + 
      history.slice(-5).map(msg => `${msg.role}: ${msg.content}`).join('\n')
  }

  const locationDisplay = locationInfo.pincode 
    ? `${locationInfo.displayName} (PIN: ${locationInfo.pincode})`
    : locationInfo.displayName

  return `You are AgriBot, an expert AI agricultural assistant helping farmers in India. 

User Profile:
- Name: ${user.name}
- Location: ${locationDisplay}
- Farm Size: ${user.farmSize || 'Not specified'}
- Crops: ${user.crops?.join(', ') || 'Not specified'}
${locationInfo.coordinates ? `- GPS Coordinates: ${locationInfo.coordinates.latitude.toFixed(4)}, ${locationInfo.coordinates.longitude.toFixed(4)}` : ''}

Current Weather at Your Location:
- Temperature: ${weather.temperature}°C
- Condition: ${weather.condition}
- Humidity: ${weather.humidity}%
- Rainfall: ${weather.rainfall}mm
- Wind Speed: ${weather.windSpeed} km/h

Current Market Prices in ${locationInfo.state || locationInfo.city}:
${market.prices.map(p => `- ${p.crop}: ₹${p.price}/${p.unit} (${p.change})`).join('\n')}

Today's Crop Advisory:
${advisory.recommendations.join('\n')}

IMPORTANT INSTRUCTIONS:
1. Respond ONLY in ${languageName} language
2. Be conversational and friendly, like talking to a fellow farmer, dont need to talk about how are you etc.
3. Provide practical, actionable advice specific to their exact location
4. Consider the current weather and market conditions
5. Use simple language that farmers can easily understand
6. Include specific measurements, timings, and quantities
7. Warn about weather-related risks if relevant
8. Suggest optimal market timing based on current prices
${conversationContext}

Provide helpful, accurate farming advice based on the user's question.`
}

async function fetchWeatherData(locationInfo) {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY
    if (!apiKey) {
      return getDefaultWeatherData()
    }

    let url
    let data = null

    // Use GPS coordinates if available (most accurate)
    if (locationInfo.coordinates?.latitude && locationInfo.coordinates?.longitude) {
      const { latitude, longitude } = locationInfo.coordinates
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
      
      const response = await fetch(url, { 
        cache: 'no-store',
        signal: AbortSignal.timeout(5000)
      })
      
      if (response.ok) {
        data = await response.json()
      }
    }

    // Fallback to text-based location
    if (!data) {
      const locationVariants = [
        locationInfo.pincode,
        locationInfo.city,
        locationInfo.displayName,
        `${locationInfo.city},${locationInfo.state},IN`,
      ].filter(Boolean)

      for (const loc of locationVariants) {
        try {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(loc)}&appid=${apiKey}&units=metric`,
            { cache: 'no-store', signal: AbortSignal.timeout(5000) }
          )
          
          if (response.ok) {
            data = await response.json()
            break
          }
        } catch (err) {
          continue
        }
      }
    }

    if (!data) {
      return getDefaultWeatherData()
    }
    
    return {
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main,
      description: data.weather[0].description,
      humidity: data.main.humidity,
      rainfall: data.rain?.['1h'] || data.rain?.['3h'] || 0,
      windSpeed: Math.round(data.wind.speed * 3.6),
      pressure: data.main.pressure,
      icon: data.weather[0].icon,
      locationName: data.name
    }
  } catch (error) {
    console.error('Weather fetch error:', error)
    return getDefaultWeatherData()
  }
}

async function fetchMarketPrices(locationInfo) {
  try {
    const state = locationInfo.state || extractStateFromPincode(locationInfo.pincode)
    const apiKey = process.env.DATA_GOV_IN_API_KEY
    
    if (!apiKey) {
      return {
        prices: getDefaultPrices(),
        lastUpdated: new Date().toISOString(),
        source: 'Estimated'
      }
    }

    const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&filters[state]=${encodeURIComponent(state)}&limit=10`

    const response = await fetch(url, { 
      cache: 'no-store',
      signal: AbortSignal.timeout(8000)
    })
    
    if (!response.ok || !response.json) {
      throw new Error('Market API failed')
    }

    const data = await response.json()
    
    if (!data.records || data.records.length === 0) {
      return {
        prices: getDefaultPrices(),
        lastUpdated: new Date().toISOString(),
        source: 'Estimated'
      }
    }

    const uniqueCrops = new Map()
    for (const record of data.records) {
      if (record.commodity && record.modal_price && !uniqueCrops.has(record.commodity)) {
        uniqueCrops.set(record.commodity, record)
        if (uniqueCrops.size >= 5) break
      }
    }
    
    const prices = Array.from(uniqueCrops.values()).map(record => ({
      crop: record.commodity,
      price: record.modal_price,
      unit: 'quintal',
      change: calculatePriceChange(record),
      market: record.market || 'Local'
    }))
    
    return {
      prices: prices.length > 0 ? prices : getDefaultPrices(),
      lastUpdated: new Date().toISOString(),
      source: prices.length > 0 ? 'AGMARKNET (Live)' : 'Estimated',
      state
    }
  } catch (error) {
    return {
      prices: getDefaultPrices(),
      lastUpdated: new Date().toISOString(),
      source: 'Estimated'
    }
  }
}

function extractStateFromPincode(pincode) {
  if (!pincode) return 'Delhi'
  const pin = pincode.toString().substring(0, 2)
  const map = {
    '11': 'Delhi', '12': 'Haryana', '13': 'Punjab', '20': 'Uttar Pradesh',
    '30': 'Rajasthan', '36': 'Gujarat', '40': 'Maharashtra', '50': 'Telangana',
    '56': 'Karnataka', '60': 'Tamil Nadu', '67': 'Kerala', '70': 'West Bengal',
    '75': 'Odisha', '80': 'Bihar'
  }
  return map[pin] || 'Delhi'
}

async function fetchCropAdvisory(location) {
  const season = getSeason(new Date().getMonth())
  return {
    recommendations: getSeasonalRecommendations(season),
    season
  }
}

function getDefaultWeatherData() {
  return {
    temperature: 'N/A',
    condition: 'Data Unavailable',
    humidity: 'N/A',
    rainfall: 0,
    windSpeed: 'N/A'
  }
}

function getDefaultPrices() {
  return [
    { crop: 'Rice', price: '2100', unit: 'quintal', change: '→ Estimated' },
    { crop: 'Wheat', price: '2450', unit: 'quintal', change: '→ Estimated' },
    { crop: 'Potato', price: '1200', unit: 'quintal', change: '→ Estimated' }
  ]
}

function calculatePriceChange(record) {
  if (!record.modal_price || !record.min_price || !record.max_price) return '→ Stable'
  const modal = parseFloat(record.modal_price)
  const avg = (parseFloat(record.min_price) + parseFloat(record.max_price)) / 2
  const diff = ((modal - avg) / avg) * 100
  if (diff > 5) return `↑ +${Math.round(diff)}%`
  if (diff < -5) return `↓ ${Math.round(diff)}%`
  return '→ Stable'
}

function getSeason(month) {
  if (month >= 2 && month <= 5) return 'Summer/Kharif Prep'
  if (month >= 6 && month <= 9) return 'Kharif (Monsoon)'
  return 'Rabi (Winter)'
}

function getSeasonalRecommendations(season) {
  const recs = {
    'Summer/Kharif Prep': [
      '🌱 Prepare fields for Kharif sowing',
      '💧 Ensure irrigation systems are ready',
      '🌾 Select high-yielding seed varieties'
    ],
    'Kharif (Monsoon)': [
      '🌾 Continue rice/cotton/soybean cultivation',
      '💧 Manage water logging in fields',
      '🐛 Watch for pest outbreaks'
    ],
    'Rabi (Winter)': [
      '🌾 Focus on wheat, mustard, gram cultivation',
      '❄️ Protect crops from cold waves',
      '💧 Schedule irrigation carefully'
    ]
  }
  return recs[season] || recs['Rabi (Winter)']
}

function getLanguageName(code) {
  const langs = {
    en: 'English', hi: 'Hindi (हिंदी)', bn: 'Bengali (বাংলা)',
    te: 'Telugu (తెలుగు)', ta: 'Tamil (தமிழ்)', mr: 'Marathi (मराठी)',
    gu: 'Gujarati (ગુજરાતી)', kn: 'Kannada (ಕನ್ನಡ)', pa: 'Punjabi (ਪੰਜਾਬੀ)',
    ml: 'Malayalam (മലയാളം)', or: 'Odia (ଓଡ଼ିଆ)'
  }
  return langs[code] || 'English'
}