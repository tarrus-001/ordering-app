import { type NextRequest, NextResponse } from "next/server"

// Force real M-Pesa API (no simulation)
export async function POST(request: NextRequest) {
  const MPESA_CONFIG = {
    consumerKey: "8rbAE29vQKW3weaAUjRLCagjBrf0d6dX",
    consumerSecret: "qp3JpWQCUPxFS9cHp1Q8BVeK2LYQlPllN8",
    businessShortCode: "174379",
    passkey: "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
    callbackUrl: "https://webhook.site/unique-id", // You need a real webhook URL
  }

  try {
    const body = await request.json()
    const { phone, amount } = body

    console.log("🚀 FORCING REAL M-PESA API CALL")
    console.log("   Phone:", phone)
    console.log("   Amount:", amount)

    // Format phone
    let formattedPhone = phone.replace(/\s+/g, "").replace(/[^\d]/g, "")
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "254" + formattedPhone.substring(1)
    }

    console.log("   Formatted Phone:", formattedPhone)

    // Step 1: Get access token
    console.log("🔑 Getting access token...")
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

    console.log("   Token Response Status:", tokenResponse.status)
    const tokenText = await tokenResponse.text()
    console.log("   Token Response:", tokenText)

    if (!tokenResponse.ok) {
      return NextResponse.json({
        success: false,
        step: "token",
        error: `HTTP ${tokenResponse.status}: ${tokenText}`,
        details: {
          consumerKey: MPESA_CONFIG.consumerKey,
          url: "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
        },
      })
    }

    const tokenData = JSON.parse(tokenText)
    const accessToken = tokenData.access_token

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        step: "token",
        error: "No access token in response",
        response: tokenData,
      })
    }

    console.log("✅ Access token obtained")

    // Step 2: Generate password
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, -3)
    const password = Buffer.from(`${MPESA_CONFIG.businessShortCode}${MPESA_CONFIG.passkey}${timestamp}`).toString(
      "base64",
    )

    console.log("🔐 Generated password for timestamp:", timestamp)

    // Step 3: STK Push
    const stkPayload = {
      BusinessShortCode: MPESA_CONFIG.businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: MPESA_CONFIG.businessShortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: MPESA_CONFIG.callbackUrl,
      AccountReference: `TEST${Date.now()}`,
      TransactionDesc: "Test Payment",
    }

    console.log("📤 Sending STK Push...")
    console.log("   Payload:", JSON.stringify(stkPayload, null, 2))

    const stkResponse = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stkPayload),
    })

    console.log("   STK Response Status:", stkResponse.status)
    const stkText = await stkResponse.text()
    console.log("   STK Response:", stkText)

    let stkData = null
    try {
      stkData = JSON.parse(stkText)
    } catch (e) {
      stkData = { rawResponse: stkText }
    }

    return NextResponse.json({
      success: stkResponse.ok && stkData?.ResponseCode === "0",
      step: "stk_push",
      status: stkResponse.status,
      response: stkData,
      payload: stkPayload,
      accessToken: accessToken ? "✅ Obtained" : "❌ Missing",
    })
  } catch (error) {
    console.error("💥 Real STK Error:", error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    })
  }
}
