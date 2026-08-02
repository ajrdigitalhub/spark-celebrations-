import postgres from 'postgres';

const DATABASE_URL = "postgresql://postgres.jzicqmbmjerglnznjwod:ajrdigitalhub%24@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres";

async function confirmAdmin() {
  const sql = postgres(DATABASE_URL);

  try {
    const res = await sql`
      UPDATE auth.users
      SET email_confirmed_at = now()
      WHERE email = 'admin@sparkcelebrations.com'
    `;
    console.log('User confirmed successfully.');
  } catch (err) {
    console.error('Error executing query', err);
  } finally {
    await sql.end();
  }
}

confirmAdmin();
