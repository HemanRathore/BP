# Admin database setup (PostgreSQL)

The admin talks to PostgreSQL **only from Vercel server-side functions**. The browser never receives a database URL or database password. This project uses direct PostgreSQL queries and does not use the Supabase JavaScript SDK, Supabase Auth, or a Supabase service-role key.

## 0. Rotate the credential that was pasted into chat

Treat it as compromised. Reset the database password in Supabase before connecting this application. Do not put the old or replacement password in this repository, a commit, or chat. Keep it only in the hosting provider's encrypted environment-variable settings.

## 1. Create the schema and seed catalogue

The schema and least-privilege app role have been created in the connected Supabase project via migrations; five required tables were verified. The app role has no password yet. For another environment, run [`schema.sql`](schema.sql) once. It creates private tables for products and locations, admin sessions, login throttling, and anonymous page-view counts. On the first admin sign-in, the app copies the current 21 products and 5 locations from the static defaults into the database. The schema explicitly revokes access from Supabase's public `anon` and `authenticated` API roles.

## 2. Set the app role password

The schema migration has already created the restricted `bp_web_app` role and granted only the table permissions the app needs. It has **no password yet**, so it cannot authenticate. Set a new unique password for that role using Supabase's database role-management interface. Do not use the `postgres` superuser for the website.

In Vercel, `DATABASE_URL` must use the Supabase **transaction pooler** (normally port `6543`) and the app-role username (typically `bp_web_app.<project-ref>`). The backend verifies TLS against Supabase’s database CA certificate. In the Supabase dashboard, open the project’s **Database → SSL Configuration** area and download the CA certificate. Add its full PEM text (including the BEGIN/END CERTIFICATE lines) to Vercel as `DATABASE_SSL_CA`. The pooler connection URL should not include an `sslmode` parameter, which can override the supplied certificate settings. Keep `DATABASE_URL` private.

## 3. Configure private environment variables

Add these variables in the Vercel project's Environment Variables settings (for Preview and Production as appropriate). Do not commit a real `.env` file.

- `DATABASE_URL`: the app-role transaction-pooler URL.
- `DATABASE_SSL_CA`: the PEM CA certificate downloaded from the Supabase Database SSL Configuration page; preserve its newlines in the Vercel value.
- `ADMIN_EMAIL`: the one allowed admin account email.
- `ADMIN_PASSWORD_HASH`: bcrypt hash with cost 12 or higher, never the plain password. Generate locally after `npm install`:
  ```sh
  read -s -p 'Admin password: ' ADMIN_PASSWORD; echo
  node -e 'console.log(require("bcryptjs").hashSync(process.argv[1], 12))' "$ADMIN_PASSWORD"
  unset ADMIN_PASSWORD
  ```
  Put only the resulting hash into the private environment setting.
- `ADMIN_TOTP_SECRET`: generate a Base32 secret locally with `node tools/generate-admin-totp.mjs`, add that secret manually to an authenticator app, and enter it only in the private environment setting. Do not commit the generated secret or its provisioning URI.
- `IP_HASH_SECRET`: a new random secret of at least 32 characters. Generate one locally (for example `openssl rand -hex 32`) and keep it private. It is used to hash rate-limit keys; raw IP addresses are not stored.

Redeploy after setting the variables. The connection code rejects untrusted certificates; do not set `NODE_TLS_REJECT_UNAUTHORIZED=0` or disable certificate validation. The admin page is at `/admin.html`.

## Security boundaries

- Login needs the configured email, a bcrypt-checked password, **and** a time-based authenticator code. Failures are generic, and both the account and IP have a database-backed lockout after repeated attempts.
- Admin sessions use random opaque tokens stored only as hashes in PostgreSQL and an `HttpOnly; Secure; SameSite=Strict` cookie. Mutations also enforce a same-origin check. Product and location input is validated server-side.
- Analytics records only page path and time. No IP address, email, ad identifiers, or visitor profile is saved. Visitors who enable Do Not Track are not counted.
- Application rate limits are not a substitute for edge protection. Enable Vercel Firewall/WAF rate limits for `/api/admin` and `/api/analytics` and leave the host's DDoS protections enabled. No application can promise resistance to every distributed denial-of-service attack; the hosting edge, plan limits, and incident response matter too.
- If the database URL or TOTP secret is exposed, rotate it immediately and invalidate the relevant sessions.
