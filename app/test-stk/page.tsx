"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, Smartphone } from "lucide-react"

export default function TestStkPage() {
  const [phone, setPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [statusPolling, setStatusPolling] = useState<any>(null)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "failed">("idle")

  const testStk = async () => {
    if (!phone) {
      alert("Please enter your phone number")
      return
    }

    setIsLoading(true)
    setPaymentStatus("processing")
    setResult(null)

    try {
      const response = await fetch("/api/mpesa/test-stk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        // Start polling for status
        pollPaymentStatus(data.checkoutRequestId)
      } else {
        setPaymentStatus("failed")
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: "Error sending STK push: " + error.message,
      })
      setPaymentStatus("failed")
    } finally {
      setIsLoading(false)
    }
  }

  const pollPaymentStatus = async (checkoutRequestId: string) => {
    // Clear any existing polling
    if (statusPolling) {
      clearInterval(statusPolling)
    }

    let attempts = 0
    const maxAttempts = 30 // Poll for 2.5 minutes

    const poll = async () => {
      try {
        const response = await fetch(`/api/mpesa/status/${checkoutRequestId}`)
        const data = await response.json()

        setResult((prev: any) => ({
          ...prev,
          status: data,
        }))

        if (data.status === "completed") {
          setPaymentStatus("success")
          clearInterval(statusPolling)
        } else if (data.status === "failed") {
          setPaymentStatus("failed")
          clearInterval(statusPolling)
        } else if (attempts >= maxAttempts) {
          setPaymentStatus("failed")
          clearInterval(statusPolling)
        }

        attempts++
      } catch (error) {
        console.error("Status polling error:", error)
        if (attempts >= maxAttempts) {
          setPaymentStatus("failed")
          clearInterval(statusPolling)
        }
        attempts++
      }
    }

    // Poll immediately and then every 5 seconds
    poll()
    const interval = setInterval(poll, 5000)
    setStatusPolling(interval)

    // Cleanup on component unmount
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-md">
      <h1 className="text-3xl font-bold mb-6 text-center">🧪 Test M-Pesa STK Push</h1>

      <Card>
        <CardHeader>
          <CardTitle>Send Test Payment (KES 1)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Your Phone Number</label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0712345678"
              disabled={isLoading || paymentStatus === "success"}
            />
            <p className="text-xs text-gray-500 mt-1">Enter your Safaricom number (e.g., 0712345678)</p>
          </div>

          {paymentStatus === "processing" && (
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <Loader2 className="h-8 w-8 text-blue-500 mx-auto mb-2 animate-spin" />
              <h3 className="font-semibold text-blue-700">Processing Payment...</h3>
              <p className="text-sm text-blue-600">
                {result?.status?.message || "Please check your phone for the M-Pesa prompt"}
              </p>
            </div>
          )}

          {paymentStatus === "success" && (
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold text-green-700">Payment Successful!</h3>
              {result?.status?.mpesaReceiptNumber && (
                <p className="text-sm text-green-600">
                  Receipt: {result.status.mpesaReceiptNumber}
                  <br />
                  Amount: KES {result.status.amount || 1}
                </p>
              )}
            </div>
          )}

          {paymentStatus === "failed" && (
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <h3 className="font-semibold text-red-700">Payment Failed</h3>
              <p className="text-sm text-red-600">
                {result?.status?.resultDesc || result?.message || "The payment could not be processed"}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={testStk} disabled={isLoading || !phone || paymentStatus === "success"} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Smartphone className="h-4 w-4 mr-2" />
                Send Test STK Push
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {result && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-sm">
              Response Details
              <Badge variant={result.success ? "default" : "destructive"}>
                {result.success ? "Success" : "Failed"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-3 rounded-lg">
              <pre className="text-xs overflow-auto whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">📋 Instructions</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>1. Enter your real Safaricom phone number</p>
          <p>2. Click "Send Test STK Push"</p>
          <p>3. Check your phone for M-Pesa notification</p>
          <p>4. Enter your M-Pesa PIN to complete payment</p>
          <p>5. Watch the status update automatically</p>
          <div className="bg-yellow-50 p-3 rounded-lg mt-4">
            <p className="text-yellow-800 font-medium">Note: This is sandbox mode - no real money is charged!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
