
export type RoomType = 'standard_queen' | 'deluxe_double' | 'premium' | 'family_suite';

export interface Room {
  id: string;
  type: RoomType;
  name: string;
  description: string;
  size: number;
  floor: number;
  maxAdults: number;
  maxChildren: number;
  basePrice: number;
  bedConfig: string;
  hasBalcony: boolean;
  amenities: string[];
  images: string[];
}

export interface Booking {
  id: string;
  reference: string;
  roomType: RoomType;
  checkIn: string;
  checkOut: string;
  guests: {
    adults: number;
    children: number;
    infants: number;
  };
  mealPlan: 'breakfast' | 'half_board' | 'full_board';
  transferType: 'none' | 'shared_speedboat' | 'private_speedboat';
  excursions: string[];
  promoCode?: string;
  totalCost: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'checked_in' | 'checked_out';
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

export interface SeasonalRate {
  id: string;
  name: string;
  startMonth: number; // 0-11
  endMonth: number;
  multiplier: number;
}

export interface PromoCode {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  validUntil: string;
}
