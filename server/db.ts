import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema.js";

neonConfig.webSocketConstructor = ws;

// Only initialize when DATABASE_URL is available (db-storage.ts imports this)
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.warn("DATABASE_URL not set - database features unavailable, using in-memory storage");
}

export const pool = connectionString ? new Pool({ connectionString }) : null!;
export const db = connectionString ? drizzle({ client: pool, schema }) : null!;
