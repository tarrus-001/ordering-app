"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function DebugPage() {
  const [phone, setPhone] = useState("0712345678")
  const [amount, setAmount] = useState(100)
  const [debugResult, setDebugResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runDebug = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/mpesa/debug-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, amount }),
      })

      const data = await response.json()
      setDebugResult(data)
    } catch (error: any) {
      setDebugResult({ success: false, error: error.message })
    }
    setIsLoading(false)
  }

  const testCallback = async () => {
    try {
      const response = await fetch("/api/mpesa/test-callback")
      const data = await response.json()
      alert(`Callback test: ${data.message}`)
    } catch (error: any) {
      alert(`Callback test failed: ${error.message}`)
    }
  }

  const testCredentials = async () => {
    try {
      const response = await fetch("/api/mpesa/test")
      const data = await response.json()
      setDebugResult(data)
    } catch (error: any) {
      setDebugResult({ success: false, error: error.message })
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">🔍 M-Pesa Debug Dashboard</h1>

      <div className="grid gap-6">
        {/* Quick Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button onClick={testCredentials} variant="outline" className="w-full">
                🔑 Test Credentials
              </Button>
              <Button onClick={testCallback} variant="outline" className="w-full">
                🧪 Test Callback
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open("http://127.0.0.1:4040", "_blank")}
                className="w-full"
              >
                📊 ngrok Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Payment */}
        <Card>
          <CardHeader>
            <CardTitle>Debug M-Pesa Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0712345678" />
                <p className="text-xs text-gray-500 mt-1">Format: 0712345678 or 254712345678</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Amount (KES)</label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="100"
                />
                <p className="text-xs text-gray-500 mt-1">Min: 1, Max: 70,000</p>
              </div>
            </div>

            <Button onClick={runDebug} disabled={isLoading} className="w-full">
              {isLoading ? "🔄 Running Debug..." : "🔍 Debug Payment Flow"}
            </Button>
          </CardContent>
        </Card>

        {/* Debug Results */}
        {debugResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Debug Results
                <Badge variant={debugResult.success ? "default" : "destructive"}>
                  {debugResult.success ? "✅ Success" : "❌ Failed"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {debugResult.steps && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Step Results:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(debugResult.steps).map(([step, status]) => (
                      <div key={step} className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="capitalize">{step.replace(/([A-Z])/g, " $1")}:</span>
                        <span>{status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Full Response:</h3>
                <pre className="text-xs overflow-auto max-h-96 whitespace-pre-wrap">
                  {JSON.stringify(debugResult, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>🚀 Debug Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm space-y-2">
              <p>
                <strong>1. Test Credentials:</strong> Verify M-Pesa API credentials are working
              </p>
              <p>
                <strong>2. Test Callback:</strong> Check if your callback URL is accessible
              </p>
              <p>
                <strong>3. Debug Payment:</strong> Test the full payment flow with detailed logging
              </p>
              <p>
                <strong>4. Check ngrok:</strong> Monitor incoming requests in real-time
              </p>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800">Current Setup:</h4>
              <p className="text-sm text-blue-700">
                <strong>ngrok URL:</strong> https://be54-197-248-134-121.ngrok-free.app
                <br />
                <strong>Callback:</strong> /api/mpesa/callback
                <br />
                <strong>Environment:</strong> Sandbox
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
