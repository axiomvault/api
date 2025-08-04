// db.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load .env file if it exists
dotenv.config();

export const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '', // Blank password fallback
    database: process.env.DB_NAME || 'investment_platform',
    waitForConnections: true,
    connectionLimit: 10,
});