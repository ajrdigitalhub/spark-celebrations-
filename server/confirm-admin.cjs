const { Client } = require('pg');

const DATABASE_URL = "postgresql://postgres.jzicqmbmjerglnznjwod:ajrdigitalhub%24@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres";

async function confirmAdmin() {
  const client = new Client({
    connectionString: DATABASE_URL,
  });

  try {
    await client.connect();
    
    // Auto confirm the admin user
    const res = await client.query(`
      UPDATE auth.users
      SET email_confirmed_at = now()
      WHERE email = 'admin@sparkcelebrations.com'
    `);

    console.log('User confirmed successfully. Rows updated:', res.rowCount);
  } catch (err) {
    console.error('Error executing query', err.stack);
  } finally {
    await client.end();
  }
}

confirmAdmin();
