import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "path";

// Use local sqlite file (already present as local.db)
const sqlite = new Database(path.join(process.cwd(), "local.db"));
export const db = drizzle(sqlite);

export type DB = typeof db;


