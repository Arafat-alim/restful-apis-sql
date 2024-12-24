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
    },
    migrations: {
      directory: "./src/migrations",
    },
    useNullAsDefault: true,
  },
};
