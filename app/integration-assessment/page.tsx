"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react"

interface AssessmentItem {
  name: string
  status: "✅ COMPLETE" | "❌ MISSING" | "⚠️ PARTIAL" | "🔄 NEEDS_TESTING"
  details: string
  priority: "HIGH" | "MEDIUM" | "LOW"
}

export default function IntegrationAssessment() {
  const [assessmentResults, setAssessmentResults] = useState<Record<string, AssessmentItem[]>>({})

  useEffect(() => {
    // Assessment based on current code analysis
    setAssessmentResults({
      "Payment Initiation": [
        {
          name: "Customer Details Collection",
          status: "✅ COMPLETE",
          details: "Checkout form collects name, phone, email, address",
          priority: "HIGH",
        },
        {
          name: "Phone Number Validation",
          status: "✅ COMPLETE",
          details: "Validates Kenyan format (254XXXXXXXXX)",
          priority: "HIGH",
        },
        {
          name: "Amount Validation",
          status: "✅ COMPLETE",
          details: "Validates KES 1 - 70,000 range",
          priority: "HIGH",
        },
        {
          name: "Transaction Reference Generation",
          status: "✅ COMPLETE",
          details: "Generates unique checkout request IDs",
          priority: "HIGH",
        },
        {
          name: "STK Push Implementation",
          status: "⚠️ PARTIAL",
          details: "Code exists but currently using simulation mode",
          priority: "HIGH",
        },
      ],
      "Payment Processing": [
        {
          name: "M-Pesa API Response Handling",
          status: "✅ COMPLETE",
          details: "Handles success/failure responses correctly",
          priority: "HIGH",
        },
        {
          name: "Loading States",
          status: "✅ COMPLETE",
          details: "Shows 'Processing Payment...' with spinner",
          priority: "MEDIUM",
        },
        {
          name: "Payment Status Display",
          status: "✅ COMPLETE",
          details: "Shows success/failure messages to user",
          priority: "HIGH",
        },
        {
          name: "Status Polling",
          status: "✅ COMPLETE",
          details: "Polls payment status every 5 seconds",
          priority: "HIGH",
        },
      ],
      "Callback Handling": [
        {
          name: "Callback Endpoint",
          status: "✅ COMPLETE",
          details: "/api/mpesa/callback endpoint exists",
          priority: "HIGH",
        },
        {
          name: "Callback Data Parsing",
          status: "✅ COMPLETE",
          details: "Parses M-Pesa callback structure correctly",
          priority: "HIGH",
        },
        {
          name: "Real-time Status Updates",
          status: "✅ COMPLETE",
          details: "Updates transaction status from callbacks",
          priority: "HIGH",
        },
        {
          name: "Duplicate Callback Handling",
          status: "❌ MISSING",
          details: "No protection against duplicate callbacks",
          priority: "MEDIUM",
        },
      ],
      "User Experience": [
        {
          name: "Payment Flow UI",
          status: "✅ COMPLETE",
          details: "Complete checkout flow with progress indicators",
          priority: "HIGH",
        },
        {
          name: "Error Messages",
          status: "✅ COMPLETE",
          details: "Shows appropriate error messages",
          priority: "HIGH",
        },
        {
          name: "Success Confirmation",
          status: "✅ COMPLETE",
          details: "Shows success page with transaction details",
          priority: "HIGH",
        },
        {
          name: "Mobile Responsiveness",
          status: "✅ COMPLETE",
          details: "Uses Tailwind CSS for responsive design",
          priority: "MEDIUM",
        },
      ],
      "Error Handling": [
        {
          name: "Network Timeout Handling",
          status: "✅ COMPLETE",
          details: "2.5 minute timeout with polling",
          priority: "HIGH",
        },
        {
          name: "Phone Validation Errors",
          status: "✅ COMPLETE",
          details: "Validates and shows error for invalid phones",
          priority: "HIGH",
        },
        {
          name: "Amount Limit Validation",
          status: "✅ COMPLETE",
          details: "Validates amount range with error messages",
          priority: "HIGH",
        },
        {
          name: "API Error Handling",
          status: "✅ COMPLETE",
          details: "Try/catch blocks with error responses",
          priority: "HIGH",
        },
        {
          name: "Service Unavailability Fallback",
          status: "✅ COMPLETE",
          details: "Falls back to simulation mode",
          priority: "MEDIUM",
        },
      ],
      "Security & Validation": [
        {
          name: "Credential Management",
          status: "✅ COMPLETE",
          details: "Uses environment variables for secrets",
          priority: "HIGH",
        },
        {
          name: "Input Sanitization",
          status: "✅ COMPLETE",
          details: "Validates and sanitizes phone numbers",
          priority: "HIGH",
        },
        {
          name: "HTTPS Communication",
          status: "✅ COMPLETE",
          details: "ngrok provides HTTPS tunnel",
          priority: "HIGH",
        },
        {
          name: "Callback URL Verification",
          status: "❌ MISSING",
          details: "No verification of callback authenticity",
          priority: "MEDIUM",
        },
      ],
      "Logging & Monitoring": [
        {
          name: "Transaction Logging",
          status: "✅ COMPLETE",
          details: "Console logs for all transactions",
          priority: "HIGH",
        },
        {
          name: "Payment Status Tracking",
          status: "✅ COMPLETE",
          details: "In-memory status tracking (transactionStatuses)",
          priority: "HIGH",
        },
        {
          name: "API Response Logging",
          status: "✅ COMPLETE",
          details: "Logs all M-Pesa API responses",
          priority: "HIGH",
        },
        {
          name: "Persistent Storage",
          status: "❌ MISSING",
          details: "Uses in-memory storage, not persistent database",
          priority: "MEDIUM",
        },
      ],
      "Testing & Reliability": [
        {
          name: "Real M-Pesa API Connection",
          status: "🔄 NEEDS_TESTING",
          details: "Currently using simulation mode",
          priority: "HIGH",
        },
        {
          name: "Callback URL Accessibility",
          status: "🔄 NEEDS_TESTING",
          details: "ngrok URL needs to be tested with M-Pesa",
          priority: "HIGH",
        },
        {
          name: "End-to-End Testing",
          status: "🔄 NEEDS_TESTING",
          details: "Full payment flow needs real testing",
          priority: "HIGH",
        },
        {
          name: "Error Scenario Testing",
          status: "⚠️ PARTIAL",
          details: "Some error scenarios tested, others need verification",
          priority: "MEDIUM",
        },
      ],
    })
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "✅ COMPLETE":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "❌ MISSING":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "⚠️ PARTIAL":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "🔄 NEEDS_TESTING":
        return <Clock className="h-5 w-5 text-blue-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "✅ COMPLETE":
        return <Badge className="bg-green-100 text-green-800">Complete</Badge>
      case "❌ MISSING":
        return <Badge variant="destructive">Missing</Badge>
      case "⚠️ PARTIAL":
        return <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>
      case "🔄 NEEDS_TESTING":
        return <Badge className="bg-blue-100 text-blue-800">Needs Testing</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return (
          <Badge variant="destructive" className="text-xs">
            High
          </Badge>
        )
      case "MEDIUM":
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Medium</Badge>
      case "LOW":
        return (
          <Badge variant="secondary" className="text-xs">
            Low
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="text-xs">
            Unknown
          </Badge>
        )
    }
  }

  // Calculate overall completion
  const allItems = Object.values(assessmentResults).flat()
  const completedItems = allItems.filter((item) => item.status === "✅ COMPLETE").length
  const totalItems = allItems.length
  const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  const missingHighPriority = allItems.filter(
    (item) => item.priority === "HIGH" && (item.status === "❌ MISSING" || item.status === "🔄 NEEDS_TESTING"),
  )

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">📊 Your M-Pesa Integration Assessment</h1>
        <p className="text-gray-600">Comprehensive analysis of your current integration status</p>
      </div>

      {/* Overall Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Overall Integration Status
            <Badge variant={completionPercentage >= 80 ? "default" : "secondary"}>
              {completionPercentage}% Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div
              className={`h-4 rounded-full transition-all duration-300 ${
                completionPercentage >= 80
                  ? "bg-green-500"
                  : completionPercentage >= 60
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{completedItems}</div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {allItems.filter((item) => item.status === "❌ MISSING").length}
              </div>
              <div className="text-sm text-gray-600">Missing</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {allItems.filter((item) => item.status === "⚠️ PARTIAL").length}
              </div>
              <div className="text-sm text-gray-600">Partial</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {allItems.filter((item) => item.status === "🔄 NEEDS_TESTING").length}
              </div>
              <div className="text-sm text-gray-600">Needs Testing</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* High Priority Missing Items */}
      {missingHighPriority.length > 0 && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">🚨 High Priority Items Needed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {missingHighPriority.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                  <span className="font-medium text-red-700">{item.name}</span>
                  {getStatusBadge(item.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Assessment */}
      <div className="grid gap-6">
        {Object.entries(assessmentResults).map(([category, items]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {category}
                <Badge variant="outline">
                  {items.filter((item) => item.status === "✅ COMPLETE").length}/{items.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(item.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{item.name}</h4>
                          {getPriorityBadge(item.priority)}
                        </div>
                        <p className="text-sm text-gray-600">{item.details}</p>
                      </div>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Next Steps */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>🚀 Recommended Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Immediate Actions (High Priority)</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Test real M-Pesa API connection (disable simulation mode)</li>
                <li>• Verify callback URL receives M-Pesa notifications</li>
                <li>• Test end-to-end payment with real phone number</li>
                <li>• Add callback verification for security</li>
              </ul>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Medium Priority Improvements</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Add duplicate callback handling</li>
                <li>• Implement persistent database storage</li>
                <li>• Add comprehensive error scenario testing</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Production Readiness</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Deploy to permanent domain (Vercel)</li>
                <li>• Apply for production M-Pesa credentials</li>
                <li>• Set up monitoring and alerting</li>
                <li>• Create transaction reconciliation process</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
