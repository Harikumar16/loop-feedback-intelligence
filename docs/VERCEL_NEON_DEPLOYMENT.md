# Deploy LOOP with Neon and Vercel

This application must use a hosted PostgreSQL database in Vercel. Do not copy a local `localhost` connection string to Vercel.

## 1. Create the Neon database

1. Sign in at [Neon](https://console.neon.tech/), then select **New project**.
2. Name the project `loop-feedback`, choose a region near your Vercel function region, and create the project.
3. In Neon, open **Connect** and copy the **pooled** connection string for the default database and role. Keep it private.

The value has this shape:

```text
postgresql://<user>:<password>@<project>-pooler.<region>.aws.neon.tech/<database>?sslmode=require&channel_binding=require
```

Use Neon’s copied value exactly; it contains the real host, credentials, and any current options required by the service.

## 2. Configure Vercel

In Vercel, open the LOOP project, then go to **Settings → Environment Variables**. Add these variables for **Production** and **Preview**:

| Name | Value |
| --- | --- |
| `DATABASE_URL` | The pooled Neon URL copied above |
| `AUTH_SECRET` | A new, long random secret (use a different secret from local development) |
| `AUTH_TRUST_HOST` | `true` |
| `GEMINI_API_KEY` | Your Gemini API key |

Save the variables, then redeploy. Environment-variable changes apply only to new deployments.

## 3. Create the hosted schema and demo data

From this project directory, set `DATABASE_URL` temporarily to the Neon value in your local `.env.local`, then run:

```powershell
npm run db:deploy
npm run db:seed
```

`db:deploy` applies the committed Prisma migration to the hosted database. `db:seed` creates the demo workspace and login only when that workspace has no feedback; it no longer removes existing feedback.

For a new hosted database, the demo sign-in is:

```text
Email: demo@loop.app
Password: LoopDemo!2026
```

Change or remove the demo account before giving public users access.

## 4. Verify the deployed application

After the new deployment is live:

1. Open the production Vercel URL in an incognito window.
2. Sign in using the demo account. A successful login proves NextAuth can read the Neon user and membership records.
3. Add a feedback item and reload the page. It must still exist after reload.
4. Open **Ask LOOP**, ask a question about feedback, and confirm an answer is returned.
5. Open **Reports**, generate a report, and open or export it.
6. In Vercel, open **Logs**. There should be no `P1001`, `DATABASE_URL`, authentication, or Gemini-key errors.

## Production checklist

- [ ] Neon URL is hosted and contains no `localhost`.
- [ ] `DATABASE_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST`, and `GEMINI_API_KEY` are set in Vercel Production and Preview.
- [ ] `npm run db:deploy` and `npm run db:seed` completed against Neon.
- [ ] A fresh Vercel deployment completed successfully.
- [ ] Login, feedback, Ask LOOP, and Generate Report passed the checks above.
- [ ] Local `.env` and `.env.local` are not committed.
- [ ] The demo password and old local database password have been changed before public release.
