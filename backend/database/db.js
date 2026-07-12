const { Pool } = require("pg");
require("dotenv").config();


// PostgreSQL connection pool
const pool = new Pool({

    user: process.env.DB_USER,

    host: process.env.DB_HOST,

    database: process.env.DB_NAME,

    password: process.env.DB_PASSWORD,

    port: process.env.DB_PORT || 5432,

});


// Test database connection

pool.connect()
    .then(client => {

        console.log("✅ PostgreSQL Database Connected");

        client.release();

    })
    .catch(error => {

        console.error(
            "❌ PostgreSQL Connection Failed:",
            error.message
        );

    });



module.exports = pool;