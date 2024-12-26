import * as schema from "./schema";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import { neon } from "@neondatabase/serverless";
import postgres from "postgres";
import { config } from "dotenv";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";

config({ path: ".env" });

// Define a type that can be either Neon or Postgres database
type DrizzleDatabase =
  | NeonHttpDatabase<typeof schema>
  | PostgresJsDatabase<typeof schema>;

// Check if we're using Neon/Vercel (production) or local Postgres
const isNeonConnection = process.env.POSTGRES_URL?.includes("neon.tech");

let db: DrizzleDatabase;
if (isNeonConnection) {
  // Production: Use Neon HTTP connection
  const sql = neon(process.env.POSTGRES_URL!);
  db = drizzleNeon(sql, { schema });
} else {
  // Local development: Use standard Postgres connection
  const client = postgres(process.env.POSTGRES_URL!);
  db = drizzlePostgres(client, { schema });
}

export { db };
