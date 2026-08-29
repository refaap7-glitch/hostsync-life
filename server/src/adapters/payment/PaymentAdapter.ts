export interface PaymentLink {
  id: string;
  url: string;
  status: "pending" | "approved" | "rejected";
}

export interface PaymentAdapter {
  createPaymentLink(params: { amount: number; currency: string; description: string }): Promise<PaymentLink>;
  getPaymentStatus(paymentId: string): Promise<PaymentLink["status"]>;
}
