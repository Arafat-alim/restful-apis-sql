/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("users", (table) => {
    table.increments("id").primary();
    table.string("email", 50).notNullable().unique();
    table.string("name", 50).notNullable();
    table.string("password", 20).notNullable();
    table.boolean("verified").defaultTo(false);
    table.string("verificationCode", 10);
    table.string("verificationCodeValidation", 50);
    table.string("forgotPasswordCode", 10);
    table.string("forgotPasswordCodeValidation", 50);
    table.boolean("deletedUser").defaultTo(false);
    table.timestamps(true, true); // Adds created_at and updated_at columns
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("users");
};
