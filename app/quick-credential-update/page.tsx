"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Copy, CheckCircle, XCircle } from "lucide-react"

export default function QuickCredentialUpdate() {
  const [credentials, setCredentials] = useState({
    consumerKey: "9LeVWEtqHAXI4KZ69Sud11hIrrGudyjG", // Partial from screenshot
    consumerSecret: "sfAviHwYRD8rDDpYnRO5sZZxcp1BDAn", // Partial from screenshot
  })
  const [testResult, setTestResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (field: string, value: string) => {
    setCredentials((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const testCredentials = async () => {
    if (!credentials.consumerKey || !credentials.consumerSecret) {
      alert("Please enter your complete Consumer Key and Consumer Secret")
      return
    }

    setIsLoading(true)
    setTestResult(null)

    try {
      // Test the credentials directly
      const auth = Buffer.from(`${credentials.consumerKey}:${credentials.consumerSecret}`).toString("base64")

      const response = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (response.ok && data.access_token) {
        setTestResult({
          success: true,
          message: "✅ Credentials are working!",
          accessToken: data.access_token.substring(0, 10) + "...",
          expiresIn: data.expires_in,
        })
      } else {
        setTestResult({
          success: false,
          message: "❌ Credentials failed",
          error: data,
        })
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        message: "❌ Test failed",
        error: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center">🔧 Quick Credential Update</h1>

      <Card>
        <CardHeader>
          <CardTitle>Enter Your Complete Daraja Credentials</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="consumerKey">Consumer Key (Complete)</Label>
            <div className="flex gap-2">
              <Input
                id="consumerKey"
                value={credentials.consumerKey}
                onChange={(e) => handleChange("consumerKey", e.target.value)}
                placeholder="9LeVWEtqHAXI4KZ69Sud11hIrrGudyjG..."
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(credentials.consumerKey)}
                disabled={!credentials.consumerKey}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              From your Daraja app: Click "Credentials" button to get the full key
            </p>
          </div>

          <div>
            <Label htmlFor="consumerSecret">Consumer Secret (Complete)</Label>
            <div className="flex gap-2">
              <Input
                id="consumerSecret"
                value={credentials.consumerSecret}
                onChange={(e) => handleChange("consumerSecret", e.target.value)}
                placeholder="sfAviHwYRD8rDDpYnRO5sZZxcp1BDAn..."
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(credentials.consumerSecret)}
                disabled={!credentials.consumerSecret}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              From your Daraja app: Click "Credentials" button to get the full secret
            </p>
          </div>

          {testResult && (
            <div className={`p-4 rounded-lg text-center ${testResult.success ? "bg-green-50" : "bg-red-50"}`}>
              {testResult.success ? (
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              ) : (
                <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              )}
              <h3 className={`font-semibold ${testResult.success ? "text-green-700" : "text-red-700"}`}>
                {testResult.message}
              </h3>
              {testResult.accessToken && (
                <p className="text-sm text-green-600 mt-2">Access Token: {testResult.accessToken}</p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={testCredentials} disabled={isLoading} className="w-full">
            {isLoading ? "Testing..." : "Test Credentials"}
          </Button>
        </CardFooter>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">📋 How to Get Your Complete Credentials</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>1. Go back to your Daraja portal (developer.safaricom.co.ke)</p>
          <p>2. Find your "FoodOrderingApp" in My Apps</p>
          <p>3. Click the "Credentials" button under your app</p>
          <p>4. Copy the COMPLETE Consumer Key and Consumer Secret</p>
          <p>5. Paste them in the fields above and test</p>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">🚀 Next Steps After Testing</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>✅ Once credentials test successfully:</p>
          <p>1. Go to /direct-test to try STK push</p>
          <p>2. Try the main app checkout flow</p>
          <p>3. You should receive real M-Pesa prompts!</p>
        </CardContent>
      </Card>
    </div>
  )
}
