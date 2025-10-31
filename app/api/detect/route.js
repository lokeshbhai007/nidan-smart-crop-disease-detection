// app/api/detect/route.js
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    // TODO: Replace with actual ML model integration
    // Expected request: { image: base64, multipleImages: boolean }
    // Expected response: { disease: string, confidence: number, remedies: string[], prevention: string[] }
    
    const { image, multipleImages } = await request.json()

    // Mock response - replace with actual ML model call
    const mockDiseases = [
      {
        disease: 'Tomato Blight',
        confidence: 0.87,
        remedies: [
          'Remove and destroy infected leaves',
          'Apply copper-based fungicide',
          'Improve air circulation around plants'
        ],
        prevention: [
          'Water at the base of plants',
          'Ensure proper spacing',
          'Rotate crops annually'
        ]
      },
      {
        disease: 'Powdery Mildew',
        confidence: 0.92,
        remedies: [
          'Apply neem oil solution',
          'Use baking soda spray',
          'Remove severely infected leaves'
        ],
        prevention: [
          'Maintain good air circulation',
          'Avoid overhead watering',
          'Plant resistant varieties'
        ]
      }
    ]

    const randomDisease = mockDiseases[Math.floor(Math.random() * mockDiseases.length)]
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    return NextResponse.json({
      ...randomDisease,
      timestamp: new Date().toISOString(),
      imageCount: multipleImages ? Math.floor(Math.random() * 3) + 1 : 1
    })
  } catch (error) {
    console.error('Detection error:', error)
    return NextResponse.json(
      { message: 'Detection failed' },
      { status: 500 }
    )
  }
}