const required = [
  "SUPABASE_URL",
  "SUPABASE_KEY",
  "RLS_USER_A_EMAIL",
  "RLS_USER_A_PASSWORD",
  "RLS_USER_B_EMAIL",
  "RLS_USER_B_PASSWORD",
];

const missing = required.filter((name) => !process.env[name]);
if (missing.length > 0) {
  console.error(`Hosted RLS test requires: ${missing.join(", ")}`);
  process.exitCode = 1;
} else {
  console.log("Hosted RLS configuration is present (values intentionally hidden). ");
}
