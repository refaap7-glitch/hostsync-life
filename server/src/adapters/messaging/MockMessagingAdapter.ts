import { MessagingAdapter, SendMessageResult } from "./MessagingAdapter";

/** Simulates WhatsApp delivery: logs the message and "succeeds" ~95% of the time. */
export class MockMessagingAdapter implements MessagingAdapter {
  async sendMessage(to: string, body: string): Promise<SendMessageResult> {
    // eslint-disable-next-line no-console
    console.log(`[mock-whatsapp] -> ${to}: ${body}`);
    const ok = Math.random() > 0.05;
    return ok
      ? { status: "sent", providerMessageId: `mock_${Date.now()}` }
      : { status: "failed", error: "Simulated delivery failure" };
  }

  async sendTemplate(to: string, templateName: string, variables: Record<string, string>): Promise<SendMessageResult> {
    const body = renderTemplate(templateName, variables);
    return this.sendMessage(to, body);
  }
}

const TEMPLATES: Record<string, string> = {
  checkin:
    "Hola {{guest_name}}! Tu check-in en {{property_name}} es el {{check_in}}. Cualquier consulta, escribinos por acá.",
  checkout:
    "Hola {{guest_name}}, gracias por tu estadía en {{property_name}}. El check-out es el {{check_out}}. Esperamos que la hayas pasado genial!",
  reminder: "Hola {{guest_name}}, te recordamos tu reserva en {{property_name}} para el {{check_in}}.",
};

function renderTemplate(name: string, vars: Record<string, string>): string {
  const template = TEMPLATES[name] ?? name;
  return template.replace(/{{\s*(\w+)\s*}}/g, (_, key) => vars[key] ?? "");
}
