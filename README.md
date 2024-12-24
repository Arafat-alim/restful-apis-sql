# restful-apis-sql

### Migrations: [knexJs Official Docs](https://knexjs.org/guide/migrations.html#migration-cli)

Install Globally for easily access its command:

```bash
npm install knex -g
```

How to create a migration file using the knex cli. (Please note: install the knex in global for accessing the knex command).

```bash
knex migrate:make migration_name
```

Migrations file for creating the "users" table

```js
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
```

Once you have finished writing the migrations, you can update the database matching your `NODE_ENV` by running:

```bash
knex migrate:latest
```

```bash
$ knex migrate:latest --env production

# or

$ NODE_ENV=production knex migrate:latest
```

### How to rollback the last batch of migrations: using the knex cli

```bash
knex migrate:rollback
```

### To rollback all the completed migrations:

```bash
$ knex migrate:rollback --all
```

### To run the next migration that has not yet been run

```bash
$ knex migrate:up
```

### To run the specified migration that has not yet been run

```bash
$ knex migrate:up 001_migration_name.js
```

### To undo the last migration that was run

```bash
$ knex migrate:down
```

### To undo the specified migration that was run

```bash
$ knex migrate:down 001_migration_name.js
```

### To list both completed and pending migrations:

```bash
$ knex migrate:list
```
