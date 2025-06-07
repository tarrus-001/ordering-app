import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("🧪 Running simple M-Pesa test...")

    // Test 1: Basic credentials
    const MPESA_CONFIG = {
      consumerKey: "8rbAE29vQKW3weaAUjRLCagjBrf0d6dX",
      consumerSecret: "qp3JpWQCUPxFS9cHp1Q8BVeK2LYQlPllN8",
    }

    // Test 2: Get access token
    const auth = Buffer.from(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`).toString("base64")

    const response = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      hasAccessToken: !!data.access_token,
      response: data,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    })
  }
}
