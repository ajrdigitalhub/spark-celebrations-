import 'dotenv/config';
import { db } from './src/db/index.js';
import { siteSettings } from './src/db/schema.js';

async function test() {
  try {
    const result = await db.select().from(siteSettings);
    console.log('Result:', result);
  } catch (e) {
    console.error('Error:', e);
  }
  process.exit(0);
}
test();
