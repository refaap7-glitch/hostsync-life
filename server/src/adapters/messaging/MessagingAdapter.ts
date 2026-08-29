export interface SendMessageResult {
  status: "sent" | "failed";
  providerMessageId?: string;
  error?: string;
}

export interface MessagingAdapter {
  sendMessage(to: string, body: string): Promise<SendMessageResult>;
  sendTemplate(to: string, templateName: string, variables: Record<string, string>): Promise<SendMessageResult>;
}
