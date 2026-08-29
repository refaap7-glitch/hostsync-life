import { ChannelAdapter, RemoteReservation } from "./ChannelAdapter";

const GUEST_NAMES = ["Sofia Martinez", "Liam Chen", "Ana Torres", "Noah Silva", "Mia Fernandez"];

/**
 * Airbnb has no public per-host reservation API, so per the spec this is a
 * mock that generates plausible reservations. Swappable for a real
 * integration (Airbnb's partner API) behind the same ChannelAdapter interface.
 */
export class AirbnbAdapter implements ChannelAdapter {
  async syncReservations(propertyPlatformIds: string[]): Promise<RemoteReservation[]> {
    return propertyPlatformIds.flatMap((propertyPlatformId) => {
      const count = 1 + Math.floor(Math.random() * 2);
      return Array.from({ length: count }, () => {
        const checkIn = randomFutureDate(1, 20);
        const checkOut = addDays(checkIn, 2 + Math.floor(Math.random() * 5));
        return {
          platformReservationId: `airbnb_${propertyPlatformId}_${checkIn.getTime()}`,
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
  return `+549${Math.floor(1000000000 + Math.random() * 8999999999)}`.slice(0, 13);
}
