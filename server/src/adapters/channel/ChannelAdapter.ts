export interface RemoteReservation {
  platformReservationId: string;
  guestName: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  propertyPlatformId: string;
}

export interface ChannelAdapter {
  syncReservations(propertyPlatformIds: string[]): Promise<RemoteReservation[]>;
  syncCalendar(propertyPlatformId: string): Promise<{ blockedDates: string[] }>;
}
