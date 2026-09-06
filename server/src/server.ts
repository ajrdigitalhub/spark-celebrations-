import app from './index.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n🚀 Spark Celebrations API running at http://localhost:${PORT}`);
  console.log(`📦 Storage mode: ${process.env.STORAGE_MODE || 'local'}`);
  console.log(`🗄️  Database: Supabase PostgreSQL (via Drizzle ORM)\n`);
});
