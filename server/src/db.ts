// db.js
import postgres from "postgres";

// const connectionString = process.env.DATABASE_URL!;
const connectionString =
  "postgresql://postgres.udtsoseizguuxxylpzuw:bb6Mwu9BbWUHR59G@aws-0-us-west-1.pooler.supabase.com:6543/postgres";
console.log(connectionString);
const sql = postgres(connectionString, {
  ssl: "require",
  //   prepare: false,
});

export default sql;
