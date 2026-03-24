# IOHA Certificates Platform - Developer Handover Guide

Welcome to the internal IOHA Certificates repository. This platform utilizes a Next.js 16 full-stack serverless architecture mapped to an Aiven PostgreSQL database via the Prisma ORM. 

To ensure 100% maximal uptime, please adhere strictly to the following Standard Operating Procedures (SOPs) when making modifications to the live codebase.

## 🚨 Strict Vercel Deployment Safety
This repository enforces an unyielding Continuous Integration (CI) pipeline on Vercel. 
The production Vercel server will **instantly reject** any GitHub commit that triggers even a single TypeScript mismatch or ESLint warning.

### Why was this enabled?
It is mathematically proven that enforcing strict boundaries on API inputs and database objects eliminates 99% of unexpected runtime crashes. Do not attempt to bypass these checks by injecting `"ignoreDuringBuilds": true` into the `next.config.mjs`. If the Vercel deployment crashes, it means your code has a tangible typing instability that must be resolved locally first.

## 🗄️ Database Architecture Updates
If you intend to add new columns to the database (e.g. adding `ContactHours` to `Webinar`), **you must follow these exact instructions**:
1. Add the column to the corresponding models in `prisma/schema.prisma`.
2. Open your terminal and run `npx prisma db push`. This performs an atomic synchronization between your new schema code and the live Aiven PostgreSQL cloud database.
3. Once successful, the command will also automatically generate a new `node_modules/.prisma/client` library. 
4. Check all API routes (`src/app/api/...`) that query or write to that specific database model and ensure you are passing the newly required column variables into them. 

*(Note: The build pipeline handles cache-breaking native to Vercel via the custom package.json `build` directive `prisma generate && next build`)*

## ✅ Running a Local Safety Audit
Before executing a `git push origin main` and triggering the live Vercel rollout, you are required to simulate a Vercel build environment locally.

1. **Verify Formatting:** Run `npm run lint`. Ensure it registers **0 errors and 0 warnings**. If it detects an implicitly typed `any` variable, firmly cast it to an `unknown` or expected `Error` interface.
2. **Build Optimization Simulation:** Run `npm run build`. This runs the compiler exactly how Vercel does it. If it prints the green `Compiled successfully` and lists the static output routes with `Exit code: 0`, you are cleared for deployment.

## 🔑 Environment Secrets
The live Aiven Postgres stream requires a specific database string containing the user credentials. 
This resides on Vercel under Project Settings $\rightarrow$ Environment Variables $\rightarrow$ `DATABASE_URL`. Do not accidentally commit this string to GitHub. Keep it isolated securely in your local `.env`.
