import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Language mapping for proper language names
const languageMap = {
  'hindi': 'Hindi (हिंदी)',
  'bengali': 'Bengali (বাংলা)',
  'telugu': 'Telugu (తెలుగు)',
  'marathi': 'Marathi (मराठी)',
  'tamil': 'Tamil (தமிழ்)',
  'gujarati': 'Gujarati (ગુજરાતી)'
}

// Language codes for speech recognition
const speechLangMap = {
  'hindi': 'hi-IN',
  'bengali': 'bn-IN',
  'telugu': 'te-IN',
  'marathi': 'mr-IN',
  'tamil': 'ta-IN',
  'gujarati': 'gu-IN'
}

export async function POST(request) {
  try {
    const { image, multipleImages, userId, conversationHistory } = await request.json()
    
    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get user's preferred language from MongoDB
    const client = await clientPromise
    const db = client.db('cropcare')
    
    let userLanguage = 'hindi' // default
    try {
      const user = await db.collection('users').findOne({ 
        _id: new ObjectId(userId) 
      })
      
      if (user && user.language) {
        userLanguage = user.language.toLowerCase()
      }
    } catch (dbError) {
      console.error('Database error:', dbError)
      // Continue with default language
    }

    const displayLanguage = languageMap[userLanguage] || 'Hindi (हिंदी)'
    const speechLang = speechLangMap[userLanguage] || 'hi-IN'

    // If it's a conversation message (not initial detection)
    if (conversationHistory && conversationHistory.length > 0) {
      const messages = [
        {
          role: 'system',
          content: `You are an expert agricultural advisor helping farmers. You MUST respond ONLY in ${displayLanguage} language. Be empathetic, clear, and provide practical advice about crop diseases, treatments, and prevention. Use simple language that farmers can understand easily.`
        },
        ...conversationHistory
      ]

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      })

      return NextResponse.json({
        type: 'conversation',
        message: response.choices[0].message.content,
        language: userLanguage,
        displayLanguage: displayLanguage,
        speechLang: speechLang
      })
    }

    // Initial disease detection with image
    const systemPrompt = `You are an expert agricultural AI specializing in crop disease identification. Analyze the uploaded image carefully and provide a comprehensive report.

CRITICAL: You MUST respond in ${displayLanguage} language ONLY. All text, descriptions, and explanations must be in ${displayLanguage}.

Provide the following information:

1. Top 3 possible crop types with confidence percentages
2. Detected disease or condition (if any)
3. Confidence level for disease detection (0-100)
4. Severity level (Mild, Moderate, or Severe)
5. Detailed explanation of what causes this disease
6. Recommended treatments:
   - Organic/natural treatments with specific names and usage instructions
   - Chemical treatments with specific product names and application methods
7. Prevention measures to avoid future occurrences

Format your response as valid JSON (but all text content must be in ${displayLanguage}):
{
  "crops": [
    {"name": "crop name in ${displayLanguage}", "confidence": 95},
    {"name": "crop name in ${displayLanguage}", "confidence": 85},
    {"name": "crop name in ${displayLanguage}", "confidence": 75}
  ],
  "disease": "disease name in ${displayLanguage}",
  "confidence": 92,
  "severity": "Moderate",
  "causes": [
    "detailed cause 1 in ${displayLanguage}",
    "detailed cause 2 in ${displayLanguage}",
    "detailed cause 3 in ${displayLanguage}"
  ],
  "treatments": {
    "organic": [
      {
        "name": "treatment name in ${displayLanguage}",
        "description": "detailed usage instructions in ${displayLanguage}",
        "searchTerm": "product name in English for shopping search"
      }
    ],
    "chemical": [
      {
        "name": "treatment name in ${displayLanguage}",
        "description": "detailed application method in ${displayLanguage}",
        "searchTerm": "product name in English for shopping search"
      }
    ]
  },
  "prevention": [
    "prevention tip 1 in ${displayLanguage}",
    "prevention tip 2 in ${displayLanguage}",
    "prevention tip 3 in ${displayLanguage}"
  ]
}

Remember: Everything except "searchTerm" fields must be in ${displayLanguage} language.`

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
              text: `Analyze this crop image and detect any diseases. Provide all information in ${displayLanguage} language.`
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
      max_tokens: 2500,
    })

    const content = response.choices[0].message.content
    
    // Try to parse JSON from the response
    let analysisData
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content
      analysisData = JSON.parse(jsonString)
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      // Fallback if parsing fails
      analysisData = {
        crops: [{ name: 'अज्ञात फसल', confidence: 0 }],
        disease: 'विश्लेषण त्रुटि',
        confidence: 0,
        severity: 'Unknown',
        causes: ['परिणाम को पार्स करने में असमर्थ'],
        treatments: { organic: [], chemical: [] },
        prevention: [],
        rawResponse: content
      }
    }

    // Fetch medicine images and prices from shopping APIs
    const enrichedTreatments = await enrichTreatmentsWithProducts(analysisData.treatments, userLanguage)

    return NextResponse.json({
      type: 'detection',
      ...analysisData,
      treatments: enrichedTreatments,
      language: userLanguage,
      displayLanguage: displayLanguage,
      speechLang: speechLang,
      timestamp: new Date().toISOString(),
      imageCount: multipleImages ? 'multiple' : 1
    })

  } catch (error) {
    console.error('Detection error:', error)
    return NextResponse.json(
      { 
        message: 'Detection failed', 
        error: error.message,
        type: 'error'
      },
      { status: 500 }
    )
  }
}

// Helper function to fetch product information
async function enrichTreatmentsWithProducts(treatments, userLanguage) {
  const enriched = {
    organic: [],
    chemical: []
  }

  try {
    // Enrich organic treatments
    for (const treatment of (treatments.organic || [])) {
      const products = await searchProducts(treatment.searchTerm || treatment.name, userLanguage)
      enriched.organic.push({
        ...treatment,
        products: products.slice(0, 3) // Top 3 products
      })
    }

    // Enrich chemical treatments
    for (const treatment of (treatments.chemical || [])) {
      const products = await searchProducts(treatment.searchTerm || treatment.name, userLanguage)
      enriched.chemical.push({
        ...treatment,
        products: products.slice(0, 3) // Top 3 products
      })
    }
  } catch (error) {
    console.error('Product enrichment error:', error)
  }

  return enriched
}

// Search for products with prices
async function searchProducts(productName, userLanguage) {
  // This is a mock function. Replace with actual API calls to:
  // - Amazon Product API
  // - Agricultural supply stores APIs
  // - Google Shopping API
  
  const productLabels = {
    'hindi': {
      premium: 'प्रीमियम',
      standard: 'स्टैंडर्ड',
      economy: 'किफायती'
    },
    'bengali': {
      premium: 'প্রিমিয়াম',
      standard: 'স্ট্যান্ডার্ড',
      economy: 'সাশ্রয়ী'
    },
    'telugu': {
      premium: 'ప్రీమియం',
      standard: 'స్టాండర్డ్',
      economy: 'ఎకానమీ'
    },
    'marathi': {
      premium: 'प्रीमियम',
      standard: 'स्टँडर्ड',
      economy: 'किफायती'
    },
    'tamil': {
      premium: 'பிரீமியம்',
      standard: 'ஸ்டாண்டர்ட்',
      economy: 'சிக்கனமான'
    },
    'gujarati': {
      premium: 'પ્રીમિયમ',
      standard: 'સ્ટાન્ડર્ડ',
      economy: 'કિફાયતી'
    }
  }

  const labels = productLabels[userLanguage] || productLabels['hindi']
  
  const mockProducts = [
    {
      name: `${productName} ${labels.premium}`,
      price: Math.floor(Math.random() * 500) + 300,
      currency: 'INR',
      image: `https://via.placeholder.com/200x200?text=${encodeURIComponent(productName)}+Premium`,
      link: `https://www.amazon.in/s?k=${encodeURIComponent(productName)}`,
      rating: (Math.random() * 1 + 4).toFixed(1),
      seller: 'AgriStore India'
    },
    {
      name: `${productName} ${labels.standard}`,
      price: Math.floor(Math.random() * 300) + 150,
      currency: 'INR',
      image: `https://via.placeholder.com/200x200?text=${encodeURIComponent(productName)}+Standard`,
      link: `https://www.flipkart.com/search?q=${encodeURIComponent(productName)}`,
      rating: (Math.random() * 1 + 3.5).toFixed(1),
      seller: 'Farm Supply Co'
    },
    {
      name: `${productName} ${labels.economy}`,
      price: Math.floor(Math.random() * 200) + 80,
      currency: 'INR',
      image: `https://via.placeholder.com/200x200?text=${encodeURIComponent(productName)}+Economy`,
      link: `https://www.indiamart.com/search.html?ss=${encodeURIComponent(productName)}`,
      rating: (Math.random() * 1 + 3).toFixed(1),
      seller: 'Local Vendors'
    }
  ]

  // Sort by price descending (highest to lowest)
  return mockProducts.sort((a, b) => b.price - a.price)
}