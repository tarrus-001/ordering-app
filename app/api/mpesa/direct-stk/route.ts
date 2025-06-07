import { type NextRequest, NextResponse } from "next/server"
import { MPESA_CONFIG, getEndpoint } from "../config"

// Direct STK Push endpoint - using centralized config
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone } = body

    console.log("🚀 DIRECT STK PUSH TEST")
    console.log("Phone:", phone)

    // Format phone number
    let formattedPhone = phone.replace(/\s+/g, "").replace(/[^\d]/g, "")
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "254" + formattedPhone.substring(1)
    } else if (formattedPhone.startsWith("+254")) {
      formattedPhone = formattedPhone.substring(1)
    }

    console.log("Formatted phone:", formattedPhone)

    // Step 1: Get access token - with detailed logging
    console.log("STEP 1: Getting access token")
    const auth = Buffer.from(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`).toString("base64")
    console.log("Auth string:", `${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`)
    console.log("Base64 auth:", auth)

    const tokenResponse = await fetch(`${getEndpoint("auth")}?grant_type=client_credentials`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    })

    console.log("Token response status:", tokenResponse.status)
    console.log("Token response headers:", Object.fromEntries(tokenResponse.headers.entries()))

    const tokenText = await tokenResponse.text()
    console.log("Token response body:", tokenText)

    if (!tokenResponse.ok) {
      return NextResponse.json({
        success: false,
        step: "token",
        error: `Token error: HTTP ${tokenResponse.status}`,
        details: tokenText,
        auth: auth.substring(0, 10) + "...", // Show part of auth for debugging
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
      })
    }

    const accessToken = tokenData.access_token
    if (!accessToken) {
      return NextResponse.json({
        success: false,
        step: "token_validation",
        error: "No access token in response",
        response: tokenData,
      })
    }

    console.log("Access token obtained:", accessToken.substring(0, 10) + "...")

    // Step 2: Generate password
    console.log("STEP 2: Generating password")
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, -3)
    console.log("Timestamp:", timestamp)

    const passwordString = `${MPESA_CONFIG.businessShortCode}${MPESA_CONFIG.passkey}${timestamp}`
    console.log("Password string:", passwordString)

    const password = Buffer.from(passwordString).toString("base64")
    console.log("Base64 password:", password)

    // Step 3: Send STK Push
    console.log("STEP 3: Sending STK Push")
    const stkPayload = {
      BusinessShortCode: MPESA_CONFIG.businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: 1, // Minimum amount
      PartyA: formattedPhone,
      PartyB: MPESA_CONFIG.businessShortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: MPESA_CONFIG.callbackUrl,
      AccountReference: "DirectTest",
      TransactionDesc: "Direct STK Test",
    }

    console.log("STK payload:", JSON.stringify(stkPayload, null, 2))

    const stkResponse = await fetch(getEndpoint("stkPush"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stkPayload),
    })

    console.log("STK response status:", stkResponse.status)
    console.log("STK response headers:", Object.fromEntries(stkResponse.headers.entries()))

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
      })
    }

    if (stkData.ResponseCode === "0") {
      return NextResponse.json({
        success: true,
        message: "STK Push sent successfully! Check your phone.",
        checkoutRequestId: stkData.CheckoutRequestID,
        merchantRequestId: stkData.MerchantRequestID,
        responseDescription: stkData.ResponseDescription,
        customerMessage: stkData.CustomerMessage,
      })
    } else {
      return NextResponse.json({
        success: false,
        step: "stk_validation",
        error: stkData.ResponseDescription || "STK Push failed",
        response: stkData,
      })
    }
  } catch (error) {
    console.error("Direct STK error:", error)
    return NextResponse.json({
      success: false,
      step: "exception",
      error: error.message,
      stack: error.stack,
    })
  }
}
