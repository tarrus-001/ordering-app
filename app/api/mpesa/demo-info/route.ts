import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    demoMode: true,
    message: "M-Pesa Integration Demo",
    features: [
      "✅ Phone number validation",
      "✅ Amount validation (KES 1 - 70,000)",
      "✅ Realistic payment flow simulation",
      "✅ Transaction status tracking",
      "✅ 90% success rate simulation",
      "✅ Proper error handling",
      "✅ Receipt generation",
    ],
    instructions: [
      "1. Add items to cart",
      "2. Enter your real Kenyan phone number",
      "3. Fill in delivery details",
      "4. Click 'Pay with M-Pesa'",
      "5. Watch the realistic payment progression",
      "6. Payment completes after ~25 seconds",
    ],
    note: "This is a demo simulation. No real money is charged. Real M-Pesa integration available on request.",
  })
}
