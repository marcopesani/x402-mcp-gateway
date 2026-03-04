import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const authMethodTypeEnum = pgEnum("auth_method_type", ["passkey", "wallet"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tokenHashUnique: uniqueIndex("sessions_token_hash_unique").on(table.tokenHash),
    userIdIdx: index("sessions_user_id_idx").on(table.userId),
  }),
);

export const authMethods = pgTable(
  "auth_methods",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: authMethodTypeEnum("type").notNull(),
    // Passkey: credential id, Wallet: caip-10 identifier
    externalId: text("external_id").notNull(),
    label: text("label").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    uniqueMethod: uniqueIndex("auth_methods_unique").on(
      table.userId,
      table.type,
      table.externalId,
    ),
    uniqueIdentity: uniqueIndex("auth_methods_identity_unique").on(
      table.type,
      table.externalId,
    ),
    userIdIdx: index("auth_methods_user_id_idx").on(table.userId),
  }),
);

export const passkeyCredentials = pgTable(
  "passkey_credentials",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authMethodId: uuid("auth_method_id")
      .notNull()
      .references(() => authMethods.id, { onDelete: "cascade" }),
    credentialId: text("credential_id").notNull(),
    publicKey: text("public_key").notNull(),
    counter: integer("counter").notNull().default(0),
    transports: text("transports"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    credentialIdUnique: uniqueIndex("passkey_credential_id_unique").on(table.credentialId),
  }),
);

export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    prefix: text("prefix").notNull(),
    secretHash: text("secret_hash").notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    prefixIdx: index("api_keys_prefix_idx").on(table.prefix),
    secretHashUnique: uniqueIndex("api_keys_secret_hash_unique").on(table.secretHash),
  }),
);

export const siwxNoncePurposeEnum = pgEnum("siwx_nonce_purpose", ["signin", "link"]);

export const siwxNonces = pgTable(
  "siwx_nonces",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    nonce: text("nonce").notNull(),
    address: text("address").notNull(),
    chainId: integer("chain_id").notNull(),
    purpose: siwxNoncePurposeEnum("purpose").notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    used: boolean("used").notNull().default(false),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    nonceUnique: uniqueIndex("siwx_nonces_nonce_unique").on(table.nonce),
    addressChainIdx: index("siwx_nonces_address_chain_idx").on(table.address, table.chainId),
  }),
);
