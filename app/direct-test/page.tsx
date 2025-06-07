"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Loader2, CheckCircle, XCircle, Smartphone } from "lucide-react"

export default function DirectTestPage() {
  const [phone, setPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testDirectStk = async () => {
    if (!phone) {
      alert("Please enter your phone number")
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/mpesa/direct-stk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error: any) {
      setResult({
        success: false,
        message: "Error: " + error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-md">
      <h1 className="text-3xl font-bold mb-6 text-center">🚀 Direct STK Push Test</h1>

      <Card>
        <CardHeader>
          <CardTitle>Send Direct STK Push (KES 1)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Your Phone Number</label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0712345678"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">Enter your Safaricom number (e.g., 0712345678)</p>
          </div>

          {result && (
            <div className={`p-4 rounded-lg text-center ${result.success ? "bg-green-50" : "bg-red-50"}`}>
              {result.success ? (
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              ) : (
                <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              )}
              <h3 className={`font-semibold ${result.success ? "text-green-700" : "text-red-700"}`}>
                {result.success ? "STK Push Sent!" : "STK Push Failed"}
              </h3>
              <p className={`text-sm ${result.success ? "text-green-600" : "text-red-600"}`}>
                {result.message || result.error}
              </p>
              {result.checkoutRequestId && <p className="text-xs text-gray-600 mt-2">ID: {result.checkoutRequestId}</p>}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={testDirectStk} disabled={isLoading || !phone} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Smartphone className="h-4 w-4 mr-2" />
                Send Direct STK Push
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {result && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Detailed Response</CardTitle>
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
          <CardTitle className="text-sm">Troubleshooting Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>• Make sure you're using a real Safaricom number</p>
          <p>• Check that your phone has sufficient balance</p>
          <p>• Ensure your phone is powered on and has network</p>
          <p>• If you get a token error, the M-Pesa API might be down</p>
          <p>• Try again in a few minutes if it fails</p>
        </CardContent>
      </Card>
    </div>
  )
}
