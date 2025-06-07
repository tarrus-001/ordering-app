import { NextResponse } from "next/server"

// Test endpoint to verify M-Pesa credentials
export async function GET() {
  const MPESA_CONFIG = {
    consumerKey: "8rbAE29vQKW3weaAUjRLCagjBrf0d6dX",
    consumerSecret: "qp3JpWQCUPxFS9cHp1Q8BVeK2LYQlPllN8",
  }

  try {
    console.log("🧪 Testing M-Pesa credentials...")

    const auth = Buffer.from(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`).toString("base64")
    const baseUrl = "https://sandbox.safaricom.co.ke"

    const response = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    })

    const responseText = await response.text()

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseText,
      credentials: {
        consumerKey: MPESA_CONFIG.consumerKey,
        consumerSecretLength: MPESA_CONFIG.consumerSecret.length,
      },
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
    })
  }
}
