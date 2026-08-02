import { db } from './src/db/index.ts';
import { sql } from 'drizzle-orm';

async function main() {
  await db.execute(sql`DROP TABLE flipbook CASCADE`);
  console.log("Dropped");
  process.exit(0);
}
main();
