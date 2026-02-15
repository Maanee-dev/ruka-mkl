
-- Ruka Maldives - Complete Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Admins Table (Role-based access)
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'staff', -- 'super_admin', 'staff', 'content_editor'
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Rooms (4 room types, max 12 inventory)
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_type VARCHAR(50) NOT NULL, -- 'standard_queen', 'deluxe_double', 'premium', 'family_suite'
    room_number VARCHAR(10) UNIQUE,
    floor INTEGER CHECK (floor BETWEEN 1 AND 3),
    size_sqm DECIMAL(4,1),
    max_adults INTEGER DEFAULT 2,
    max_children INTEGER DEFAULT 1,
    bed_configuration JSONB,
    has_balcony BOOLEAN DEFAULT false,
    base_price_usd DECIMAL(8,2),
    amenities JSONB,
    images JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Seasonal Rates
CREATE TABLE seasonal_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_type VARCHAR(50) NOT NULL,
    date_from DATE NOT NULL,
    date_to DATE NOT NULL,
    rate_multiplier DECIMAL(3,2) DEFAULT 1.00,
    flat_rate DECIMAL(8,2),
    min_nights INTEGER DEFAULT 1,
    created_by UUID REFERENCES admins(id)
);

-- Guests
CREATE TABLE guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    country VARCHAR(100),
    passport_number VARCHAR(50),
    date_of_birth DATE,
    preferences JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Promo Codes
CREATE TABLE promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    discount_type VARCHAR(10), -- 'percentage', 'fixed'
    discount_value DECIMAL(8,2),
    valid_from DATE,
    valid_to DATE,
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- Bookings
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_reference VARCHAR(20) UNIQUE NOT NULL,
    room_id UUID REFERENCES rooms(id),
    guest_id UUID REFERENCES guests(id),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    nights INTEGER GENERATED ALWAYS AS (check_out - check_in) STORED,
    adults INTEGER DEFAULT 2,
    children INTEGER DEFAULT 0,
    infants INTEGER DEFAULT 0,
    meal_plan VARCHAR(20) DEFAULT 'breakfast_included',
    transfer_type VARCHAR(20),
    total_room_cost DECIMAL(10,2),
    total_meal_cost DECIMAL(10,2),
    total_transfer_cost DECIMAL(10,2),
    total_excursions DECIMAL(10,2),
    green_tax_total DECIMAL(10,2),
    promo_code_id UUID REFERENCES promo_codes(id),
    discount_amount DECIMAL(10,2) DEFAULT 0,
    grand_total DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'pending', -- 'confirmed', 'cancelled', 'checked_in', 'checked_out'
    payment_status VARCHAR(20) DEFAULT 'pending',
    stripe_payment_intent_id VARCHAR(255),
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Booking Items (Excursions)
CREATE TABLE booking_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    item_type VARCHAR(50), -- 'excursion', 'addon'
    item_name VARCHAR(100),
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(8,2),
    total_price DECIMAL(10,2)
);

-- CMS Content
CREATE TABLE content_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_key VARCHAR(50) UNIQUE NOT NULL,
    section_name VARCHAR(100),
    content JSONB,
    last_edited_by UUID REFERENCES admins(id),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Seed Initial Data
INSERT INTO rooms (room_type, room_number, floor, size_sqm, base_price_usd) VALUES 
('standard_queen', '101', 1, 10.2, 88.00),
('deluxe_double', '201', 2, 12.1, 95.00),
('premium', '202', 2, 13.0, 110.00),
('family_suite', '301', 3, 14.4, 135.00);

-- Indexes for performance
CREATE INDEX idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_seasonal_rates_dates ON seasonal_rates(date_from, date_to);
CREATE INDEX idx_rooms_type ON rooms(room_type);
