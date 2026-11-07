require("dotenv").config();
const { Pool } = require("pg");

// Connection pool to PostgreSQL.
// A pool reuses connections so we don't open a new one for every request.
const pool = new Pool({
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// connectDB makes sure the target database exists and that we can talk to it.
const connectDB = async () => {
    // Connect to the default "postgres" database so we can create our target db if needed.
    const poolAdmin = new Pool({
        user: process.env.DB_USER,
        database: "postgres",
        host: process.env.DB_HOST,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    });

    try {
        // Check if our database already exists
        const result = await poolAdmin.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [process.env.DB_NAME]
        );

        // CREATE DATABASE cannot use parameters ($1), so we write the name directly.
        if (result.rowCount === 0) {
            await poolAdmin.query(`CREATE DATABASE "${process.env.DB_NAME}"`);
            console.log(`database "${process.env.DB_NAME}" created`);
        }

        // Make sure the real pool can connect
        await pool.query("SELECT 1");
        console.log("database is connected successfully!");
    } catch (error) {
        console.log("database is not connected", error);
    } finally {
        // We no longer need the admin pool
        await poolAdmin.end();
    }
};

module.exports = {
    connectDB,
    pool,
};
