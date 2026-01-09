/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable("users", {
    id: {
      type: "uuid",
      notNull: true,
      unique: true,
      default: pgm.func("gen_random_uuid()"),
    },
    /**
     * For reference, Github limits usernames to 39 characters:
     *
     * @see https://security.stackexchange.com/questions/39849/does-bcrypt-have-a-maximum-password-length/39851#39851
     */
    username: {
      type: "varchar(39)",
      notNull: true,
      unique: true,
    },
    /**
     * For reference
     *
     * @see https://stackoverflow.com/questions/1199190/what-is-the-optimal-length-for-an-email-address-in-a-database/1199238#1199238
     */
    email: {
      type: "varchar(254)",
      notNull: true,
      unique: true,
    },
    /**
     * For reference
     *
     * @see https://www.npmjs.com/package/bcrypt#hash-info
     */
    password: {
      type: "varchar(60)",
      notNull: true,
    },
    /**
     * For reference
     *
     * @see https://justatheory.com/2012/04/postgres-use-timestamptz/
     */
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('utc', now())"),
    },
    /**
     * For reference
     *
     * @see https://justatheory.com/2012/04/postgres-use-timestamptz/
     */
    updated_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('utc', now())"),
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = false;
