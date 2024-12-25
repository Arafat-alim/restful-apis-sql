require("dotenv").config();

module.exports = {
  development: {
    client: "pg",
    connection: {
      host: process.env.POSTGRES_DB_HOST,
      user: process.env.POSTGRES_DB_USERNAME,
      password: process.env.POSTGRES_DB_PASSWORD,
      database: process.env.POSTGRES_DB_NAME,
      port: process.env.POSTGRES_DB_PORT,
      ssl: {
        rejectUnauthorized: false,
      },
    },
    migrations: {
      directory: "./src/migrations",
    },
    seeds: {
      directory: "./seeds",
    },
    useNullAsDefault: true,
  },

  production: {
    client: "pg", // Replace with your production database client
    connection: {
      host: process.env.PRODUCTION_DB_HOST,
      user: process.env.PRODUCTION_DB_USERNAME,
      password: process.env.PRODUCTION_DB_PASSWORD,
      database: process.env.PRODUCTION_DB_NAME,
      port: process.env.PRODUCTION_DB_PORT,
      ssl: {
        rejectUnauthorized: false, // Adjust based on your certificate setup
      },
    },
    migrations: {
      directory: "./src/migrations",
    },
    seeds: {
      directory: "./src/seeds",
    },
  },
};
