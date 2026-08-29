import { MessagingAdapter } from "../messaging/MessagingAdapter";
import { TaskNotificationAdapter, TaskNotificationPayload } from "./TaskNotificationAdapter";

/** Notifies providers over WhatsApp, reusing whichever MessagingAdapter is active. */
export class WhatsAppTaskNotifier implements TaskNotificationAdapter {
  constructor(private readonly messaging: MessagingAdapter) {}

  async notifyProvider(payload: TaskNotificationPayload): Promise<{ status: "sent" | "failed" }> {
    const body =
      `Hola ${payload.providerName}! Se te asigno una tarea de ${payload.taskType} en ${payload.propertyName} ` +
      `para el ${payload.scheduledDate}. Marcala como completada aca: ${payload.completionLink}`;
    const result = await this.messaging.sendMessage(payload.providerPhone, body);
    return { status: result.status };
  }
}
