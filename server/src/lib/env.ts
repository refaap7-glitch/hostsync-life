import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: required("JWT_SECRET"),
  internalApiKey: required("INTERNAL_API_KEY"),
  webOrigin: process.env.WEB_ORIGIN ?? "http://localhost:3000",

  useRealWhatsapp: process.env.USE_REAL_WHATSAPP === "true",
  useRealPayments: process.env.USE_REAL_PAYMENTS === "true",

  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID ?? "",
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN ?? "",
  twilioWhatsappFrom: process.env.TWILIO_WHATSAPP_FROM ?? "",

  mercadopagoAccessToken: process.env.MERCADOPAGO_ACCESS_TOKEN ?? "",

  uploadsDir: process.env.UPLOADS_DIR ?? "uploads",
  publicUploadsUrl: process.env.PUBLIC_UPLOADS_URL ?? "http://localhost:4000/uploads",
};
