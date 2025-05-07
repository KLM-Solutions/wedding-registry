import { type NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"
import { existsSync } from "fs"

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
        message TEXT,
        photo_url TEXT,
        date_of_birth DATE,
        location TEXT,
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
    const message = formData.get("message") as string || ""
    const dateOfBirth = formData.get("date_of_birth") as string
    const location = formData.get("location") as string
    
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
    
    // Handle photo upload if present
    let photoUrl = null
    const photo = formData.get("photo") as File
    
    if (photo && photo.size > 0) {
      try {
        // Convert image to base64
        const arrayBuffer = await photo.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        photoUrl = `data:${photo.type};base64,${buffer.toString('base64')}`
        console.log("Photo converted to base64 successfully")
      } catch (error) {
        console.error("Error converting photo to base64:", error)
        // Continue without photo if there's an error
      }
    }

    const client = await pool.connect()
    try {
      // Insert guest data
      const result = await client.query(
        `INSERT INTO guests (name, email, phone, association, connection, message, photo_url, date_of_birth, location)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [name, email, phone, association, connection, message, photoUrl, dateOfBirth, location],
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