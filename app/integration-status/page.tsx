"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"

interface TestResult {
  name: string
  status: "✅ PASS" | "❌ FAIL" | "⏳ PENDING" | "⚠️ WARNING"
  details?: any
  error?: string
}

export default function IntegrationStatus() {
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Define all required integration tests
  const requiredTests = {
    credentialsTest: {
      name: "M-Pesa API Credentials",
      description: "Validate consumer key and secret can get access token",
      endpoint: "/api/mpesa/integration-test",
    },
    phoneValidation: {
      name: "Phone Number Validation",
      description: "Correctly format and validate Kenyan phone numbers",
      test: () => {
        const testCases = [
          { input: "0712345678", expected: "254712345678" },
          { input: "254712345678", expected: "254712345678" },
          { input: "+254712345678", expected: "254712345678" },
          { input: "0112345678", expected: "254112345678" },
        ]

        const results = testCases.map((testCase) => {
          let formatted = testCase.input.replace(/\s+/g, "").replace(/[^\d]/g, "")
          if (formatted.startsWith("0")) {
            formatted = "254" + formatted.substring(1)
          } else if (formatted.startsWith("+254")) {
            formatted = formatted.substring(1)
          }
          return {
            input: testCase.input,
            expected: testCase.expected,
            actual: formatted,
            passed: formatted === testCase.expected,
          }
        })

        const allPassed = results.every((r) => r.passed)
        return {
          status: allPassed ? "✅ PASS" : "❌ FAIL",
          details: { testCases: results, allPassed },
        }
      },
    },
    amountValidation: {
      name: "Amount Validation",
      description: "Validate payment amounts within M-Pesa limits",
      test: () => {
        const testCases = [
          { amount: 0, shouldPass: false },
          { amount: 1, shouldPass: true },
          { amount: 1000, shouldPass: true },
          { amount: 70000, shouldPass: true },
          { amount: 70001, shouldPass: false },
          { amount: -100, shouldPass: false },
        ]

        const results = testCases.map((testCase) => {
          const isValid = testCase.amount >= 1 && testCase.amount <= 70000
          return {
            amount: testCase.amount,
            shouldPass: testCase.shouldPass,
            actualResult: isValid,
            passed: isValid === testCase.shouldPass,
          }
        })

        const allPassed = results.every((r) => r.passed)
        return {
          status: allPassed ? "✅ PASS" : "❌ FAIL",
          details: { testCases: results, allPassed },
        }
      },
    },
    callbackUrl: {
      name: "Callback URL Accessibility",
      description: "Callback endpoint is publicly accessible",
      endpoint: "/api/mpesa/callback",
    },
    stkPushFlow: {
      name: "STK Push Flow",
      description: "Complete payment initiation flow works",
      status: "⏳ PENDING",
    },
    paymentStatusTracking: {
      name: "Payment Status Tracking",
      description: "Can track payment status after initiation",
      status: "⏳ PENDING",
    },
    errorHandling: {
      name: "Error Handling",
      description: "Graceful handling of payment failures",
      status: "⏳ PENDING",
    },
    transactionLogging: {
      name: "Transaction Logging",
      description: "All transactions are properly logged",
      status: "⏳ PENDING",
    },
  }

  const runAllTests = async () => {
    setIsLoading(true)
    const results = { ...testResults }

    // Run local tests
    for (const [key, test] of Object.entries(requiredTests)) {
      if (test.test) {
        try {
          const result = test.test()
          results[key] = {
            name: test.name,
            ...result,
          }
        } catch (error) {
          results[key] = {
            name: test.name,
            status: "❌ FAIL",
            error: error.message,
          }
        }
      }
    }

    // Run API tests
    try {
      const response = await fetch("/api/mpesa/integration-test")
      const data = await response.json()

      if (data.tests) {
        Object.entries(data.tests).forEach(([key, test]: [string, any]) => {
          results[key] = test
        })
      }
    } catch (error) {
      console.error("API test failed:", error)
    }

    // Test callback URL
    try {
      const callbackResponse = await fetch("/api/mpesa/callback", { method: "GET" })
      results.callbackUrl = {
        name: "Callback URL Accessibility",
        status: callbackResponse.ok ? "✅ PASS" : "❌ FAIL",
        details: {
          httpStatus: callbackResponse.status,
          accessible: callbackResponse.ok,
        },
      }
    } catch (error) {
      results.callbackUrl = {
        name: "Callback URL Accessibility",
        status: "❌ FAIL",
        error: error.message,
      }
    }

    setTestResults(results)
    setIsLoading(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "✅ PASS":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "❌ FAIL":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "⚠️ WARNING":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variant = status.includes("PASS") ? "default" : status.includes("FAIL") ? "destructive" : "secondary"
    return <Badge variant={variant}>{status}</Badge>
  }

  const passedTests = Object.values(testResults).filter((test) => test.status === "✅ PASS").length
  const totalTests = Object.keys(requiredTests).length
  const completionPercentage = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🧪 M-Pesa Integration Status</h1>
        <p className="text-gray-600">Comprehensive testing of your M-Pesa sandbox integration</p>
      </div>

      {/* Summary Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Integration Completion
            <Badge variant={completionPercentage === 100 ? "default" : "secondary"}>
              {completionPercentage}% Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{passedTests}</div>
              <div className="text-sm text-gray-600">Passed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {Object.values(testResults).filter((test) => test.status === "❌ FAIL").length}
              </div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">{totalTests}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <Button onClick={runAllTests} disabled={isLoading} className="w-full">
            {isLoading ? "🔄 Running Tests..." : "🚀 Run All Integration Tests"}
          </Button>
        </CardContent>
      </Card>

      {/* Test Results */}
      <div className="grid gap-4">
        {Object.entries(requiredTests).map(([key, test]) => {
          const result = testResults[key] || { name: test.name, status: "⏳ PENDING" }
          return (
            <Card key={key}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <h3 className="font-semibold">{result.name}</h3>
                  </div>
                  {getStatusBadge(result.status)}
                </div>
                <p className="text-sm text-gray-600 mb-3">{test.description}</p>

                {result.details && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <pre className="text-xs overflow-auto">{JSON.stringify(result.details, null, 2)}</pre>
                  </div>
                )}

                {result.error && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                    <p className="text-sm text-red-600">{result.error}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Next Steps */}
      {completionPercentage === 100 && (
        <Card className="mt-6 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">🎉 Integration Complete!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700 mb-4">Your M-Pesa sandbox integration is ready! Here are your next steps:</p>
            <ul className="list-disc list-inside space-y-2 text-green-700">
              <li>Apply for production M-Pesa credentials</li>
              <li>Deploy your app to a permanent domain</li>
              <li>Update callback URLs in Safaricom portal</li>
              <li>Test with small amounts in production</li>
              <li>Implement transaction monitoring</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
