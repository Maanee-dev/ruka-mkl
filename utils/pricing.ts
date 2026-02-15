
import { RoomType, SeasonalRate } from '../types';
import { ROOMS, GREEN_TAX_PER_NIGHT } from '../constants';

const SEASONAL_RATES: SeasonalRate[] = [
  { id: 'high', name: 'High Season', startMonth: 10, endMonth: 3, multiplier: 1.20 }, // Nov-Apr
  { id: 'low', name: 'Low Season', startMonth: 4, endMonth: 9, multiplier: 0.85 },  // May-Oct
  { id: 'peak', name: 'Peak Season', startMonth: 11, endMonth: 0, multiplier: 1.35 } // Dec-Jan
];

export const calculateBooking = (params: {
  roomType: RoomType;
  checkIn: Date;
  checkOut: Date;
  adults: number;
  children: number;
  infants: number;
  mealPlan: string;
  transferType: string;
  excursions: string[];
  promoDiscount?: { type: 'percentage' | 'fixed'; value: number };
}) => {
  const room = ROOMS.find(r => r.type === params.roomType)!;
  const diffTime = Math.abs(params.checkOut.getTime() - params.checkIn.getTime());
  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Base Room Rate with Seasonal Logic
  let totalRoomCost = 0;
  for (let i = 0; i < nights; i++) {
    const currentDate = new Date(params.checkIn);
    currentDate.setDate(currentDate.getDate() + i);
    const month = currentDate.getMonth();
    const day = currentDate.getDay();
    
    let multiplier = 1.0;
    
    // Check Seasons (Simplified logic: Peak > High > Low)
    if (month === 11 || month === 0) {
      multiplier = 1.35; // Peak
    } else if (month >= 10 || month <= 3) {
      multiplier = 1.20; // High
    } else {
      multiplier = 0.85; // Low
    }
    
    // Weekend logic (Fri/Sat)
    if (day === 5 || day === 6) {
      multiplier += 0.10;
    }
    
    totalRoomCost += room.basePrice * multiplier;
  }

  // Meal Plans
  let totalMealCost = 0;
  const totalPayableGuests = params.adults + params.children;
  if (params.mealPlan === 'half_board') totalMealCost = 25 * totalPayableGuests * nights;
  if (params.mealPlan === 'full_board') totalMealCost = 45 * totalPayableGuests * nights;

  // Transfers
  let totalTransferCost = 0;
  if (params.transferType === 'shared_speedboat') {
    totalTransferCost = 35 * (params.adults + params.children + params.infants) * 2; // Return
  } else if (params.transferType === 'private_speedboat') {
    totalTransferCost = 180 * 2; // Return group
  }

  // Excursions
  const excursionMap: Record<string, number> = {
    snorkeling: 45,
    fishing: 55,
    picnic: 75,
    dolphin: 65
  };
  const totalExcursionCost = params.excursions.reduce((acc, ex) => acc + (excursionMap[ex] || 0), 0) * totalPayableGuests;

  // Green Tax (Infants under 2 exempt)
  const greenTaxTotal = (params.adults + params.children) * GREEN_TAX_PER_NIGHT * nights;

  let subtotal = totalRoomCost + totalMealCost + totalTransferCost + totalExcursionCost + greenTaxTotal;
  
  // Discount
  let discountAmount = 0;
  if (params.promoDiscount) {
    if (params.promoDiscount.type === 'percentage') {
      discountAmount = (totalRoomCost) * (params.promoDiscount.value / 100);
    } else {
      discountAmount = params.promoDiscount.value;
    }
  }

  return {
    nights,
    totalRoomCost,
    totalMealCost,
    totalTransferCost,
    totalExcursionCost,
    greenTaxTotal,
    discountAmount,
    grandTotal: subtotal - discountAmount
  };
};
