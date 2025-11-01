// app/api/detect-crops/route.js
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request) {
  try {
    const { image, multipleImages } = await request.json()
    
    if (!image) {
      return NextResponse.json(
        { message: 'Image is required' },
        { status: 400 }
      )
    }

    const systemPrompt = `You are an expert agricultural AI specializing in crop identification. Analyze the uploaded image and identify the crop type.

Provide the TOP 3 most likely crop types with confidence scores.

Consider:
- Leaf shape, size, and color
- Plant structure and growth pattern
- Visible flowers, fruits, or seeds
- Field arrangement and spacing
- Regional agricultural patterns (if visible)

Return ONLY valid JSON in this exact format:
{
  "crops": [
    {"name": "Crop Name 1", "confidence": 95},
    {"name": "Crop Name 2", "confidence": 85},
    {"name": "Crop Name 3", "confidence": 75}
  ],
  "analysisNote": "Brief note about what you observed in the image"
}

Be specific with crop names (e.g., "Rice (Paddy)", "Wheat", "Cotton", "Tomato", "Potato", "Sugarcane", etc.).`

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
              text: 'Identify the crop type in this image and provide top 3 matches with confidence scores.'
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
      temperature: 0.2,
      max_tokens: 800,
    })

    const content = response.choices[0].message.content
    
    // Parse JSON response
    let cropData
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content
      cropData = JSON.parse(jsonString)
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      // Fallback
      cropData = {
        crops: [
          { name: 'Unknown Crop 1', confidence: 60 },
          { name: 'Unknown Crop 2', confidence: 40 },
          { name: 'Unknown Crop 3', confidence: 30 }
        ],
        analysisNote: 'Could not parse AI response properly'
      }
    }

    // Ensure we have exactly 3 crops
    while (cropData.crops.length < 3) {
      cropData.crops.push({
        name: `Other Crop ${cropData.crops.length + 1}`,
        confidence: Math.max(20, 70 - (cropData.crops.length * 20))
      })
    }

    return NextResponse.json({
      type: 'crop-detection',
      ...cropData,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Crop detection error:', error)
    return NextResponse.json(
      { 
        message: 'Crop detection failed', 
        error: error.message,
        type: 'error'
      },
      { status: 500 }
    )
  }
}