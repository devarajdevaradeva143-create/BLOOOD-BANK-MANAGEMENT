# Database — MongoDB Atlas (M0) Setup

Canonical database name: **`bloodbank`**

> Local docker parity also uses `bloodbank` (see `mongo-init/init.js`).
> NOTE: `backend/.env.example` historically shows `mongodb://127.0.0.1:27017/blood-bank`
> (hyphenated). For consistency with Atlas, prefer `.../bloodbank` everywhere and
> update that example when convenient.

## 1. Create an Atlas M0 cluster

1. Sign up / log in at https://cloud.mongodb.com
2. Create Organization + Project (e.g. `blood-bank`)
3. Build a Database → choose **M0 Free** tier
4. Choose a cloud provider + region closest to your Render region
   (e.g. AWS / nearest region to your Render service)
5. Cluster name e.g. `bloodbank-m0` (any name is fine — connection string uses it)
6. Wait for cluster provisioning (~3–5 min)

## 2. Create database + least-privilege app user

1. Atlas UI → **Database Access** → **Add New Database User**
2. Authentication: **Password** (auto-generate, store securely)
3. Username e.g. `bloodbank_app`
4. **Database User Privileges → Custom / Specific Privileges**, least privilege:
   - `readWrite` on **`bloodbank`** only (NOT `admin`, NOT `atlasAdmin`)
   - No backup/restore roles, no cluster-wide roles
5. Example mongosh equivalent (run as an Atlas admin):
   ```js
   use bloodbank;
   db.createUser({
     user: "bloodbank_app",
     pwd: "<strong-password>",
     roles: [{ role: "readWrite", db: "bloodbank" }]
   });
   ```
6. Create a separate read-only / human admin only if needed; never use it in the app.

## 3. Network / IP allowlist for Render

Render uses dynamic outbound IPs — Atlas M0 cannot pin a single static IP
unless you add Render's NAT / static-IP add-on.

Options (pick one):

**A. Simple (M0-friendly):**
- Atlas → **Network Access** → **Add IP Address** → **Allow Access from Anywhere**
  (`0.0.0.0/0`). Rely on strong password + least-priv user + M0 rate limits.
  Acceptable for a class project, flagged as such.

**B. Locked down (recommended if Render static IPs available):**
- Atlas → **Network Access** → add each Render outbound / NAT IP (docs:
  Render Dashboard → Service → Settings → Outbound IPs, or Static IPs add-on).
- Keep `0.0.0.0/0` REMOVED.
- Revisit on every Render region / IP rotation.

## 4. Connection string (`MONGO_URI`)

Format:

```
mongodb+srv://<user>:<pass>@<cluster-host>/bloodbank?retryWrites=true&w=majority
```

Example (do NOT commit real credentials):

```
mongodb+srv://bloodbank_app:REPLACE_ME@bloodbank-m0.abc12.mongodb.net/bloodbank?retryWrites=true&w=majority
```

Backend usage (`backend/.env`):

```
MONGO_URI=mongodb+srv://bloodbank_app:REPLACE_ME@bloodbank-m0.abc12.mongodb.net/bloodbank?retryWrites=true&w=majority
```

- DB name in the path MUST be `bloodbank` (matches `mongo-init/init.js`).
- Special chars in password must be URL-encoded (`@` → `%40`, etc.).
- Render: Dashboard → Service → **Environment** → add `MONGO_URI` as a
  **Secret** (Sync: false in `render.yaml`), never bake into the image.

## 5. Verify

```bash
# local (after `npm install`)
node src/index.js
# expect: "MongoDB connected: <host>/bloodbank"

# seed least-priv user check
npm run seed
```

## 6. Backup note (M0 limits)

- **M0 has NO Cloud Backup / point-in-time restore.** Atlas Backup requires M10+.
- Mitigations:
  - Periodic `mongodump` from a workstation with IP allowlisted:
    `mongodump --uri="$MONGO_URI" --out=./dump-$(date +%F)`
  - Or `mongoexport --collection=...` for CSV/JSON per collection.
  - Store dumps encrypted off-site; test restores with `mongorestore`.
- For production with RPO/RTO needs, upgrade to M10+ and enable Cloud Backup.
