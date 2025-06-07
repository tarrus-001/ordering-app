import { NextResponse } from "next/server"

// Test if your callback URL is accessible
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Callback endpoint is working!",
    timestamp: new Date().toISOString(),
    url: "https://be54-197-248-134-121.ngrok-free.app/api/mpesa/callback",
    status: "✅ Accessible",
  })
}

export async function POST() {
  return NextResponse.json({
    success: true,
    message: "Callback POST endpoint is working!",
    timestamp: new Date().toISOString(),
  })
}
