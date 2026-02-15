
import { Room } from './types';

export const COLORS = {
  gold: '#C5A059',
  goldHover: '#B28E47',
  deepDark: '#1C1C1C',
  softBeige: '#FAF9F6',
  white: '#FFFFFF',
  text: '#1C1C1C',
  textLight: '#777777',
  sand: '#F5E6D3',
  coral: '#FF6B6B',
  turquoise: '#40E0D0',
};

export const ROOMS: Room[] = [
  {
    id: 'standard-queen',
    type: 'standard_queen',
    name: 'Standard Queen Rooms',
    description: 'A cozy sanctuary perfect for couples or solo travelers exploring the local island charm.',
    size: 10.2,
    floor: 1,
    maxAdults: 2,
    maxChildren: 1,
    basePrice: 88,
    bedConfig: '1 Queen Bed',
    hasBalcony: false,
    amenities: ['A/C', 'Refrigerator', 'TV', 'Private Bathroom', 'Tea/Coffee Maker', 'Free WiFi'],
    images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=800']
  },
  {
    id: 'deluxe-double',
    type: 'deluxe_double',
    name: 'Deluxe Double Rooms',
    description: 'Elegantly appointed room offering more space and comfort for a relaxing island stay.',
    size: 12.1,
    floor: 2,
    maxAdults: 2,
    maxChildren: 1,
    basePrice: 95,
    bedConfig: '1 Queen Bed',
    hasBalcony: false,
    amenities: ['A/C', 'Refrigerator', 'TV', 'Private Bathroom', 'Bidet', 'Desk', 'Blackout Curtains'],
    images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=800']
  },
  {
    id: 'premium-balcony',
    type: 'premium',
    name: 'Premium Suite Rooms',
    description: 'Features a private balcony with city views and versatile bedding options.',
    size: 13,
    floor: 2,
    maxAdults: 2,
    maxChildren: 2,
    basePrice: 110,
    bedConfig: '1 King Bed or 2 Small Doubles',
    hasBalcony: true,
    amenities: ['Private Balcony', 'City View', 'A/C', 'Refrigerator', 'TV', 'Premium Linens', 'Slippers'],
    images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=800']
  },
  {
    id: 'family-suite',
    type: 'family_suite',
    name: 'Family Suite Rooms',
    description: 'Spacious accommodation designed for families, offering maximum comfort and city views.',
    size: 14.4,
    floor: 3,
    maxAdults: 3,
    maxChildren: 2,
    basePrice: 135,
    bedConfig: '1 King + 1 Small Double or 3 Small Doubles',
    hasBalcony: true,
    amenities: ['Large Balcony', 'City View', 'A/C', 'Refrigerator', 'TV', 'Triple Bed Configuration', 'Work Desk'],
    images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800']
  }
];

export const EXCURSIONS = [
  { id: 'snorkeling', name: 'Snorkeling Trip', price: 45 },
  { id: 'fishing', name: 'Sunset Fishing', price: 55 },
  { id: 'picnic', name: 'Sandbank Picnic', price: 75 },
  { id: 'dolphin', name: 'Dolphin Watching', price: 65 }
];

export const GREEN_TAX_PER_NIGHT = 6;
