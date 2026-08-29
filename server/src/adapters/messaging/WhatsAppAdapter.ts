import twilio from "twilio";
import { MessagingAdapter, SendMessageResult } from "./MessagingAdapter";
import { env } from "../../lib/env";

/** Real Twilio WhatsApp Business API implementation (sandbox-friendly). */
export class WhatsAppAdapter implements MessagingAdapter {
  private client = twilio(env.twilioAccountSid, env.twilioAuthToken);

  async sendMessage(to: string, body: string): Promise<SendMessageResult> {
    try {
      const message = await this.client.messages.create({
        from: env.twilioWhatsappFrom,
        to: `whatsapp:${to}`,
        body,
      });
      return { status: "sent", providerMessageId: message.sid };
    } catch (err) {
      return { status: "failed", error: err instanceof Error ? err.message : "Unknown Twilio error" };
    }
  }

  async sendTemplate(to: string, templateName: string, variables: Record<string, string>): Promise<SendMessageResult> {
    const body = Object.entries(variables).reduce(
      (acc, [key, value]) => acc.replace(new RegExp(`{{\\s*${key}\\s*}}`, "g"), value),
      templateName,
    );
    return this.sendMessage(to, body);
  }
}
