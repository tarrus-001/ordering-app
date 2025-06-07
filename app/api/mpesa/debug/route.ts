import { NextResponse } from "next/server"

export async function GET() {
  const MPESA_CONFIG = {
    consumerKey: "8rbAE29vQKW3weaAUjRLCagjBrf0d6dX",
    consumerSecret: "qp3JpWQCUPxFS9cHp1Q8BVeK2LYQlPllN8",
  }

  try {
    console.log("🔍 Testing M-Pesa credentials...")

    const auth = Buffer.from(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`).toString("base64")

    const response = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    })

    const responseText = await response.text()
    let parsedResponse = null

    try {
      parsedResponse = JSON.parse(responseText)
    } catch (e) {
      // Response is not JSON
    }

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      rawResponse: responseText,
      parsedResponse,
      credentials: {
        consumerKey: MPESA_CONFIG.consumerKey,
        consumerSecretLength: MPESA_CONFIG.consumerSecret.length,
        authHeaderLength: auth.length,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    })
  }
}
