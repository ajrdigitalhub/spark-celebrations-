const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres.jzicqmbmjerglnznjwod:ajrdigitalhub%24@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres' });
pool.query('SELECT id, title, "imageUrl" FROM services ORDER BY title ASC LIMIT 5').then(res => {
  console.log(JSON.stringify(res.rows, null, 2));
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
