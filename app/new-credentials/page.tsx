"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Loader2, CheckCircle, XCircle, Save } from "lucide-react"
import { Label } from "@/components/ui/label"

export default function NewCredentialsPage() {
  const [credentials, setCredentials] = useState({
    consumerKey: "",
    consumerSecret: "",
    businessShortCode: "174379", // Default sandbox shortcode
    passkey: "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919", // Default sandbox passkey
    callbackUrl: "https://be54-197-248-134-121.ngrok-free.app/api/mpesa/callback",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)

  const handleChange = (field: string, value: string) => {
    setCredentials((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const testCredentials = async () => {
    if (!credentials.consumerKey || !credentials.consumerSecret) {
      alert("Please enter your Consumer Key and Consumer Secret")
      return
    }

    setIsLoading(true)
    setTestResult(null)

    try {
      // First, update the config
      const updateResponse = await fetch("/api/mpesa/update-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      if (!updateResponse.ok) {
        throw new Error("Failed to update configuration")
      }

      // Then test the credentials
      const testResponse = await fetch("/api/mpesa/check-new-credentials")
      const data = await testResponse.json()
      setTestResult(data)
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center">🔑 Update M-Pesa Credentials</h1>

      <Card>
        <CardHeader>
          <CardTitle>Enter Your New Daraja App Credentials</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="consumerKey">Consumer Key</Label>
              <Input
                id="consumerKey"
                value={credentials.consumerKey}
                onChange={(e) => handleChange("consumerKey", e.target.value)}
                placeholder="Enter your new Consumer Key"
              />
            </div>
            <div>
              <Label htmlFor="consumerSecret">Consumer Secret</Label>
              <Input
                id="consumerSecret"
                value={credentials.consumerSecret}
                onChange={(e) => handleChange("consumerSecret", e.target.value)}
                placeholder="Enter your new Consumer Secret"
              />
            </div>
            <div>
              <Label htmlFor="businessShortCode">Business ShortCode</Label>
              <Input
                id="businessShortCode"
                value={credentials.businessShortCode}
                onChange={(e) => handleChange("businessShortCode", e.target.value)}
                placeholder="174379"
              />
              <p className="text-xs text-gray-500 mt-1">Default: 174379 (Sandbox)</p>
            </div>
            <div>
              <Label htmlFor="callbackUrl">Callback URL</Label>
              <Input
                id="callbackUrl"
                value={credentials.callbackUrl}
                onChange={(e) => handleChange("callbackUrl", e.target.value)}
                placeholder="https://your-ngrok-url.ngrok-free.app/api/mpesa/callback"
              />
              <p className="text-xs text-gray-500 mt-1">Must match the URL registered in Daraja</p>
            </div>
          </div>

          {testResult && (
            <div
              className={`p-4 rounded-lg ${
                testResult.conclusion?.authenticationSuccessful ? "bg-green-50" : "bg-red-50"
              }`}
            >
              {testResult.conclusion?.authenticationSuccessful ? (
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              ) : (
                <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              )}
              <h3
                className={`font-semibold text-center ${
                  testResult.conclusion?.authenticationSuccessful ? "text-green-700" : "text-red-700"
                }`}
              >
                {testResult.conclusion?.authenticationSuccessful ? "Credentials Working!" : "Credentials Failed"}
              </h3>
              <p
                className={`text-sm text-center ${
                  testResult.conclusion?.authenticationSuccessful ? "text-green-600" : "text-red-600"
                }`}
              >
                {testResult.conclusion?.overallStatus}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={testCredentials} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save & Test Credentials
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {testResult && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Detailed Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-3 rounded-lg">
              <pre className="text-xs overflow-auto whitespace-pre-wrap">{JSON.stringify(testResult, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">How to Get New Credentials</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>
            1. Go to{" "}
            <a
              href="https://developer.safaricom.co.ke/"
              className="text-blue-600 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Safaricom Developer Portal
            </a>
          </p>
          <p>2. Log in to your account (or create one)</p>
          <p>3. Navigate to "My Apps" and click "Add a New App"</p>
          <p>4. Fill in app details and select M-Pesa APIs</p>
          <p>5. Set your callback URL (must match the one above)</p>
          <p>6. Submit and copy your new Consumer Key and Secret</p>
        </CardContent>
      </Card>
    </div>
  )
}
