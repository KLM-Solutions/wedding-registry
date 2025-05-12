import { type NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"
import { existsSync } from "fs"
import { OpenAI } from "openai"
import { toFile } from "openai"

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Initialize database tables
async function initializeDatabase() {
  const client = await pool.connect()
  try {
    // Create tables if they don't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS guests (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        association VARCHAR(10) NOT NULL,
        connection VARCHAR(50) NOT NULL,
        photo_url TEXT,
        date_of_birth DATE,
        location TEXT,
        bio TEXT,
        voice_note_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
  } catch (error) {
    console.error("Error initializing database:", error)
  } finally {
    client.release()
  }
}

// Initialize database on module load
initializeDatabase().catch(console.error)

export async function GET() {
  try {
    const client = await pool.connect()
    try {
      const result = await client.query(`
        SELECT * FROM guests ORDER BY created_at DESC
      `)
      return NextResponse.json(result.rows)
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error fetching guests:", error)
    return NextResponse.json({ message: "Failed to fetch guest list" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Handle multipart form data
    const formData = await request.formData()
    
    // Extract form fields
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const association = formData.get("association") as string
    const connection = formData.get("connection") as string
    const dateOfBirth = formData.get("date_of_birth") as string
    const location = formData.get("location") as string
    const bio = formData.get("bio") as string || ""
    
    // Validate required fields
    const requiredFields = [
      { name: "name", value: name },
      { name: "email", value: email },
      { name: "phone", value: phone },
      { name: "association", value: association },
      { name: "connection", value: connection }
    ]
    
    for (const field of requiredFields) {
      if (!field.value) {
        return NextResponse.json({ message: `${field.name} is required` }, { status: 400 })
      }
    }

    // Validate association
    if (!["bride", "groom"].includes(association)) {
      return NextResponse.json({ message: "Association must be either bride or groom" }, { status: 400 })
    }

    // Validate connection based on association
    const brideConnections = ["Kalyani", "Kalyan", "Anjan", "Raji", "Harini"]
    const groomConnections = ["Ramesh", "Sushma", "Nirupama", "Abhijit", "Aditya"]

    if (association === "bride" && !brideConnections.includes(connection)) {
      return NextResponse.json({ message: "Invalid connection for bride" }, { status: 400 })
    }

    if (association === "groom" && !groomConnections.includes(connection)) {
      return NextResponse.json({ message: "Invalid connection for groom" }, { status: 400 })
    }
    
    // Handle voice note upload if present
    let voiceNoteUrl = null
    const voiceNote = formData.get("voiceNote") as File
    
    if (voiceNote && voiceNote.size > 0) {
      try {
        // Convert voice note to base64
        const arrayBuffer = await voiceNote.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const base64VoiceNote = buffer.toString('base64')
        voiceNoteUrl = `data:${voiceNote.type};base64,${base64VoiceNote}`
      } catch (error) {
        console.error("Error processing voice note:", error)
      }
    }

    // Handle photo upload if present
    let photoUrl = null
    const photo = formData.get("photo") as File
    const photoStyle = formData.get("photoStyle") as string
    
    if (photo && photo.size > 0) {
      try {
        // Convert image to base64
        const arrayBuffer = await photo.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const base64Image = buffer.toString('base64')
        
        if (photoStyle === "ghibli") {
          // Call OpenAI API to generate Ghibli-style image
          const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
          })

          // Create a temporary file from the buffer
          const tempFile = await toFile(buffer, null, {
            type: photo.type,
          })

          // Generate Ghibli-style image
          const response = await openai.images.edit({
            model: "gpt-image-1",
            image: tempFile,
            prompt: "Transform this image into Studio Ghibli art style, maintaining the same pose and composition but with Ghibli's distinctive hand-drawn animation aesthetic, soft colors, and whimsical details.",
          })

          // Get the generated image data
          if (response.data && response.data[0]?.b64_json) {
            // Convert base64 to buffer and then to data URL
            const imageBuffer = Buffer.from(response.data[0].b64_json, 'base64')
            photoUrl = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`
          } else {
            throw new Error('Failed to generate Ghibli-style image')
          }
        } else {
          // Normal image processing
          photoUrl = `data:${photo.type};base64,${base64Image}`
        }
        
        console.log("Photo processed successfully")
      } catch (error) {
        console.error("Error processing photo:", error)
        // Continue without photo if there's an error
      }
    }

    const client = await pool.connect()
    try {
      // Insert guest data
      const result = await client.query(
        `INSERT INTO guests (name, email, phone, association, connection, photo_url, date_of_birth, location, bio, voice_note_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [name, email, phone, association, connection, photoUrl, dateOfBirth, location, bio, voiceNoteUrl],
      )

      return NextResponse.json(result.rows[0])
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error adding guest:", error)
    return NextResponse.json({ message: "Failed to add guest to registry" }, { status: 500 })
  }
}