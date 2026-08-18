import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
import 'dotenv/config';

const sql = postgres(process.env.DATABASE_URL!);

async function main() {
  try {
    console.log('Running database update...');
    await sql`UPDATE services SET available_venues = array_replace(available_venues, 'Jubly Theatre', 'Jubilee Theatre') WHERE 'Jubly Theatre' = ANY(available_venues)`;
    console.log('Database updated successfully! All packages linked to Jubly Theatre are now linked to Jubilee Theatre.');
  } catch (error) {
    console.error('Error updating database:', error);
  } finally {
    process.exit(0);
  }
}

main();
