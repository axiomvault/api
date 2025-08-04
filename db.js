// db.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load .env file if it exists
dotenv.config();

export const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'investment_platform',
    password: process.env.DB_PASS || 'investment_platforminvestment_platform', // Blank password fallback
    database: process.env.DB_NAME || 'investment_platform',
    waitForConnections: true,
    connectionLimit: 10,
});