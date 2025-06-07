import { type NextRequest, NextResponse } from "next/server"

// Test endpoint to verify STK push works
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone } = body

    console.log("🧪 Testing STK Push with phone:", phone)

    // Format phone number
    let formattedPhone = phone.replace(/\s+/g, "").replace(/[^\d]/g, "")
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "254" + formattedPhone.substring(1)
    } else if (formattedPhone.startsWith("+254")) {
      formattedPhone = formattedPhone.substring(1)
    }

    console.log("📞 Formatted phone:", formattedPhone)

    // Validate phone number format
    if (!/^254[17]\d{8}$/.test(formattedPhone)) {
      return NextResponse.json({
        success: false,
        message: "Invalid phone number format. Use format: 0712345678 or 0112345678",
        phone: formattedPhone,
      })
    }

    // M-Pesa configuration - using exact credentials
    const MPESA_CONFIG = {
      consumerKey: "8rbAE29vQKW3weaAUjRLCagjBrf0d6dX",
      consumerSecret: "qp3JpWQCUPxFS9cHp1Q8BVeK2LYQlPllN8",
      businessShortCode: "174379",
      passkey: "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
    }

    console.log("🔧 Using M-Pesa config:")
    console.log("   Consumer Key:", MPESA_CONFIG.consumerKey)
    console.log("   Business ShortCode:", MPESA_CONFIG.businessShortCode)

    // Step 1: Get access token with better error handling
    const auth = Buffer.from(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`).toString("base64")
    console.log("🔑 Getting access token...")
    console.log("   Auth header length:", auth.length)

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

    console.log("📡 Token response status:", tokenResponse.status)
    console.log("📡 Token response headers:", Object.fromEntries(tokenResponse.headers.entries()))

    const tokenText = await tokenResponse.text()
    console.log("📄 Token response body:", tokenText)

    if (!tokenResponse.ok) {
      console.error("❌ Token request failed")
      return NextResponse.json({
        success: false,
        message: `Token error: ${tokenResponse.status} - ${tokenText}`,
        details: {
          status: tokenResponse.status,
          statusText: tokenResponse.statusText,
          response: tokenText,
          consumerKey: MPESA_CONFIG.consumerKey,
          authHeaderLength: auth.length,
        },
      })
    }

    let tokenData
    try {
      tokenData = JSON.parse(tokenText)
    } catch (e) {
      return NextResponse.json({
        success: false,
        message: "Failed to parse token response",
        rawResponse: tokenText,
      })
    }

    const accessToken = tokenData.access_token

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        message: "No access token in response",
        response: tokenData,
      })
    }

    console.log("✅ Access token obtained successfully")

    // Step 2: Generate password
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, -3)
    const password = Buffer.from(`${MPESA_CONFIG.businessShortCode}${MPESA_CONFIG.passkey}${timestamp}`).toString(
      "base64",
    )

    console.log("🔐 Password generated for timestamp:", timestamp)

    // Step 3: Prepare STK Push payload
    const callbackUrl = "https://be54-197-248-134-121.ngrok-free.app/api/mpesa/callback"

    const stkPushPayload = {
      BusinessShortCode: MPESA_CONFIG.businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: 1, // Minimum amount for testing
      PartyA: formattedPhone,
      PartyB: MPESA_CONFIG.businessShortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: "TestSTK",
      TransactionDesc: "Test STK Push",
    }

    console.log("📤 STK Push payload:", JSON.stringify(stkPushPayload, null, 2))

    // Step 4: Send STK Push request
    console.log("🚀 Sending STK Push request...")
    const stkResponse = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stkPushPayload),
    })

    console.log("📡 STK response status:", stkResponse.status)
    console.log("📡 STK response headers:", Object.fromEntries(stkResponse.headers.entries()))

    // Step 5: Handle STK Push response
    const responseText = await stkResponse.text()
    console.log("📥 STK Push raw response:", responseText)

    let stkData
    try {
      stkData = JSON.parse(responseText)
    } catch (e) {
      return NextResponse.json({
        success: false,
        message: "Failed to parse M-Pesa STK response",
        rawResponse: responseText,
        status: stkResponse.status,
      })
    }

    console.log("📋 STK Push parsed response:", stkData)

    // Step 6: Return appropriate response
    if (stkData.ResponseCode === "0") {
      console.log("✅ STK Push sent successfully!")
      console.log("   CheckoutRequestID:", stkData.CheckoutRequestID)

      return NextResponse.json({
        success: true,
        message: "STK Push sent successfully! Please check your phone.",
        checkoutRequestId: stkData.CheckoutRequestID,
        merchantRequestId: stkData.MerchantRequestID,
        customerMessage: stkData.CustomerMessage,
        phoneNumber: formattedPhone,
        amount: 1,
        timestamp: new Date().toISOString(),
      })
    } else {
      console.log("❌ STK Push failed:", stkData.ResponseDescription)
      return NextResponse.json({
        success: false,
        message: stkData.ResponseDescription || "STK Push failed",
        errorCode: stkData.ResponseCode,
        details: stkData,
        phoneNumber: formattedPhone,
      })
    }
  } catch (error: any) {
    console.error("💥 Test STK error:", error)
    return NextResponse.json({
      success: false,
      message: "Test failed: " + error.message,
      error: error.message,
      stack: error.stack,
    })
  }
}

// Add GET method for testing
export async function GET() {
  return NextResponse.json({
    message: "STK Push test endpoint is working",
    timestamp: new Date().toISOString(),
    instructions: [
      "Send POST request with { phone: '0712345678' }",
      "Phone number should be a valid Kenyan number",
      "This will send a KES 1 test payment to your phone",
    ],
  })
}
