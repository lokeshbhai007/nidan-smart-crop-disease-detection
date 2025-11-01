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

// Weather interpretation for disease correlation
function interpretWeatherForDisease(weatherData) {
  const insights = []
  
  if (weatherData.humidity > 80) {
    insights.push('High humidity (${weatherData.humidity}%) creates favorable conditions for fungal diseases')
  }
  
  if (weatherData.temperature > 30) {
    insights.push('High temperature (${weatherData.temperature}°C) may stress plants and attract pests')
  }
  
  if (weatherData.temperature < 15) {
    insights.push('Low temperature (${weatherData.temperature}°C) can slow growth and increase disease susceptibility')
  }
  
  if (weatherData.precipitation > 5) {
    insights.push('Recent rainfall (${weatherData.precipitation}mm) increases risk of water-borne diseases')
  } else if (weatherData.precipitation === 0 && weatherData.humidity < 40) {
    insights.push('Dry conditions may cause drought stress and attract certain pests')
  }
  
  if (weatherData.windSpeed > 20) {
    insights.push('Strong winds (${weatherData.windSpeed}km/h) can spread airborne diseases and pests')
  }
  
  return insights
}

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

    // Get user's preferred language
    const client = await clientPromise
    const db = client.db('cropcare')
    
    let userLanguage = 'hindi'
    try {
      const user = await db.collection('users').findOne({ 
        _id: new ObjectId(userId) 
      })
      
      if (user && user.language) {
        userLanguage = user.language.toLowerCase()
      }
    } catch (dbError) {
      console.error('Database error:', dbError)
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

CRITICAL: You MUST respond in ${displayLanguage} language ONLY.

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
      // Continue anyway
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
      products: products.slice(0, 3)
    })
  }

  return enriched
}

// Mock product search (replace with real API)
async function searchProducts(productName, userLanguage) {
  const mockProducts = [
    {
      name: `${productName} Premium`,
      price: Math.floor(Math.random() * 500) + 300,
      currency: 'INR',
      image: `https://via.placeholder.com/200x200?text=${encodeURIComponent(productName)}`,
      link: `https://www.amazon.in/s?k=${encodeURIComponent(productName)}`,
      rating: (Math.random() * 1 + 4).toFixed(1),
      seller: 'AgriStore India',
      inStock: true
    },
    {
      name: `${productName} Standard`,
      price: Math.floor(Math.random() * 300) + 150,
      currency: 'INR',
      image: `https://via.placeholder.com/200x200?text=${encodeURIComponent(productName)}`,
      link: `https://www.flipkart.com/search?q=${encodeURIComponent(productName)}`,
      rating: (Math.random() * 1 + 3.5).toFixed(1),
      seller: 'Farm Supply Co',
      inStock: true
    },
    {
      name: `${productName} Economy`,
      price: Math.floor(Math.random() * 200) + 80,
      currency: 'INR',
      image: `https://via.placeholder.com/200x200?text=${encodeURIComponent(productName)}`,
      link: `https://www.indiamart.com/search.html?ss=${encodeURIComponent(productName)}`,
      rating: (Math.random() * 1 + 3).toFixed(1),
      seller: 'Local Vendors',
      inStock: Math.random() > 0.2
    }
  ]

  return mockProducts.sort((a, b) => b.price - a.price)
}