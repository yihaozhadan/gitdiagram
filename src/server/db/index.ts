import * as schema from "./schema";
import { drizzle } from "drizzle-orm/neon-http";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import { neon } from "@neondatabase/serverless";
import postgres from "postgres";
import { config } from "dotenv";

config({ path: ".env" });

// Check if we're using Neon/Vercel (production) or local Postgres
const isNeonConnection = process.env.POSTGRES_URL?.includes("neon.tech");

let db;
if (isNeonConnection) {
  // Production: Use Neon HTTP connection
  const sql = neon(process.env.POSTGRES_URL!);
  db = drizzle(sql, { schema });
} else {
  // Local development: Use standard Postgres connection
  const client = postgres(process.env.POSTGRES_URL!);
  db = drizzlePostgres(client, { schema });
}

export { db };
