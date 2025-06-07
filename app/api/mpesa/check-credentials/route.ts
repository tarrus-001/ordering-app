import { NextResponse } from "next/server"

// Endpoint to verify M-Pesa credentials are correct
export async function GET() {
  try {
    // M-Pesa credentials - EXACT format from Safaricom
    const MPESA_CONFIG = {
      consumerKey: "8rbAE29vQKW3weaAUjRLCagjBrf0d6dX",
      consumerSecret: "qp3JpWQCUPxFS9cHp1Q8BVeK2LYQlPllN8",
      businessShortCode: "174379",
      passkey: "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
    }

    // Step 1: Validate credential format
    const credentialCheck = {
      consumerKeyLength: MPESA_CONFIG.consumerKey.length,
      consumerSecretLength: MPESA_CONFIG.consumerSecret.length,
      businessShortCodeLength: MPESA_CONFIG.businessShortCode.length,
      passkeyLength: MPESA_CONFIG.passkey.length,
      consumerKeyFormat: /^[a-zA-Z0-9]+$/.test(MPESA_CONFIG.consumerKey),
      consumerSecretFormat: /^[a-zA-Z0-9]+$/.test(MPESA_CONFIG.consumerSecret),
      businessShortCodeFormat: /^\d+$/.test(MPESA_CONFIG.businessShortCode),
    }

    // Step 2: Test auth encoding
    const auth = Buffer.from(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`).toString("base64")

    // Step 3: Test API connection
    console.log("Testing M-Pesa API connection...")
    const response = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    })

    const responseText = await response.text()
    let responseData = null

    try {
      responseData = JSON.parse(responseText)
    } catch (e) {
      // Not JSON
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      credentialCheck,
      authHeader: {
        length: auth.length,
        sample: auth.substring(0, 10) + "...", // First 10 chars for verification
      },
      apiTest: {
        url: "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        isJson: responseData !== null,
        hasAccessToken: responseData?.access_token ? true : false,
        responsePreview: responseData || responseText.substring(0, 100),
      },
      conclusion: {
        credentialsValid:
          credentialCheck.consumerKeyFormat &&
          credentialCheck.consumerSecretFormat &&
          credentialCheck.businessShortCodeFormat,
        apiAccessible: response.ok,
        authenticationSuccessful: responseData?.access_token ? true : false,
        overallStatus: responseData?.access_token ? "✅ WORKING" : "❌ FAILED",
      },
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    })
  }
}
