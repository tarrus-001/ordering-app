import { type NextRequest, NextResponse } from "next/server"

// Store transaction statuses (use database in production)
const transactionStatuses = new Map<string, any>()

// Function to check real STK push status
async function checkRealStkStatus(checkoutRequestId: string) {
  try {
    const MPESA_CONFIG = {
      consumerKey: "8rbAE29vQKW3weaAUjRLCagjBrf0d6dX",
      consumerSecret: "qp3JpWQCUPxFS9cHp1Q8BVeK2LYQlPllN8",
      businessShortCode: "174379",
      passkey: "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
    }

    // Get access token
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

    if (!tokenResponse.ok) {
      throw new Error("Failed to get access token for status check")
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    if (!accessToken) {
      throw new Error("No access token received")
    }

    // Generate password
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, -3)
    const password = Buffer.from(`${MPESA_CONFIG.businessShortCode}${MPESA_CONFIG.passkey}${timestamp}`).toString(
      "base64",
    )

    // Check STK status
    const statusResponse = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: MPESA_CONFIG.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      }),
    })

    const statusData = await statusResponse.json()
    console.log("📊 STK status check response:", statusData)

    // Process status response
    if (statusData.ResponseCode === "0") {
      if (statusData.ResultCode === "0") {
        return {
          status: "completed",
          resultCode: statusData.ResultCode,
          resultDesc: statusData.ResultDesc,
        }
      } else {
        return {
          status: "failed",
          resultCode: statusData.ResultCode,
          resultDesc: statusData.ResultDesc,
        }
      }
    } else {
      return {
        status: "pending",
        resultCode: statusData.ResponseCode,
        resultDesc: statusData.ResponseDescription || "Status check pending",
      }
    }
  } catch (error) {
    console.error("❌ STK status check error:", error)
    return {
      status: "error",
      error: error.message,
    }
  }
}

export async function GET(request: NextRequest, { params }: { params: { checkoutRequestId: string } }) {
  try {
    const checkoutRequestId = params.checkoutRequestId

    console.log("🔍 Checking payment status for:", checkoutRequestId)

    // Get status from memory
    let status = transactionStatuses.get(checkoutRequestId)

    // If we have a completed or failed status, return it immediately
    if (status && (status.status === "completed" || status.status === "failed")) {
      return NextResponse.json({
        success: true,
        checkoutRequestId,
        ...status,
      })
    }

    // Determine if this is a simulation or real transaction
    const isSimulation = checkoutRequestId.startsWith("ws_CO_")

    if (isSimulation) {
      // Handle simulation status
      const elapsed = status ? Date.now() - status.createdAt : 0
      const elapsedSeconds = Math.round(elapsed / 1000)

      if (!status) {
        status = {
          status: "pending",
          createdAt: Date.now(),
          message: "Initializing payment request...",
          stage: "init",
        }
        transactionStatuses.set(checkoutRequestId, status)
      }

      // Simulate realistic M-Pesa payment progression
      if (status.status === "pending") {
        if (elapsed > 150000) {
          // 2.5 minutes timeout
          status = {
            ...status,
            status: "failed",
            resultCode: "1032",
            resultDesc: "Payment request timed out",
            message: "⏰ Payment timed out. Please try again.",
            stage: "timeout",
          }
        } else if (elapsed > 25000) {
          // After 25 seconds, simulate completion
          const isSuccess = Math.random() > 0.1 // 90% success rate

          if (isSuccess) {
            status = {
              ...status,
              status: "completed",
              resultCode: "0",
              resultDesc: "Payment completed successfully",
              mpesaReceiptNumber: `QK${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
              transactionDate: new Date().toISOString(),
              amount: status.amount || 65, // Use the actual amount
              message: "✅ Payment completed successfully! Your order is confirmed.",
              stage: "completed",
            }
          } else {
            status = {
              ...status,
              status: "failed",
              resultCode: "1",
              resultDesc: "Payment was cancelled by user",
              message: "❌ Payment was cancelled or failed. Please try again.",
              stage: "failed",
            }
          }
        } else if (elapsed > 15000) {
          status = {
            ...status,
            message: "⏳ Processing payment... Please wait.",
            stage: "processing",
          }
        } else if (elapsed > 8000) {
          status = {
            ...status,
            message: "📱 Please check your phone for M-Pesa prompt and enter your PIN",
            stage: "user_action",
          }
        } else if (elapsed > 3000) {
          status = {
            ...status,
            message: "📤 Sending payment request to your phone...",
            stage: "sending",
          }
        } else {
          status = {
            ...status,
            message: "🔄 Preparing payment request...",
            stage: "preparing",
          }
        }
      }

      transactionStatuses.set(checkoutRequestId, status)
    } else {
      // Handle real M-Pesa transaction status
      try {
        console.log("🔍 Checking real STK status with M-Pesa API...")
        const realStatus = await checkRealStkStatus(checkoutRequestId)

        // Update status in memory
        if (realStatus.status === "completed" || realStatus.status === "failed") {
          status = {
            ...status,
            ...realStatus,
            updatedAt: new Date().toISOString(),
          }
          transactionStatuses.set(checkoutRequestId, status)
        } else if (!status) {
          // Initialize status if not exists
          status = {
            status: "pending",
            createdAt: Date.now(),
            message: "Payment processing. Please check your phone.",
            ...realStatus,
          }
          transactionStatuses.set(checkoutRequestId, status)
        }
      } catch (error) {
        console.error("❌ Real status check failed:", error)
        // If real status check fails, treat as pending
        if (!status) {
          status = {
            status: "pending",
            createdAt: Date.now(),
            message: "Payment processing. Please check your phone.",
            error: error.message,
          }
          transactionStatuses.set(checkoutRequestId, status)
        }
      }
    }

    return NextResponse.json({
      success: true,
      checkoutRequestId,
      elapsed: status ? Math.round((Date.now() - status.createdAt) / 1000) : 0,
      isSimulation,
      ...status,
    })
  } catch (error) {
    console.error("❌ Status check error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
