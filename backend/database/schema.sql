CREATE TABLE roles(
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL
);


CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id INT REFERENCES roles(id)
);


CREATE TABLE vehicles(
    id SERIAL PRIMARY KEY,
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    vehicle_name VARCHAR(100),
    vehicle_type VARCHAR(50),
    max_load_capacity DECIMAL,
    odometer INT,
    acquisition_cost DECIMAL,
    status VARCHAR(20) DEFAULT 'Available'
);


CREATE TABLE drivers(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    license_number VARCHAR(100) UNIQUE,
    license_category VARCHAR(50),
    license_expiry_date DATE,
    contact_number VARCHAR(20),
    safety_score INT,
    status VARCHAR(20) DEFAULT 'Available'
);


CREATE TABLE trips(
    id SERIAL PRIMARY KEY,
    source VARCHAR(100),
    destination VARCHAR(100),
    vehicle_id INT REFERENCES vehicles(id),
    driver_id INT REFERENCES drivers(id),
    cargo_weight DECIMAL,
    planned_distance DECIMAL,
    status VARCHAR(20) DEFAULT 'Draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE maintenance_logs(
    id SERIAL PRIMARY KEY,
    vehicle_id INT REFERENCES vehicles(id),
    maintenance_type VARCHAR(100),
    description TEXT,
    cost DECIMAL,
    start_date DATE,
    end_date DATE,
    status VARCHAR(20)
);


CREATE TABLE fuel_logs(
    id SERIAL PRIMARY KEY,
    vehicle_id INT REFERENCES vehicles(id),
    liters DECIMAL,
    cost DECIMAL,
    date DATE,
    distance DECIMAL
);


CREATE TABLE expenses(
    id SERIAL PRIMARY KEY,
    vehicle_id INT REFERENCES vehicles(id),
    expense_type VARCHAR(100),
    amount DECIMAL,
    date DATE,
    description TEXT
);