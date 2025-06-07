import { type NextRequest, NextResponse } from "next/server"

// Store transaction statuses (use database in production)
const transactionStatuses = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    console.log("📞 M-Pesa Callback received at:", new Date().toISOString())

    // Log all headers for debugging
    console.log("📋 Request headers:", Object.fromEntries(request.headers.entries()))

    // Get the raw body
    const rawBody = await request.text()
    console.log("📄 Raw callback body:", rawBody)

    // Parse the body
    let body
    try {
      body = JSON.parse(rawBody)
      console.log("📦 Parsed callback body:", JSON.stringify(body, null, 2))
    } catch (e) {
      console.error("❌ Failed to parse callback body:", e)
      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Callback received but failed to parse",
      })
    }

    // Extract callback data
    const { Body } = body
    const { stkCallback } = Body || {}

    if (stkCallback) {
      const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback

      console.log("📋 Processing STK callback:")
      console.log("   CheckoutRequestID:", CheckoutRequestID)
      console.log("   ResultCode:", ResultCode)
      console.log("   ResultDesc:", ResultDesc)

      if (ResultCode === 0) {
        // Payment successful
        const metadata = CallbackMetadata?.Item || []
        const paymentData = {
          amount: metadata.find((item: any) => item.Name === "Amount")?.Value,
          mpesaReceiptNumber: metadata.find((item: any) => item.Name === "MpesaReceiptNumber")?.Value,
          transactionDate: metadata.find((item: any) => item.Name === "TransactionDate")?.Value,
          phoneNumber: metadata.find((item: any) => item.Name === "PhoneNumber")?.Value,
        }

        console.log("✅ Payment successful!")
        console.log("   Amount: KES", paymentData.amount)
        console.log("   Receipt:", paymentData.mpesaReceiptNumber)
        console.log("   Phone:", paymentData.phoneNumber)

        // Update transaction status
        transactionStatuses.set(CheckoutRequestID, {
          status: "completed",
          resultCode: "0",
          resultDesc: "Payment completed successfully",
          mpesaReceiptNumber: paymentData.mpesaReceiptNumber,
          transactionDate: paymentData.transactionDate,
          amount: paymentData.amount,
          phoneNumber: paymentData.phoneNumber,
          updatedAt: new Date().toISOString(),
          callbackReceived: true,
        })

        // Here you would typically:
        // 1. Update order status in database
        // 2. Send confirmation email/SMS
        // 3. Trigger order fulfillment
        // 4. Update inventory
      } else {
        // Payment failed or cancelled
        console.log("❌ Payment failed/cancelled:", ResultDesc)

        transactionStatuses.set(CheckoutRequestID, {
          status: "failed",
          resultCode: ResultCode,
          resultDesc: ResultDesc,
          updatedAt: new Date().toISOString(),
          callbackReceived: true,
        })
      }
    } else {
      console.log("⚠️ Invalid callback format received")
    }

    // Always acknowledge receipt to M-Pesa
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Callback received successfully",
    })
  } catch (error) {
    console.error("❌ Callback processing error:", error)

    // Still acknowledge to prevent retries
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Callback processed with error",
    })
  }
}

// Export the transaction statuses for status checking
export { transactionStatuses }
