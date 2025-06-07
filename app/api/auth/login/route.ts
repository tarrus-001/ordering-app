import { NextResponse } from "next/server"

// In-memory user storage (shared with register route)
const users = new Map()
const passwords = new Map()

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find user by email
    const user = Array.from(users.values()).find((u: any) => u.email === email)

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Check password
    const storedPassword = passwords.get(user.id)
    if (password !== storedPassword) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Return user data (without password)
    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
