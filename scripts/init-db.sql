-- Database initialization script for CodeFlow development
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions that might be needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone to UTC
SET timezone = 'UTC';

-- Log initialization
SELECT 'CodeFlow development database initialized successfully' AS status;