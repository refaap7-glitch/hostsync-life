import { ChannelAdapter, RemoteReservation } from "./ChannelAdapter";

const GUEST_NAMES = ["Julia Rossi", "Marco Dubois", "Elena Petrova", "Tom Wilson", "Carla Nunez"];

/** Same rationale as AirbnbAdapter — Booking.com's Connectivity API requires
 * partner onboarding, so this MVP mocks it behind the same interface. */
export class BookingAdapter implements ChannelAdapter {
  async syncReservations(propertyPlatformIds: string[]): Promise<RemoteReservation[]> {
    return propertyPlatformIds.flatMap((propertyPlatformId) => {
      const count = Math.floor(Math.random() * 2);
      return Array.from({ length: count }, () => {
        const checkIn = randomFutureDate(1, 20);
        const checkOut = addDays(checkIn, 2 + Math.floor(Math.random() * 5));
        return {
          platformReservationId: `booking_${propertyPlatformId}_${checkIn.getTime()}`,
          guestName: GUEST_NAMES[Math.floor(Math.random() * GUEST_NAMES.length)],
          guestPhone: randomPhone(),
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
          propertyPlatformId,
        };
      });
    });
  }

  async syncCalendar(_propertyPlatformId: string): Promise<{ blockedDates: string[] }> {
    return { blockedDates: [] };
  }
}

function randomFutureDate(minDays: number, maxDays: number): Date {
  const days = minDays + Math.floor(Math.random() * (maxDays - minDays));
  return addDays(new Date(), days);
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function randomPhone(): string {
  return `+341${Math.floor(10000000 + Math.random() * 89999999)}`;
}
