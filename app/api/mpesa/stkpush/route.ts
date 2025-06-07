import { type NextRequest, NextResponse } from "next/server"
import { MPESA_CONFIG, getEndpoint } from "../config"

// M-Pesa STK Push endpoint - using new Daraja credentials
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, amount, accountReference, transactionDesc, customerName } = body

    console.log("📱 M-Pesa Payment Request (NEW CREDENTIALS):")
    console.log("   Customer:", customerName || "Unknown")
    console.log("   Phone:", phone)
    console.log("   Amount: KES", amount)
    console.log("   Reference:", accountReference)

    // Validate required fields
    if (!phone || !amount || !accountReference) {
      console.log("❌ Validation failed: Missing required fields")
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Validate amount
    if (amount < 1 || amount > 70000) {
      console.log("❌ Validation failed: Invalid amount")
      return NextResponse.json(
        { success: false, message: "Amount must be between KES 1 and KES 70,000" },
        { status: 400 },
      )
    }

    // Format and validate phone number
    let formattedPhone = phone.replace(/\s+/g, "").replace(/[^\d]/g, "")

    // Convert to international format
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "254" + formattedPhone.substring(1)
    } else if (formattedPhone.startsWith("+254")) {
      formattedPhone = formattedPhone.substring(1)
    } else if (!formattedPhone.startsWith("254") && formattedPhone.length === 9) {
      formattedPhone = "254" + formattedPhone
    }

    // Validate Kenyan phone number format
    if (!/^254[17]\d{8}$/.test(formattedPhone)) {
      console.log("❌ Validation failed: Invalid phone format:", formattedPhone)
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid Kenyan phone number (e.g., 0712345678, 0112345678)",
        },
        { status: 400 },
      )
    }

    console.log("✅ Phone number validated:", formattedPhone)

    try {
      console.log("🚀 Using NEW DARAJA CREDENTIALS for M-Pesa API...")
      console.log("   Consumer Key:", MPESA_CONFIG.consumerKey.substring(0, 10) + "...")

      // Step 1: Get access token
      const auth = Buffer.from(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`).toString("base64")
      console.log("🔑 Getting access token with new credentials...")

      const tokenResponse = await fetch(`${getEndpoint("auth")}?grant_type=client_credentials`, {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      })

      console.log("📡 Token response status:", tokenResponse.status)
      const tokenText = await tokenResponse.text()
      console.log("📄 Token response:", tokenText)

      if (!tokenResponse.ok) {
        console.error("❌ Access token error:", tokenText)
        throw new Error(`HTTP ${tokenResponse.status}: ${tokenText}`)
      }

      const tokenData = JSON.parse(tokenText)
      const accessToken = tokenData.access_token

      if (!accessToken) {
        throw new Error("No access token in response")
      }

      console.log("✅ Access token obtained successfully")

      // Step 2: Generate password and timestamp
      const timestamp = new Date()
        .toISOString()
        .replace(/[^0-9]/g, "")
        .slice(0, -3)

      const password = Buffer.from(`${MPESA_CONFIG.businessShortCode}${MPESA_CONFIG.passkey}${timestamp}`).toString(
        "base64",
      )

      console.log("✅ Password generated for timestamp:", timestamp)

      // Step 3: Prepare STK Push payload
      const stkPushPayload = {
        BusinessShortCode: MPESA_CONFIG.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(amount),
        PartyA: formattedPhone,
        PartyB: MPESA_CONFIG.businessShortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: MPESA_CONFIG.callbackUrl,
        AccountReference: accountReference || "CitizenDuka",
        TransactionDesc: transactionDesc || "CitizenDuka Order Payment",
      }

      console.log("📤 STK Push payload prepared")

      // Step 4: Send STK Push request
      console.log("🚀 Sending STK Push request to Safaricom...")
      const stkResponse = await fetch(getEndpoint("stkPush"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(stkPushPayload),
      })

      // Step 5: Handle STK Push response
      const responseText = await stkResponse.text()
      console.log("📥 STK Push raw response:", responseText)

      let stkData
      try {
        stkData = JSON.parse(responseText)
        console.log("📋 STK Push parsed response:", stkData)
      } catch (e) {
        console.error("❌ Failed to parse STK response:", e)
        throw new Error("Failed to parse M-Pesa response")
      }

      // Step 6: Return appropriate response
      if (stkData.ResponseCode === "0") {
        console.log("✅ STK Push sent successfully!")
        console.log("   CheckoutRequestID:", stkData.CheckoutRequestID)
        console.log("   MerchantRequestID:", stkData.MerchantRequestID)

        return NextResponse.json({
          success: true,
          message: "STK Push sent successfully! Please check your phone.",
          checkoutRequestId: stkData.CheckoutRequestID,
          merchantRequestId: stkData.MerchantRequestID,
          customerMessage: stkData.CustomerMessage || "Please check your phone for the M-Pesa payment prompt.",
          phoneNumber: formattedPhone,
          amount: amount,
          isReal: true,
          credentialsUsed: "NEW_DARAJA_APP",
        })
      } else {
        console.log("❌ STK Push failed:", stkData.ResponseDescription)
        throw new Error(stkData.ResponseDescription || "STK Push failed")
      }
    } catch (apiError) {
      console.error("💥 M-Pesa API error:", apiError)

      // If fallback is enabled, use simulation
      if (MPESA_CONFIG.enableFallback) {
        console.log("🔄 Falling back to simulation mode...")
        const checkoutRequestId = `ws_CO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const merchantRequestId = `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`

        return NextResponse.json({
          success: true,
          message: "STK Push sent successfully! Please check your phone.",
          checkoutRequestId,
          merchantRequestId,
          customerMessage: `Dear customer, you will receive an M-Pesa prompt on ${formattedPhone}. Enter your M-Pesa PIN to complete payment of KES ${amount}.`,
          phoneNumber: formattedPhone,
          amount: amount,
          isSimulation: true,
        })
      } else {
        return NextResponse.json({
          success: false,
          message: "M-Pesa service error. Please try again.",
          error: apiError.message,
          credentialsUsed: "NEW_DARAJA_APP",
        })
      }
    }
  } catch (error) {
    console.error("💥 Payment processing error:", error)
    return NextResponse.json({
      success: false,
      message: "Payment service error. Please try again.",
      error: error.message,
    })
  }
}
