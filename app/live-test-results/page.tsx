"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, Smartphone, RefreshCw } from "lucide-react"

export default function LiveTestResults() {
  const [testResult, setTestResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)

  const runLiveTest = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/mpesa/test-live", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: "0708268351" }),
      })

      const data = await response.json()
      setTestResult(data)
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-run test on page load
  useEffect(() => {
    runLiveTest()
  }, [])

  // Auto-refresh every 30 seconds if enabled
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(runLiveTest, 30000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const getStatusIcon = (success: boolean) => {
    if (success) {
      return <CheckCircle className="h-8 w-8 text-green-500" />
    } else {
      return <XCircle className="h-8 w-8 text-red-500" />
    }
  }

  const getStepIcon = (status: string) => {
    if (status.includes("SUCCESS")) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    } else {
      return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">🧪 Live STK Push Test Results</h1>

      <div className="grid gap-6">
        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Test Controls
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={autoRefresh ? "bg-blue-50" : ""}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`} />
                  Auto Refresh {autoRefresh ? "ON" : "OFF"}
                </Button>
                <Button onClick={runLiveTest} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Smartphone className="h-4 w-4 mr-2" />
                      Run Test
                    </>
                  )}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              <p>
                Testing STK Push to: <strong>0708268351</strong>
              </p>
              <p>
                Amount: <strong>KES 1</strong> (minimum test amount)
              </p>
              <p>
                Environment: <strong>Sandbox</strong>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResult && (
          <>
            {/* Overall Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Overall Test Result
                  <Badge variant={testResult.success ? "default" : "destructive"}>
                    {testResult.success ? "SUCCESS" : "FAILED"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  {getStatusIcon(testResult.success)}
                  <div>
                    <h3 className={`font-semibold ${testResult.success ? "text-green-700" : "text-red-700"}`}>
                      {testResult.message || (testResult.success ? "STK Push Successful!" : "STK Push Failed")}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Tested at: {new Date(testResult.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                {testResult.success && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">🎉 Success! Check Your Phone!</h4>
                    <p className="text-green-700 text-sm">
                      A real M-Pesa payment prompt should have been sent to <strong>0708268351</strong>. Check your
                      phone for the notification and enter your M-Pesa PIN to complete the KES 1 test payment.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step-by-Step Results */}
            {testResult.steps && (
              <Card>
                <CardHeader>
                  <CardTitle>Step-by-Step Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(testResult.steps).map(([step, status]) => (
                      <div key={step} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        {getStepIcon(status as string)}
                        <div className="flex-1">
                          <span className="font-medium capitalize">{step.replace(/([A-Z])/g, " $1").trim()}</span>
                        </div>
                        <Badge variant={status.toString().includes("SUCCESS") ? "default" : "destructive"}>
                          {status as string}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* STK Response Details */}
            {testResult.stkResponse && (
              <Card>
                <CardHeader>
                  <CardTitle>M-Pesa API Response</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Response Code</label>
                      <p className="font-mono text-sm">{testResult.stkResponse.responseCode}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Response Description</label>
                      <p className="font-mono text-sm">{testResult.stkResponse.responseDescription}</p>
                    </div>
                    {testResult.stkResponse.checkoutRequestId && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Checkout Request ID</label>
                        <p className="font-mono text-sm">{testResult.stkResponse.checkoutRequestId}</p>
                      </div>
                    )}
                    {testResult.stkResponse.merchantRequestId && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Merchant Request ID</label>
                        <p className="font-mono text-sm">{testResult.stkResponse.merchantRequestId}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Raw Response */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Raw Test Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <pre className="text-xs overflow-auto whitespace-pre-wrap">{JSON.stringify(testResult, null, 2)}</pre>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">📱 What to Expect</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>
              <strong>If the test is successful:</strong>
            </p>
            <p>• You should receive an M-Pesa notification on 0708268351</p>
            <p>• The notification will ask you to pay KES 1</p>
            <p>• Enter your M-Pesa PIN to complete the test payment</p>
            <p>• This confirms the STK Push is working correctly</p>

            <p className="mt-4">
              <strong>If the test fails:</strong>
            </p>
            <p>• Check the error details above</p>
            <p>• Verify your Daraja credentials are complete</p>
            <p>• Ensure your phone number is correct</p>
            <p>• Try again in a few minutes</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
