export type Platform = "airbnb" | "booking";
export type ReservationStatus = "confirmed" | "cancelled" | "completed";
export type TaskType = "cleaning" | "maintenance";
export type TaskStatus = "pending" | "in_progress" | "completed";
export type MessageTemplate = "checkin" | "checkout" | "reminder";
export type MessageStatus = "sent" | "failed";

export interface Property {
  id: string;
  userId: string;
  name: string;
  address: string;
  platform: Platform;
  platformId: string | null;
  maxGuests: number;
  basePrice: string;
  createdAt: string;
}

export interface Message {
  id: string;
  reservationId: string;
  template: MessageTemplate;
  sentAt: string;
  status: MessageStatus;
}

export interface Reservation {
  id: string;
  propertyId: string;
  guestName: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  status: ReservationStatus;
  platform: Platform;
  platformReservationId: string;
  createdAt: string;
  property?: Property;
  messages?: Message[];
}

export interface Provider {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email: string | null;
  isActive: boolean;
}

export interface Task {
  id: string;
  reservationId: string | null;
  providerId: string | null;
  type: TaskType;
  status: TaskStatus;
  scheduledDate: string;
  notes: string | null;
  photoUrl: string | null;
  accessToken: string;
  createdAt: string;
  reservation?: Reservation | null;
  provider?: Provider | null;
}

export interface PriceSuggestion {
  id: string;
  propertyId: string;
  suggestedPrice: string;
  currentPrice: string;
  reason: string;
  createdAt: string;
  acceptedAt: string | null;
  property?: Property;
}

export interface OccupancyPoint {
  month: string;
  occupancy: number;
}

export interface DashboardData {
  upcomingReservations: Reservation[];
  pendingTasks: Task[];
  occupancyThisMonth: number;
  occupancyTrend: OccupancyPoint[];
}
