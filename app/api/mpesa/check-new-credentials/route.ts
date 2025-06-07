import { NextResponse } from "next/server"
import { MPESA_CONFIG, getEndpoint } from "../config"

// Endpoint to verify new M-Pesa credentials are correct
export async function GET() {
  try {
    // Step 1: Validate credential format
    const credentialCheck = {
      consumerKeyLength: MPESA_CONFIG.consumerKey.length,
      consumerSecretLength: MPESA_CONFIG.consumerSecret.length,
      businessShortCodeLength: MPESA_CONFIG.businessShortCode.length,
      passkeyLength: MPESA_CONFIG.passkey.length,
      consumerKeyFormat: /^[a-zA-Z0-9]+$/.test(MPESA_CONFIG.consumerKey),
      consumerSecretFormat: /^[a-zA-Z0-9]+$/.test(MPESA_CONFIG.consumerSecret),
      businessShortCodeFormat: /^\d+$/.test(MPESA_CONFIG.businessShortCode),
      environment: MPESA_CONFIG.environment,
    }

    // Step 2: Test auth encoding
    const auth = Buffer.from(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`).toString("base64")

    // Step 3: Test API connection
    console.log("Testing M-Pesa API connection with new credentials...")
    const response = await fetch(`${getEndpoint("auth")}?grant_type=client_credentials`, {
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
        url: `${getEndpoint("auth")}?grant_type=client_credentials`,
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
