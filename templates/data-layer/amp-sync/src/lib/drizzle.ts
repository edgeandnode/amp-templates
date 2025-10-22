import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Drizzle ORM configuration
 * This connects to the PostgreSQL database that Ampsync writes to
 */

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/{{projectName}}";

// Create postgres connection
const client = postgres(connectionString);

// Create Drizzle instance
export const db = drizzle(client, { schema });

// Export schema for type inference
export { schema };
