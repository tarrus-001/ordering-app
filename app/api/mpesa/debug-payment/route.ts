import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, amount } = body

    console.log("🔍 DEBUG: Starting M-Pesa payment debug...")

    // Step 1: Test credentials
    const MPESA_CONFIG = {
      consumerKey: "8rbAE29vQKW3weaAUjRLCagjBrf0d6dX",
      consumerSecret: "qp3JpWQCUPxFS9cHp1Q8BVeK2LYQlPllN8",
      businessShortCode: "174379",
      passkey: "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
    }

    console.log("📋 Config check:")
    console.log("   Consumer Key:", MPESA_CONFIG.consumerKey)
    console.log("   Business ShortCode:", MPESA_CONFIG.businessShortCode)
    console.log("   Passkey length:", MPESA_CONFIG.passkey.length)

    // Step 2: Test access token
    const auth = Buffer.from(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`).toString("base64")

    console.log("🔑 Testing access token...")
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

    const tokenText = await tokenResponse.text()
    console.log("   Token Response Status:", tokenResponse.status)
    console.log("   Token Response:", tokenText)

    if (!tokenResponse.ok) {
      return NextResponse.json({
        success: false,
        step: "access_token",
        error: `Failed to get access token: ${tokenResponse.status}`,
        response: tokenText,
      })
    }

    const tokenData = JSON.parse(tokenText)
    const accessToken = tokenData.access_token

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        step: "access_token",
        error: "No access token in response",
        response: tokenData,
      })
    }

    console.log("✅ Access token obtained successfully")

    // Step 3: Format and validate phone
    let formattedPhone = phone.replace(/\s+/g, "").replace(/[^\d]/g, "")

    if (formattedPhone.startsWith("0")) {
      formattedPhone = "254" + formattedPhone.substring(1)
    } else if (!formattedPhone.startsWith("254")) {
      formattedPhone = "254" + formattedPhone
    }

    console.log("📞 Phone validation:")
    console.log("   Original:", phone)
    console.log("   Formatted:", formattedPhone)
    console.log("   Valid format:", /^254[17]\d{8}$/.test(formattedPhone))

    if (!/^254[17]\d{8}$/.test(formattedPhone)) {
      return NextResponse.json({
        success: false,
        step: "phone_validation",
        error: "Invalid phone number format",
        original: phone,
        formatted: formattedPhone,
        expected: "254XXXXXXXXX (where X is 7 or 1 followed by 8 digits)",
      })
    }

    // Step 4: Generate password
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, -3)

    const password = Buffer.from(`${MPESA_CONFIG.businessShortCode}${MPESA_CONFIG.passkey}${timestamp}`).toString(
      "base64",
    )

    console.log("🔐 Password generation:")
    console.log("   Timestamp:", timestamp)
    console.log("   Password length:", password.length)

    // Step 5: Prepare STK Push payload
    const callbackUrl = "https://be54-197-248-134-121.ngrok-free.app/api/mpesa/callback"

    const stkPayload = {
      BusinessShortCode: MPESA_CONFIG.businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: MPESA_CONFIG.businessShortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: `TEST${Date.now()}`,
      TransactionDesc: "Test Payment Debug",
    }

    console.log("📤 STK Push payload:")
    console.log(JSON.stringify(stkPayload, null, 2))

    // Step 6: Send STK Push
    console.log("🚀 Sending STK Push...")
    const stkResponse = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stkPayload),
    })

    const stkText = await stkResponse.text()
    console.log("   STK Response Status:", stkResponse.status)
    console.log("   STK Response:", stkText)

    let stkData = null
    try {
      stkData = JSON.parse(stkText)
    } catch (e) {
      stkData = { rawResponse: stkText }
    }

    // Return comprehensive debug info
    return NextResponse.json({
      success: stkResponse.ok && stkData?.ResponseCode === "0",
      steps: {
        credentials: "✅ Valid",
        accessToken: accessToken ? "✅ Obtained" : "❌ Failed",
        phoneValidation: /^254[17]\d{8}$/.test(formattedPhone) ? "✅ Valid" : "❌ Invalid",
        stkPush: stkResponse.ok ? "✅ Sent" : "❌ Failed",
      },
      data: {
        formattedPhone,
        callbackUrl,
        timestamp,
        stkResponse: {
          status: stkResponse.status,
          data: stkData,
        },
      },
      payload: stkPayload,
    })
  } catch (error) {
    console.error("💥 Debug error:", error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    })
  }
}
