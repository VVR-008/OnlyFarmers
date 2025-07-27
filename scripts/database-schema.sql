-- OnlyFarmers Database Schema
-- This script creates the complete database structure for the agricultural marketplace

-- Users table for authentication and profile management
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('farmer', 'buyer', 'admin')),
    phone VARCHAR(20),
    location TEXT,
    avatar_url TEXT,
    verified BOOLEAN DEFAULT FALSE,
    kyc_status VARCHAR(20) DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Land listings table
CREATE TABLE land_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    area_acres DECIMAL(10,2) NOT NULL,
    price_per_acre DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(15,2) NOT NULL,
    location TEXT NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    soil_type VARCHAR(100),
    water_source VARCHAR(100),
    irrigation_type VARCHAR(100),
    land_type VARCHAR(50) CHECK (land_type IN ('agricultural', 'residential', 'commercial', 'industrial')),
    ownership_type VARCHAR(50) CHECK (ownership_type IN ('freehold', 'leasehold')),
    images TEXT[], -- Array of image URLs
    documents TEXT[], -- Array of document URLs
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'sold', 'inactive')),
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crop listings table
CREATE TABLE crop_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    crop_type VARCHAR(100) NOT NULL,
    variety VARCHAR
    variety VARCHAR(100),
    quantity_available DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL CHECK (unit IN ('quintal', 'kg', 'ton', 'bag')),
    price_per_unit DECIMAL(10,2) NOT NULL,
    harvest_date DATE,
    expiry_date DATE,
    quality_grade VARCHAR(20) CHECK (quality_grade IN ('A', 'B', 'C', 'premium')),
    organic_certified BOOLEAN DEFAULT FALSE,
    location TEXT NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    images TEXT[], -- Array of image URLs
    certifications TEXT[], -- Array of certification URLs
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved', 'expired')),
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table for order management
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    farmer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    listing_id UUID, -- Can reference either land_listings or crop_listings
    listing_type VARCHAR(20) NOT NULL CHECK (listing_type IN ('land', 'crop')),
    quantity DECIMAL(10,2),
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    delivery_status VARCHAR(20) DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    payment_method VARCHAR(50),
    payment_id VARCHAR(255), -- External payment gateway ID
    escrow_status VARCHAR(20) DEFAULT 'pending' CHECK (escrow_status IN ('pending', 'held', 'released', 'disputed')),
    delivery_address TEXT,
    delivery_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics table for tracking user behavior and platform metrics
CREATE TABLE analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table for user communications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('order', 'payment', 'listing', 'system', 'promotion')),
    read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Farm diary entries for digital record keeping
CREATE TABLE farm_diary_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    entry_date DATE NOT NULL,
    activity_type VARCHAR(50) CHECK (activity_type IN ('planting', 'watering', 'fertilizing', 'harvesting', 'pest_control', 'other')),
    crop_type VARCHAR(100),
    weather_conditions TEXT,
    images TEXT[],
    expenses DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews and ratings table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wishlist table for buyers
CREATE TABLE wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL,
    listing_type VARCHAR(20) NOT NULL CHECK (listing_type IN ('land', 'crop')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table for communication between users
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    thread_id UUID, -- For grouping related messages
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_land_listings_farmer_id ON land_listings(farmer_id);
CREATE INDEX idx_land_listings_status ON land_listings(status);
CREATE INDEX idx_land_listings_location ON land_listings USING gin(to_tsvector('english', location));
CREATE INDEX idx_crop_listings_farmer_id ON crop_listings(farmer_id);
CREATE INDEX idx_crop_listings_status ON crop_listings(status);
CREATE INDEX idx_crop_listings_crop_type ON crop_listings(crop_type);
CREATE INDEX idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX idx_transactions_farmer_id ON transactions(farmer_id);
CREATE INDEX idx_transactions_status ON transactions(payment_status, delivery_status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_farm_diary_farmer_id ON farm_diary_entries(farmer_id);
CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX idx_messages_sender_receiver ON messages(sender_id, receiver_id);

-- Insert sample data
INSERT INTO users (name, email, password_hash, role, phone, location, verified) VALUES
('Rajesh Kumar', 'farmer@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'farmer', '+91-9876543210', 'Punjab, India', true),
('Priya Patel', 'buyer@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'buyer', '+91-9876543211', 'Mumbai, India', true),
('Suresh Singh', 'farmer2@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'farmer', '+91-9876543212', 'Haryana, India', true);
