export async function up(knex) {
  await knex.schema.createTable('admins', (table) => {
    table.increments('id').primary();
    table.string('username', 50).notNullable().unique();
    table.text('password_hash').notNullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('password_changed_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('admin_tokens', (table) => {
    table.increments('id').primary();
    table.integer('admin_id').notNullable().references('id').inTable('admins').onDelete('CASCADE');
    table.specificType('token_hash', 'char(64)').notNullable().unique();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('expires_at', { useTz: true }).notNullable();
    table.index(['admin_id']);
    table.index(['expires_at']);
  });

  await knex.schema.createTable('series', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable();
    table.double('min_value').notNullable();
    table.double('max_value').notNullable();
    table.specificType('color', 'char(7)').notNullable();
    table.string('icon', 50).nullable();
    table.string('unit', 20).nullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
  await knex.raw(`
    ALTER TABLE series
      ADD CONSTRAINT series_range_check CHECK (min_value < max_value),
      ADD CONSTRAINT series_color_check CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
      ADD CONSTRAINT series_name_check CHECK (length(trim(name)) > 0)
  `);

  await knex.schema.createTable('sensors', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable();
    table.integer('series_id').notNullable().references('id').inTable('series').onDelete('CASCADE');
    table.specificType('api_key_hash', 'char(64)').notNullable().unique();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('last_measurement_at', { useTz: true }).nullable();
    table.timestamp('revoked_at', { useTz: true }).nullable();
    table.index(['series_id']);
  });

  await knex.schema.createTable('measurements', (table) => {
    table.bigIncrements('id').primary();
    table.integer('series_id').notNullable().references('id').inTable('series').onDelete('CASCADE');
    table.integer('sensor_id').nullable().references('id').inTable('sensors').onDelete('SET NULL');
    table.double('value').notNullable();
    table.timestamp('measured_at', { useTz: true }).notNullable();
    table.timestamp('received_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.index(['series_id', 'measured_at']);
    table.index(['measured_at']);
    table.index(['sensor_id']);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('measurements');
  await knex.schema.dropTableIfExists('sensors');
  await knex.schema.dropTableIfExists('series');
  await knex.schema.dropTableIfExists('admin_tokens');
  await knex.schema.dropTableIfExists('admins');
}
