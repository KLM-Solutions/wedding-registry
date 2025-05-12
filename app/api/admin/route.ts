import { type NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Initialize database tables
async function initializeDatabase() {
  const client = await pool.connect()
  try {
    // Create room_assignments table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS room_assignments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        date_of_birth DATE NOT NULL,
        room_number VARCHAR(50) NOT NULL,
        hotel_name VARCHAR(255) NOT NULL,
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
        SELECT * FROM room_assignments ORDER BY created_at DESC
      `)
      return NextResponse.json(result.rows)
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error fetching room assignments:", error)
    return NextResponse.json({ message: "Failed to fetch room assignments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Extract form fields
    const name = formData.get("name") as string
    const dateOfBirth = formData.get("dateOfBirth") as string
    const roomNumber = formData.get("roomNumber") as string
    const hotelName = formData.get("hotelName") as string
    
    // Validate required fields
    if (!name || !dateOfBirth || !roomNumber || !hotelName) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 })
    }

    const client = await pool.connect()
    try {
      // Insert room assignment data
      const result = await client.query(
        `INSERT INTO room_assignments (name, date_of_birth, room_number, hotel_name)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [name, dateOfBirth, roomNumber, hotelName]
      )

      return NextResponse.json(result.rows[0])
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error adding room assignment:", error)
    return NextResponse.json({ message: "Failed to add room assignment" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { date_of_birth } = await request.json();

    if (!date_of_birth) {
      return NextResponse.json({ message: "Date of birth is required" }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM room_assignments WHERE date_of_birth = $1 LIMIT 1`,
        [date_of_birth]
      );
      if (result.rows.length === 0) {
        return NextResponse.json({ message: "No room assignment found" }, { status: 404 });
      }
      return NextResponse.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error verifying room assignment:", error);
    return NextResponse.json({ message: "Failed to verify room assignment" }, { status: 500 });
  }
} 