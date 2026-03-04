import type { Config } from "drizzle-kit";
import { resolvePostgresUrl } from "./src/env.js";

export default {
  schema: "./src/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: resolvePostgresUrl(),
  },
} satisfies Config;
