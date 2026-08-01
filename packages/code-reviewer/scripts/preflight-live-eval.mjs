import { error, log } from "node:console";
import process from "node:process";

const optIn = process.env.PROMPTFOO_LIVE_OPT_IN;
const key = process.env.OPENROUTER_API_KEY;

if (optIn !== "1") {
  error("Refusing live eval: set PROMPTFOO_LIVE_OPT_IN=1 after approving the reviewer and judge budget.");
  process.exitCode = 1;
} else if (!key) {
  error("Refusing live eval: OPENROUTER_API_KEY is required and must be supplied outside the repository.");
  process.exitCode = 1;
} else {
  log("Live matrix preflight passed: three reviewer calls plus three explicit judge calls may now run.");
}
