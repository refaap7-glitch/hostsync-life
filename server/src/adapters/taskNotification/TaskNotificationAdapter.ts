export interface TaskNotificationPayload {
  providerName: string;
  providerPhone: string;
  providerEmail?: string | null;
  taskType: string;
  propertyName: string;
  scheduledDate: string;
  completionLink: string;
}

export interface TaskNotificationAdapter {
  notifyProvider(payload: TaskNotificationPayload): Promise<{ status: "sent" | "failed" }>;
}
