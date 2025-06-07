// M-Pesa configuration file - Updated with new Daraja credentials
export const MPESA_CONFIG = {
  // NEW DARAJA CREDENTIALS - FoodOrderingApp
  consumerKey: "9LeVWEtqHAXI4KZ69Sud11hIrrGudyjGrBWmSAP6Y3aLHYv5", // Replace with your full key
  consumerSecret: "sfAviHwYRD8rDDpYnRO5sZZxcp1BDAn3Vg3tKNkeMgkKtaANSBa3JOVI7R8zEN2", // Replace with your full secret
  businessShortCode: "174379", // Default sandbox shortcode
  passkey: "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919", // Default sandbox passkey

  // Environment settings
  environment: "sandbox", // "sandbox" or "production"
  enableFallback: false, // Disable fallback to force real API usage

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
    },
  },

  // Callback URL - your ngrok URL
  callbackUrl: "https://be54-197-248-134-121.ngrok-free.app/api/mpesa/callback",
}

// Helper function to get the correct endpoint based on environment
export function getEndpoint(name: "auth" | "stkPush" | "stkQuery"): string {
  const env = MPESA_CONFIG.environment === "production" ? "production" : "sandbox"
  return MPESA_CONFIG.endpoints[env][name]
}
