-- Create databases for microservices
CREATE DATABASE auth_db;
CREATE DATABASE adherent_db;
CREATE DATABASE reservation_db;
CREATE DATABASE cours_db;

-- Connect to auth_db and create tables
\c auth_db;

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Connect to adherent_db and create tables
\c adherent_db;

CREATE TABLE IF NOT EXISTS adherents (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    date_of_birth DATE,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id BIGSERIAL PRIMARY KEY,
    adherent_id BIGINT REFERENCES adherents(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Connect to reservation_db and create tables
\c reservation_db;

CREATE TABLE IF NOT EXISTS sports (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    max_participants INTEGER,
    duration_minutes INTEGER,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reservations (
    id BIGSERIAL PRIMARY KEY,
    adherent_id BIGINT NOT NULL,
    sport_id BIGINT REFERENCES sports(id) ON DELETE CASCADE,
    reservation_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'CONFIRMED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS waiting_list (
    id BIGSERIAL PRIMARY KEY,
    adherent_id BIGINT NOT NULL,
    sport_id BIGINT REFERENCES sports(id) ON DELETE CASCADE,
    reservation_date DATE NOT NULL,
    start_time TIME NOT NULL,
    position INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'WAITING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample sports data
INSERT INTO sports (name, description, max_participants, duration_minutes, active) VALUES
    ('Football', 'Sport d''équipe avec ballon rond', 22, 90, true),
    ('Basketball', 'Sport d''équipe avec panier', 10, 60, true),
    ('Tennis', 'Sport de raquette', 4, 90, true),
    ('Natation', 'Sport aquatique', 20, 60, true),
    ('Volleyball', 'Sport d''équipe avec filet', 12, 60, true)
ON CONFLICT (name) DO NOTHING;
