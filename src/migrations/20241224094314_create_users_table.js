/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("users", (table) => {
    table.increments("id").primary(); // auto-incrementing integer, typically 4 bytes (depending on DB)
    table.string("name", 255).notNullable(); // VARCHAR(255)
    table.string("email", 255).nullable(); // VARCHAR(255)
    table.string("password", 128).nullable(); // VARCHAR(128) - Adjust as needed for your password hashing
    table.timestamps(true, true); // Adds `created_at` and `updated_at` timestamps, typically each is a timestamptz (with timezone)
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("users");
};
