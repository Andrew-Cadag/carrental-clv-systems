-- Car Rental CLV System Database Schema

CREATE DATABASE IF NOT EXISTS carrental_db;
USE carrental_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin','staff','customer') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cars table
CREATE TABLE IF NOT EXISTS cars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    plate_number VARCHAR(20) UNIQUE NOT NULL,
    status ENUM('available','rented') DEFAULT 'available',
    price_per_day DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    car_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    method VARCHAR(50),
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- CLV Scores table
CREATE TABLE IF NOT EXISTS clv_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    frequency INT NOT NULL,
    total_spent DECIMAL(10, 2) NOT NULL,
    recency_days INT NOT NULL,
    clv_rating ENUM('High','Medium','Low') NOT NULL,
    predicted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample users (passwords hashed with bcrypt)
INSERT INTO users (name, email, password, role) VALUES
('System Administrator', 'admin@driveease.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('Staff Member', 'staff@driveease.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'staff'),
('John Customer', 'john@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'customer'),
('Sarah Smith', 'sarah@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'customer'),
('Mike Johnson', 'mike@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'customer');

-- Insert sample cars
INSERT INTO cars (brand, model, year, plate_number, status, price_per_day) VALUES
('Toyota', 'Camry', 2023, 'ABC1234', 'available', 45.00),
('Honda', 'Civic', 2023, 'DEF5678', 'available', 35.00),
('BMW', 'X5', 2022, 'GHI9012', 'rented', 85.00),
('Mercedes', 'E-Class', 2023, 'JKL3456', 'available', 95.00),
('Ford', 'Mustang', 2023, 'MNO7890', 'available', 65.00);

-- Insert sample bookings
INSERT INTO bookings (customer_id, car_id, start_date, end_date, total_amount, status) VALUES
(3, 1, '2024-03-01', '2024-03-05', 180.00, 'completed'),
(3, 2, '2024-03-10', '2024-03-12', 70.00, 'active'),
(4, 3, '2024-03-15', '2024-03-20', 425.00, 'active'),
(4, 1, '2024-03-25', '2024-03-28', 135.00, 'pending'),
(5, 4, '2024-04-01', '2024-04-05', 380.00, 'pending'),
(3, 5, '2024-04-10', '2024-04-12', 130.00, 'cancelled');

-- Insert sample payments
INSERT INTO payments (booking_id, amount, method) VALUES
(1, 180.00, 'credit_card'),
(2, 70.00, 'debit_card'),
(3, 425.00, 'credit_card');

-- Insert sample CLV scores
INSERT INTO clv_scores (customer_id, frequency, total_spent, recency_days, clv_rating) VALUES
(3, 3, 380.00, 10, 'Medium'),
(4, 2, 560.00, 5, 'High'),
(5, 1, 380.00, 20, 'Low');
