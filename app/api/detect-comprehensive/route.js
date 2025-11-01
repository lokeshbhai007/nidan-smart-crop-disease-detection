// app/api/detect-comprehensive/route.js
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Language mapping
const languageMap = {
  'hindi': 'Hindi (हिंदी)',
  'bengali': 'Bengali (বাংলা)',
  'telugu': 'Telugu (తెలుగు)',
  'marathi': 'Marathi (मराठी)',
  'tamil': 'Tamil (தமிழ்)',
  'gujarati': 'Gujarati (ગુજરાતી)'
}

const speechLangMap = {
  'hindi': 'hi-IN',
  'bengali': 'bn-IN',
  'telugu': 'te-IN',
  'marathi': 'mr-IN',
  'tamil': 'ta-IN',
  'gujarati': 'gu-IN'
}

// Static image database with real Amazon product images
const PRODUCT_IMAGES = {
  // Fungicides
  'dithane m-45': 'https://m.media-amazon.com/images/I/61N8ZqxQiOL._SL1500_.jpg',
  'dithane': 'https://m.media-amazon.com/images/I/61N8ZqxQiOL._SL1500_.jpg',
  'bavistin': 'https://m.media-amazon.com/images/I/61-xvN0SYHL._SL1500_.jpg',
  'blitox': 'https://m.media-amazon.com/images/I/71nZGCGzq9L._SL1500_.jpg',
  'mancozeb': 'https://m.media-amazon.com/images/I/61N8ZqxQiOL._SL1500_.jpg',
  'carbendazim': 'https://m.media-amazon.com/images/I/71XK5qN8zPL._SL1500_.jpg',
  'copper oxychloride': 'https://m.media-amazon.com/images/I/71nZGCGzq9L._SL1500_.jpg',
  
  // Insecticides
  'confidor': 'https://m.media-amazon.com/images/I/71QxY0JKYPL._SL1500_.jpg',
  'ripcord': 'https://m.media-amazon.com/images/I/61qZpGJ8KSL._SL1500_.jpg',
  'dursban': 'https://m.media-amazon.com/images/I/71jnTqQx8fL._SL1500_.jpg',
  'imidacloprid': 'https://m.media-amazon.com/images/I/71QxY0JKYPL._SL1500_.jpg',
  'chlorpyrifos': 'https://m.media-amazon.com/images/I/71jnTqQx8fL._SL1500_.jpg',
  'cypermethrin': 'https://m.media-amazon.com/images/I/61qZpGJ8KSL._SL1500_.jpg',
  
  // Fertilizers
  'npk': 'https://m.media-amazon.com/images/I/71kxMZB8xyL._SL1500_.jpg',
  'urea': 'https://m.media-amazon.com/images/I/61wRHxN5XqL._SL1500_.jpg',
  'dap': 'https://m.media-amazon.com/images/I/71WQxN5KVSL._SL1500_.jpg',
  'multiplex': 'https://m.media-amazon.com/images/I/71kxMZB8xyL._SL1500_.jpg',
  'iffco': 'https://m.media-amazon.com/images/I/61wRHxN5XqL._SL1500_.jpg',
  'chambal': 'https://m.media-amazon.com/images/I/71WQxN5KVSL._SL1500_.jpg',
  
  // Generic categories
  'fungicide': 'https://m.media-amazon.com/images/I/61N8ZqxQiOL._SL1500_.jpg',
  'insecticide': 'https://m.media-amazon.com/images/I/71QxY0JKYPL._SL1500_.jpg',
  'pesticide': 'https://m.media-amazon.com/images/I/71jnTqQx8fL._SL1500_.jpg',
  'fertilizer': 'https://m.media-amazon.com/images/I/71kxMZB8xyL._SL1500_.jpg',
}

// Weather interpretation for disease correlation
function interpretWeatherForDisease(weatherData) {
  const insights = []
  
  if (weatherData.humidity > 80) {
    insights.push(`High humidity (${weatherData.humidity}%) creates favorable conditions for fungal diseases`)
  }
  
  if (weatherData.temperature > 30) {
    insights.push(`High temperature (${weatherData.temperature}°C) may stress plants and attract pests`)
  }
  
  if (weatherData.temperature < 15) {
    insights.push(`Low temperature (${weatherData.temperature}°C) can slow growth and increase disease susceptibility`)
  }
  
  if (weatherData.precipitation > 5) {
    insights.push(`Recent rainfall (${weatherData.precipitation}mm) increases risk of water-borne diseases`)
  } else if (weatherData.precipitation === 0 && weatherData.humidity < 40) {
    insights.push('Dry conditions may cause drought stress and attract certain pests')
  }
  
  if (weatherData.windSpeed > 20) {
    insights.push(`Strong winds (${weatherData.windSpeed}km/h) can spread airborne diseases and pests`)
  }
  
  return insights
}

// Get default product image from static database
function getDefaultProductImage(productName) {
  const searchName = productName.toLowerCase().trim()
  
  // Direct match
  if (PRODUCT_IMAGES[searchName]) {
    return PRODUCT_IMAGES[searchName]
  }
  
  // Partial match
  for (const [key, imageUrl] of Object.entries(PRODUCT_IMAGES)) {
    if (searchName.includes(key) || key.includes(searchName)) {
      return imageUrl
    }
  }
  
  // Fallback to colored placeholder with product name
  const color = productName.toLowerCase().includes('insect') ? '8b0000' : 
                productName.toLowerCase().includes('fung') ? '2d5016' : 
                '4a5d23'
  
  return `https://placehold.co/200x200/${color}/white?text=${encodeURIComponent(productName.substring(0, 15))}&font=roboto`
}

// Fetch product image from Unsplash API
async function fetchProductImageUnsplash(productName) {
  try {
    const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY
    
    if (!UNSPLASH_ACCESS_KEY) {
      console.warn('Unsplash API key not configured, using default images')
      return getDefaultProductImage(productName)
    }

    const searchQuery = `${productName} agriculture pesticide bottle product`
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=1&orientation=squarish&client_id=${UNSPLASH_ACCESS_KEY}`
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (data.results && data.results.length > 0) {
      return data.results[0].urls.small // 400x400 image
    }
    
    return getDefaultProductImage(productName)
  } catch (error) {
    console.error('Unsplash fetch error:', error)
    return getDefaultProductImage(productName)
  }
}

// Main POST handler
export async function POST(request) {
  try {
    const { image, selectedCrop, farmerInput, weatherData, location, userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!selectedCrop || !farmerInput) {
      return NextResponse.json(
        { message: 'Crop selection and farmer input are required' },
        { status: 400 }
      )
    }

    // Get user's preferred language from database
    const client = await clientPromise
    const db = client.db('cropcare')
    
    let userLanguage = 'bengali' // Default fallback
    try {
      const user = await db.collection('User').findOne({ 
        _id: new ObjectId(userId) 
      })
      
      if (user && user.language) {
        userLanguage = user.language.toLowerCase()
      } else {
        console.log('User not found or no language preference, using default: hindi')
      }
    } catch (dbError) {
      console.error('Database error while fetching user:', dbError)
    }

    const displayLanguage = languageMap[userLanguage] || 'Hindi (हिंदी)'
    const speechLang = speechLangMap[userLanguage] || 'hi-IN'

    // Interpret weather data
    const weatherInsights = weatherData ? interpretWeatherForDisease(weatherData) : []
    
    // Build comprehensive analysis prompt
    const systemPrompt = `You are an expert agricultural AI specializing in crop disease diagnosis. You have THREE sources of information:

1. IMAGE ANALYSIS: Visual inspection of crop images
2. FARMER OBSERVATIONS: Direct farmer input about symptoms
3. WEATHER DATA: Environmental conditions that affect disease patterns

Selected Crop: ${selectedCrop.name}
Farmer's Description: ${farmerInput}
${weatherData ? `
Weather Conditions:
- Temperature: ${weatherData.temperature}°C
- Humidity: ${weatherData.humidity}%
- Rainfall: ${weatherData.precipitation}mm
- Wind Speed: ${weatherData.windSpeed}km/h
- Location: ${weatherData.location}

Weather Impact Analysis:
${weatherInsights.map(insight => `- ${insight}`).join('\n')}
` : ''}

CRITICAL: You MUST respond in ${displayLanguage} language ONLY. All text fields must be in ${displayLanguage}.

Your task is to provide a COMPREHENSIVE diagnosis by combining all three data sources. Calculate an accuracy score (0-100) based on:
- How well image analysis matches farmer description (40% weight)
- Disease-weather correlation strength (30% weight)
- Crop-specific disease likelihood (30% weight)

Provide response in this JSON format (all text in ${displayLanguage}):
{
  "disease": "specific disease name in ${displayLanguage}",
  "description": "detailed explanation of the disease in ${displayLanguage}",
  "confidence": 85,
  "accuracy": 92,
  "severity": "Mild/Moderate/Severe",
  "imageFindings": [
    "key visual observation 1 from image in ${displayLanguage}",
    "key visual observation 2 from image in ${displayLanguage}"
  ],
  "farmerObservationAnalysis": "how farmer's description aligns with disease patterns in ${displayLanguage}",
  "contributingFactors": [
    "weather factor 1 contributing to this disease in ${displayLanguage}",
    "weather factor 2 contributing to this disease in ${displayLanguage}",
    "environmental factor in ${displayLanguage}"
  ],
  "causes": [
    "primary cause in ${displayLanguage}",
    "secondary cause in ${displayLanguage}"
  ],
  "treatments": [
    {
      "name": "treatment name in ${displayLanguage}",
      "description": "detailed application method in ${displayLanguage}",
      "searchTerm": "English product name for shopping",
      "priority": "High/Medium/Low",
      "effectiveness": "percentage based on current conditions"
    }
  ],
  "prevention": [
    "prevention tip 1 specific to current weather in ${displayLanguage}",
    "prevention tip 2 in ${displayLanguage}"
  ],
  "urgency": "Immediate/Within 3 days/Within 1 week",
  "expectedOutcome": "what to expect if treated in ${displayLanguage}",
  "riskIfUntreated": "consequences of no treatment in ${displayLanguage}"
}`

    // Make comprehensive API call to GPT-4 Vision
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this ${selectedCrop.name} image for diseases. The farmer reports: "${farmerInput}". ${weatherInsights.length > 0 ? 'Weather conditions suggest: ' + weatherInsights.join(', ') + '.' : ''} Provide comprehensive diagnosis in ${displayLanguage}.`
            },
            {
              type: 'image_url',
              image_url: {
                url: image,
                detail: 'high'
              }
            }
          ]
        }
      ],
      temperature: 0.3,
      max_tokens: 3000,
    })

    const content = response.choices[0].message.content
    
    // Parse JSON response
    let analysisData
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content
      analysisData = JSON.parse(jsonString)
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      throw new Error('Failed to parse AI response')
    }

    // Enrich treatments with product data
    const enrichedTreatments = await enrichTreatmentsWithProducts(
      analysisData.treatments || [],
      userLanguage
    )

    // Store analysis in database for history
    try {
      await db.collection('disease_detections').insertOne({
        userId: new ObjectId(userId),
        crop: selectedCrop.name,
        disease: analysisData.disease,
        accuracy: analysisData.accuracy,
        confidence: analysisData.confidence,
        farmerInput: farmerInput,
        weatherData: weatherData,
        location: location,
        timestamp: new Date(),
        language: userLanguage
      })
    } catch (dbError) {
      console.error('Failed to store detection:', dbError)
    }

    return NextResponse.json({
      type: 'comprehensive-detection',
      ...analysisData,
      treatments: enrichedTreatments,
      crop: selectedCrop,
      weather: weatherData,
      weatherInsights: weatherInsights,
      language: userLanguage,
      displayLanguage: displayLanguage,
      speechLang: speechLang,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Comprehensive detection error:', error)
    return NextResponse.json(
      { 
        message: 'Comprehensive analysis failed', 
        error: error.message,
        type: 'error'
      },
      { status: 500 }
    )
  }
}

// Helper: Enrich treatments with product data
async function enrichTreatmentsWithProducts(treatments, userLanguage) {
  const enriched = []

  for (const treatment of treatments) {
    const products = await searchProducts(
      treatment.searchTerm || treatment.name, 
      userLanguage
    )
    
    enriched.push({
      ...treatment,
      products: products.slice(0, 3) // Top 3 products per treatment
    })
  }

  return enriched
}

// Product search with image fetching
async function searchProducts(productName, userLanguage) {
  const productDatabase = {
    'fungicide': [
      { base: 'Mancozeb', brand: 'Dithane M-45', priceRange: [300, 500] },
      { base: 'Carbendazim', brand: 'Bavistin', priceRange: [200, 400] },
      { base: 'Copper Oxychloride', brand: 'Blitox', priceRange: [150, 300] }
    ],
    'insecticide': [
      { base: 'Chlorpyrifos', brand: 'Dursban', priceRange: [400, 600] },
      { base: 'Imidacloprid', brand: 'Confidor', priceRange: [350, 550] },
      { base: 'Cypermethrin', brand: 'Ripcord', priceRange: [250, 450] }
    ],
    'fertilizer': [
      { base: 'NPK 19:19:19', brand: 'Multiplex', priceRange: [500, 800] },
      { base: 'Urea', brand: 'IFFCO Urea', priceRange: [300, 500] },
      { base: 'DAP', brand: 'Chambal DAP', priceRange: [600, 900] }
    ]
  }

  // Determine product type based on search term
  let productType = 'fungicide'
  const searchLower = productName.toLowerCase()
  if (searchLower.includes('insect') || searchLower.includes('pest')) {
    productType = 'insecticide'
  } else if (searchLower.includes('fertil') || searchLower.includes('nutrient')) {
    productType = 'fertilizer'
  }

  const relevantProducts = productDatabase[productType] || productDatabase.fungicide

  // Check if Unsplash API is configured
  const USE_UNSPLASH = process.env.UNSPLASH_ACCESS_KEY ? true : false

  // Fetch images for all products
  const productPromises = relevantProducts.map(async (prod, idx) => {
    const productFullName = `${prod.brand} ${prod.base}`
    
    // Try Unsplash first if configured, otherwise use static images
    let imageUrl
    if (USE_UNSPLASH) {
      imageUrl = await fetchProductImageUnsplash(productFullName)
    } else {
      imageUrl = getDefaultProductImage(prod.brand)
    }
    
    return {
      name: `${prod.brand} (${prod.base})`,
      price: Math.floor(Math.random() * (prod.priceRange[1] - prod.priceRange[0])) + prod.priceRange[0],
      currency: 'INR',
      image: imageUrl,
      link: `https://www.amazon.in/s?k=${encodeURIComponent(productFullName)}`,
      rating: (Math.random() * 1.5 + 3.5).toFixed(1),
      seller: idx === 0 ? 'AgriStore India' : idx === 1 ? 'Farm Supply Co' : 'KrishiDukan',
      inStock: Math.random() > 0.15 // 85% in stock
    }
  })

  const mockProducts = await Promise.all(productPromises)

  // Sort by price descending (highest first)
  return mockProducts.sort((a, b) => b.price - a.price)
}