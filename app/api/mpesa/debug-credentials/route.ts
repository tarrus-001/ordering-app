import { NextResponse } from "next/server"

// Debug endpoint to test M-Pesa credentials step by step
export async function GET() {
  const MPESA_CONFIG = {
    consumerKey: "8rbAE29vQKW3weaAUjRLCagjBrf0d6dX",
    consumerSecret: "qp3JpWQCUPxFS9cHp1Q8BVeK2LYQlPllN8",
  }

  const results = {
    timestamp: new Date().toISOString(),
    tests: {},
    summary: { passed: 0, failed: 0 },
  }

  try {
    // Test 1: Basic credential validation
    console.log("🧪 Testing M-Pesa credentials...")
    results.tests.credentialFormat = {
      name: "Credential Format Check",
      consumerKeyLength: MPESA_CONFIG.consumerKey.length,
      consumerSecretLength: MPESA_CONFIG.consumerSecret.length,
      status: MPESA_CONFIG.consumerKey.length > 0 && MPESA_CONFIG.consumerSecret.length > 0 ? "✅ PASS" : "❌ FAIL",
    }

    // Test 2: Base64 encoding
    const auth = Buffer.from(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`).toString("base64")
    results.tests.base64Encoding = {
      name: "Base64 Encoding",
      authHeaderLength: auth.length,
      authHeader: `Basic ${auth.substring(0, 20)}...`,
      status: auth.length > 0 ? "✅ PASS" : "❌ FAIL",
    }

    // Test 3: API endpoint accessibility
    console.log("🌐 Testing API endpoint accessibility...")
    const testResponse = await fetch(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      },
    )

    const responseText = await testResponse.text()
    let parsedResponse = null

    try {
      parsedResponse = JSON.parse(responseText)
    } catch (e) {
      // Response might not be JSON
    }

    results.tests.apiEndpoint = {
      name: "API Endpoint Test",
      status: testResponse.ok ? "✅ PASS" : "❌ FAIL",
      httpStatus: testResponse.status,
      statusText: testResponse.statusText,
      headers: Object.fromEntries(testResponse.headers.entries()),
      responseLength: responseText.length,
      hasAccessToken: parsedResponse?.access_token ? true : false,
      response: parsedResponse || responseText.substring(0, 200),
    }

    // Update summary
    Object.values(results.tests).forEach((test: any) => {
      if (test.status.includes("PASS")) {
        results.summary.passed++
      } else {
        results.summary.failed++
      }
    })

    return NextResponse.json(results)
  } catch (error: any) {
    results.tests.error = {
      name: "Error Occurred",
      status: "❌ FAIL",
      error: error.message,
      stack: error.stack,
    }
    results.summary.failed++

    return NextResponse.json(results)
  }
}
