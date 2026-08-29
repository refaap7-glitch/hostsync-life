import { PaymentAdapter, PaymentLink } from "./PaymentAdapter";
import { env } from "../../lib/env";

/**
 * Real MercadoPago implementation. Only instantiated when
 * USE_REAL_PAYMENTS=true and MERCADOPAGO_ACCESS_TOKEN is set — see
 * adapters/index.ts. Uses the REST API directly to avoid a hard dependency
 * on the mercadopago SDK for an MVP that ships with mocks by default.
 */
export class MercadoPagoAdapter implements PaymentAdapter {
  private readonly baseUrl = "https://api.mercadopago.com";

  async createPaymentLink(params: { amount: number; currency: string; description: string }): Promise<PaymentLink> {
    const res = await fetch(`${this.baseUrl}/checkout/preferences`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.mercadopagoAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [
          {
            title: params.description,
            quantity: 1,
            currency_id: params.currency,
            unit_price: params.amount,
          },
        ],
      }),
    });
    if (!res.ok) {
      throw new Error(`MercadoPago createPaymentLink failed: ${res.status} ${await res.text()}`);
    }
    const data = (await res.json()) as { id: string; init_point: string };
    return { id: data.id, url: data.init_point, status: "pending" };
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentLink["status"]> {
    const res = await fetch(`${this.baseUrl}/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${env.mercadopagoAccessToken}` },
    });
    if (!res.ok) {
      throw new Error(`MercadoPago getPaymentStatus failed: ${res.status} ${await res.text()}`);
    }
    const data = (await res.json()) as { status: string };
    if (data.status === "approved") return "approved";
    if (data.status === "rejected") return "rejected";
    return "pending";
  }
}
