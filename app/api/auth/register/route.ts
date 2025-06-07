import { NextResponse } from "next/server"

// Simple ID generator (replace with proper UUID in production)
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// In-memory user storage (replace with database in production)
const users = new Map()

// Password storage (in a real app, these would be hashed)
const passwords = new Map()

export async function POST(request: Request) {
  try {
    const { name, email, phone, password } = await request.json()

    // Validate required fields
    if (!name || !email || !phone || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if email already exists
    if (Array.from(users.values()).some((user: any) => user.email === email)) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    // Create new user
    const userId = generateId()
    const newUser = {
      id: userId,
      name,
      email,
      phone,
      createdAt: new Date(),
    }

    // Store user and password
    users.set(userId, newUser)
    passwords.set(userId, password) // In a real app, hash the password

    // Return user data (without password)
    return NextResponse.json({
      success: true,
      user: newUser,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
