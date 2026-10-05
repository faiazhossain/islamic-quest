import { readFile } from "node:fs/promises";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required (e.g. a Neon connection string).");
  process.exit(1);
}

const sql = postgres(url, { prepare: false });
const schema = await readFile("db/schema.sql", "utf8");
await sql.unsafe(schema);
console.log("Schema applied.");
await sql.end();
