import { PaymentAdapter, PaymentLink } from "./PaymentAdapter";

const store = new Map<string, PaymentLink>();

/** Simulates MercadoPago without any credentials — good enough for demoing the MVP. */
export class MockPaymentAdapter implements PaymentAdapter {
  async createPaymentLink(_params: { amount: number; currency: string; description: string }): Promise<PaymentLink> {
    const id = `mock_${Date.now()}_${Math.round(Math.random() * 1e6)}`;
    const link: PaymentLink = {
      id,
      url: `https://mock-payments.local/pay/${id}`,
      status: "pending",
    };
    store.set(id, link);
    return link;
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentLink["status"]> {
    return store.get(paymentId)?.status ?? "pending";
  }
}
