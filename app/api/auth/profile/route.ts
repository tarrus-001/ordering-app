import { NextResponse } from "next/server"

// In-memory user storage (shared with other auth routes)
const users = new Map()

export async function PUT(request: Request) {
  try {
    const { userId, ...userData } = await request.json()

    // Validate user ID
    if (!userId || !users.has(userId)) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update user data
    const currentUser = users.get(userId)
    const updatedUser = { ...currentUser, ...userData }
    users.set(userId, updatedUser)

    // Return updated user data
    return NextResponse.json({
      success: true,
      user: updatedUser,
    })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Profile update failed" }, { status: 500 })
  }
}
