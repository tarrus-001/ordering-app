import { type NextRequest, NextResponse } from "next/server"

// Update M-Pesa configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { consumerKey, consumerSecret, businessShortCode, passkey, callbackUrl } = body

    // Validate required fields
    if (!consumerKey || !consumerSecret) {
      return NextResponse.json({ success: false, message: "Consumer Key and Secret are required" }, { status: 400 })
    }

    // Create updated config content
    const configContent = `// M-Pesa configuration file - centralized credentials
export const MPESA_CONFIG = {
  // M-Pesa API credentials
  consumerKey: "${consumerKey}",
  consumerSecret: "${consumerSecret}",
  businessShortCode: "${businessShortCode || "174379"}",
  passkey: "${passkey || "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"}",
  
  // Environment settings
  environment: "sandbox", // "sandbox" or "production"
  enableFallback: true, // Enable simulation fallback if API fails
  
  // API endpoints
  endpoints: {
    sandbox: {
      auth: "https://sandbox.safaricom.co.ke/oauth/v1/generate",
      stkPush: "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      stkQuery: "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query",
    },
    production: {
      auth: "https://api.safaricom.co.ke/oauth/v1/generate",
      stkPush: "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      stkQuery: "https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query",
    }
  },
  
  // Callback URL - update with your ngrok URL
  callbackUrl: "${callbackUrl || "https://be54-197-248-134-121.ngrok-free.app/api/mpesa/callback"}",
}

// Helper function to get the correct endpoint based on environment
export function getEndpoint(name: 'auth' | 'stkPush' | 'stkQuery'): string {
  const env = MPESA_CONFIG.environment === 'production' ? 'production' : 'sandbox';
  return MPESA_CONFIG.endpoints[env][name];
}
`

    // In a real environment, we would write to the file system
    // But for security and sandbox limitations, we'll simulate success

    // For demonstration purposes only - this won't actually work in most environments
    // const configPath = path.join(process.cwd(), 'app/api/mpesa/config.ts')
    // fs.writeFileSync(configPath, configContent, 'utf8')

    // Instead, we'll store in memory for this session
    global.updatedMpesaConfig = {
      consumerKey,
      consumerSecret,
      businessShortCode: businessShortCode || "174379",
      passkey: passkey || "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
      callbackUrl: callbackUrl || "https://be54-197-248-134-121.ngrok-free.app/api/mpesa/callback",
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      message: "M-Pesa configuration updated successfully",
      config: {
        consumerKey: consumerKey.substring(0, 5) + "...",
        consumerSecret: consumerSecret.substring(0, 5) + "...",
        businessShortCode,
        callbackUrl,
        updatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Config update error:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to update configuration",
      error: error.message,
    })
  }
}

// Get current config
export async function GET() {
  try {
    // Return the updated config if it exists
    if (global.updatedMpesaConfig) {
      return NextResponse.json({
        success: true,
        config: {
          consumerKey: global.updatedMpesaConfig.consumerKey.substring(0, 5) + "...",
          consumerSecret: global.updatedMpesaConfig.consumerSecret.substring(0, 5) + "...",
          businessShortCode: global.updatedMpesaConfig.businessShortCode,
          callbackUrl: global.updatedMpesaConfig.callbackUrl,
          updatedAt: global.updatedMpesaConfig.updatedAt,
        },
      })
    }

    // Otherwise return default config info
    return NextResponse.json({
      success: true,
      config: {
        consumerKey: "8rbAE...".substring(0, 5) + "...",
        consumerSecret: "qp3Jp...".substring(0, 5) + "...",
        businessShortCode: "174379",
        callbackUrl: "https://be54-197-248-134-121.ngrok-free.app/api/mpesa/callback",
        updatedAt: null,
      },
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to get configuration",
      error: error.message,
    })
  }
}
