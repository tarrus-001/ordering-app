import { NextResponse } from "next/server"

// Comprehensive integration test endpoint
export async function GET() {
  const testResults = {
    timestamp: new Date().toISOString(),
    environment: "sandbox",
    tests: {},
    summary: {
      passed: 0,
      failed: 0,
      total: 0,
    },
  }

  // Test 1: Credentials validation
  try {
    const MPESA_CONFIG = {
      consumerKey: "8rbAE29vQKW3weaAUjRLCagjBrf0d6dX",
      consumerSecret: "qp3JpWQCUPxFS9cHp1Q8BVeK2LYQlPllN8",
      businessShortCode: "174379",
      passkey: "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
    }

    const auth = Buffer.from(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`).toString("base64")

    const response = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()
    testResults.tests.credentialsTest = {
      name: "M-Pesa Credentials Validation",
      status: response.ok && data.access_token ? "✅ PASS" : "❌ FAIL",
      details: {
        httpStatus: response.status,
        hasAccessToken: !!data.access_token,
        tokenType: data.token_type,
        expiresIn: data.expires_in,
      },
    }

    if (response.ok && data.access_token) testResults.summary.passed++
    else testResults.summary.failed++
  } catch (error) {
    testResults.tests.credentialsTest = {
      name: "M-Pesa Credentials Validation",
      status: "❌ FAIL",
      error: error.message,
    }
    testResults.summary.failed++
  }

  testResults.summary.total = testResults.summary.passed + testResults.summary.failed

  return NextResponse.json(testResults)
}
