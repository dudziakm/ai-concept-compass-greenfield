/**
 * Generates real user database activity against the hosted Supabase project.
 *
 * Supabase pauses Free-plan projects that receive too little user database
 * activity over a rolling seven-day window, and an anonymous request to the
 * deployed Worker does not count: `supabase.auth.getUser()` short-circuits with
 * AuthSessionMissingError when the request carries no session cookie, so no
 * call ever reaches the project. Only a real sign-in plus authenticated reads
 * produce the traffic the pausing heuristic looks for.
 *
 * Run logs are public. Print step names and status codes, never URLs, tokens,
 * account addresses or row contents.
 */
import { setTimeout as sleep } from "node:timers/promises";

const REQUIRED_ENV = ["SUPABASE_URL", "SUPABASE_KEY", "E2E_USER_EMAIL", "E2E_USER_PASSWORD"];
const TABLES = ["concept_templates", "concepts", "review_attempts"];
const MAX_ATTEMPTS = 3;
const RETRY_BASE_MS = 2000;
const REQUEST_TIMEOUT_MS = 15_000;

function readEnvironment() {
  const missing = REQUIRED_ENV.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Keep-alive requires: ${missing.join(", ")}`);
  }
  return {
    url: process.env.SUPABASE_URL.replace(/\/+$/, ""),
    key: process.env.SUPABASE_KEY,
    email: process.env.E2E_USER_EMAIL,
    password: process.env.E2E_USER_PASSWORD,
  };
}

/**
 * Performs one labelled request, retrying transport errors and non-2xx replies.
 *
 * @param {string} label Step name printed to the public run log.
 * @param {string} url Absolute request URL, never printed.
 * @param {RequestInit} init Fetch options.
 * @returns {Promise<Response>} The first successful response.
 */
async function request(label, url, init) {
  let lastFailure = "no attempt completed";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    let response = null;
    try {
      response = await fetch(url, { ...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
    } catch (error) {
      lastFailure = error instanceof Error ? error.message : String(error);
    }

    if (response) {
      console.log(`${label}: ${response.status}`);
      if (response.ok) {
        return response;
      }
      lastFailure = `status ${response.status}`;
    }

    if (attempt < MAX_ATTEMPTS) {
      await sleep(RETRY_BASE_MS * attempt);
    }
  }

  throw new Error(`${label} failed after ${MAX_ATTEMPTS} attempts: ${lastFailure}`);
}

async function signIn({ url, key, email, password }) {
  const response = await request("auth.signin", `${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const { access_token: accessToken } = await response.json();
  if (!accessToken) {
    throw new Error("auth.signin succeeded but returned no access token");
  }
  return accessToken;
}

async function main() {
  const config = readEnvironment();
  const accessToken = await signIn(config);
  const authorized = { apikey: config.key, Authorization: `Bearer ${accessToken}` };

  for (const table of TABLES) {
    await request(`rest.${table}`, `${config.url}/rest/v1/${table}?select=id&limit=1`, {
      headers: authorized,
    });
  }

  // scope=local revokes only this session. The default global scope would kill
  // every refresh token for the shared account, including the storageState of a
  // hosted E2E run that happens to overlap.
  await request("auth.signout", `${config.url}/auth/v1/logout?scope=local`, {
    method: "POST",
    headers: authorized,
  });

  console.log(`Hosted activity generated: sign-in, ${TABLES.length} table reads, sign-out.`);
}

try {
  await main();
} catch (error) {
  console.error(`Keep-alive failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
