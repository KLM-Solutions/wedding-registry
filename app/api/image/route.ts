import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get('image') as File

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      )
    }

    // Convert the image file to base64
    const bytes = await imageFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')

    // Call OpenAI API to generate Ghibli-style image
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: `Transform this image into Studio Ghibli art style, maintaining the same pose and composition but with Ghibli's distinctive hand-drawn animation aesthetic, soft colors, and whimsical details. Here is the image: data:image/png;base64,${base64Image}`,
      n: 1,
      size: "1024x1024"
    })

    // Get the generated image data
    const generatedImageData = response.data?.[0]?.url

    if (!generatedImageData) {
      return NextResponse.json(
        { error: 'Failed to generate image' },
        { status: 500 }
      )
    }

    // Return the generated image data
    return NextResponse.json({
      image: generatedImageData,
    })
  } catch (error) {
    console.error('Error generating image:', error)
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    )
  }
} 