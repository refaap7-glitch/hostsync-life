import { env } from "../lib/env";
import { PaymentAdapter } from "./payment/PaymentAdapter";
import { MockPaymentAdapter } from "./payment/MockPaymentAdapter";
import { MercadoPagoAdapter } from "./payment/MercadoPagoAdapter";
import { MessagingAdapter } from "./messaging/MessagingAdapter";
import { MockMessagingAdapter } from "./messaging/MockMessagingAdapter";
import { WhatsAppAdapter } from "./messaging/WhatsAppAdapter";
import { ChannelAdapter } from "./channel/ChannelAdapter";
import { AirbnbAdapter } from "./channel/AirbnbAdapter";
import { BookingAdapter } from "./channel/BookingAdapter";
import { TaskNotificationAdapter } from "./taskNotification/TaskNotificationAdapter";
import { WhatsAppTaskNotifier } from "./taskNotification/WhatsAppTaskNotifier";

/**
 * Single place that decides mock vs. real for every external integration.
 * Flip USE_REAL_WHATSAPP / USE_REAL_PAYMENTS in .env once real credentials
 * exist — nothing else in the codebase needs to change.
 */
export const messagingAdapter: MessagingAdapter = env.useRealWhatsapp
  ? new WhatsAppAdapter()
  : new MockMessagingAdapter();

export const paymentAdapter: PaymentAdapter = env.useRealPayments
  ? new MercadoPagoAdapter()
  : new MockPaymentAdapter();

export const channelAdapters: Record<"airbnb" | "booking", ChannelAdapter> = {
  airbnb: new AirbnbAdapter(),
  booking: new BookingAdapter(),
};

export const taskNotificationAdapter: TaskNotificationAdapter = new WhatsAppTaskNotifier(messagingAdapter);
