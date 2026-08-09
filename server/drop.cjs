const postgres = require('postgres');
const sql = postgres('postgresql://postgres.jzicqmbmjerglnznjwod:ajrdigitalhub%24@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres');
sql`ALTER TABLE services DROP COLUMN IF EXISTS available_venues`.then(() => {
  console.log('dropped');
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
