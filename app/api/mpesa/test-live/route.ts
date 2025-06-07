import { type NextRequest, NextResponse } from "next/server"

// Live test endpoint to verify STK push with user's phone number
export async function POST(request: NextRequest) {
  try {
    const { phone = "0708268351" } = await request.json().catch(() => ({}))

    console.log("🧪 LIVE STK PUSH TEST")
    console.log("Testing with phone:", phone)

    // Format phone number
    let formattedPhone = phone.replace(/\s+/g, "").replace(/[^\d]/g, "")
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "254" + formattedPhone.substring(1)
    }

    console.log("Formatted phone:", formattedPhone)

    // Current M-Pesa configuration
    const MPESA_CONFIG = {
      consumerKey: "9LeVWEtqHAXI4KZ69Sud11hIrrGudyjGrBWmSAP6Y3aLHYv5",
      consumerSecret: "sfAviHwYRD8rDDpYnRO5sZZxcp1BDAn3Vg3tKNkeMgkKtaANSBa3JOVI7R8zEN2",
      businessShortCode: "174379",
      passkey: "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
      callbackUrl: "https://be54-197-248-134-121.ngrok-free.app/api/mpesa/callback",
    }

    console.log("Using credentials:")
    console.log("Consumer Key:", MPESA_CONFIG.consumerKey.substring(0, 10) + "...")
    console.log("Consumer Secret:", MPESA_CONFIG.consumerSecret.substring(0, 10) + "...")

    // Step 1: Get access token
    console.log("STEP 1: Getting access token...")
    const auth = Buffer.from(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`).toString("base64")

    const tokenResponse = await fetch(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      },
    )

    console.log("Token response status:", tokenResponse.status)
    const tokenText = await tokenResponse.text()
    console.log("Token response body:", tokenText)

    if (!tokenResponse.ok) {
      return NextResponse.json({
        success: false,
        step: "token",
        error: `Token error: HTTP ${tokenResponse.status}`,
        details: tokenText,
        phone: formattedPhone,
        timestamp: new Date().toISOString(),
      })
    }

    let tokenData
    try {
      tokenData = JSON.parse(tokenText)
    } catch (e) {
      return NextResponse.json({
        success: false,
        step: "token_parse",
        error: "Failed to parse token response",
        response: tokenText,
        phone: formattedPhone,
      })
    }

    const accessToken = tokenData.access_token
    if (!accessToken) {
      return NextResponse.json({
        success: false,
        step: "token_validation",
        error: "No access token in response",
        response: tokenData,
        phone: formattedPhone,
      })
    }

    console.log("✅ Access token obtained:", accessToken.substring(0, 10) + "...")

    // Step 2: Generate password
    console.log("STEP 2: Generating password...")
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, -3)

    const passwordString = `${MPESA_CONFIG.businessShortCode}${MPESA_CONFIG.passkey}${timestamp}`
    const password = Buffer.from(passwordString).toString("base64")

    console.log("Timestamp:", timestamp)
    console.log("Password generated")

    // Step 3: Send STK Push
    console.log("STEP 3: Sending STK Push to", formattedPhone)
    const stkPayload = {
      BusinessShortCode: MPESA_CONFIG.businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: 1, // Minimum test amount
      PartyA: formattedPhone,
      PartyB: MPESA_CONFIG.businessShortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: MPESA_CONFIG.callbackUrl,
      AccountReference: "LiveTest",
      TransactionDesc: "Live STK Test",
    }

    console.log("STK payload:", JSON.stringify(stkPayload, null, 2))

    const stkResponse = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stkPayload),
    })

    console.log("STK response status:", stkResponse.status)
    const stkText = await stkResponse.text()
    console.log("STK response body:", stkText)

    let stkData
    try {
      stkData = JSON.parse(stkText)
    } catch (e) {
      return NextResponse.json({
        success: false,
        step: "stk_parse",
        error: "Failed to parse STK response",
        response: stkText,
        phone: formattedPhone,
      })
    }

    // Return comprehensive result
    const result = {
      success: stkData.ResponseCode === "0",
      phone: formattedPhone,
      timestamp: new Date().toISOString(),
      steps: {
        tokenRequest: "✅ SUCCESS",
        passwordGeneration: "✅ SUCCESS",
        stkPushRequest: stkData.ResponseCode === "0" ? "✅ SUCCESS" : "❌ FAILED",
      },
      stkResponse: {
        responseCode: stkData.ResponseCode,
        responseDescription: stkData.ResponseDescription,
        checkoutRequestId: stkData.CheckoutRequestID,
        merchantRequestId: stkData.MerchantRequestID,
        customerMessage: stkData.CustomerMessage,
      },
      message:
        stkData.ResponseCode === "0"
          ? "🎉 STK Push sent successfully! Check your phone (0708268351) for M-Pesa prompt!"
          : `❌ STK Push failed: ${stkData.ResponseDescription}`,
    }

    console.log("FINAL RESULT:", result)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Live test error:", error)
    return NextResponse.json({
      success: false,
      step: "exception",
      error: error.message,
      stack: error.stack,
      phone: "254708268351",
      timestamp: new Date().toISOString(),
    })
  }
}

// GET method for easy browser testing
export async function GET() {
  // Automatically test with the user's phone number
  const testData = { phone: "0708268351" }
  const request = new Request("http://localhost", {
    method: "POST",
    body: JSON.stringify(testData),
    headers: { "Content-Type": "application/json" },
  })

  // Call the POST method
  return POST(request as any)
}
