# Deploying GroupGroove to Azure App Service

## Prerequisites

- An Azure account (portal.azure.com)
- The GroupGroove code pushed to a GitHub repository
- An Azure Database for PostgreSQL instance (or another PostgreSQL provider)

---

## Step 1: Create an Azure Database for PostgreSQL

1. In the Azure Portal, search for **Azure Database for PostgreSQL**
2. Click **Create** → choose **Flexible Server**
3. Fill in the basics:
   - **Resource group**: create a new one (e.g. `groupgroove-rg`)
   - **Server name**: e.g. `groupgroove-db`
   - **Admin username / password**: save these — you'll need them
4. Under **Networking**, allow access from Azure services
5. Click **Review + Create** → **Create**
6. Once created, go to the server → **Databases** → create a database named `groupgroove`
7. Note your connection string — it will look like:
   ```
   postgresql://adminuser:password@groupgroove-db.postgres.database.azure.com:5432/groupgroove
   ```

---

## Step 2: Create an Azure App Service

1. In the Azure Portal, search for **App Service**
2. Click **Create**
3. Fill in the basics:
   - **Resource group**: use the same one (`groupgroove-rg`)
   - **Name**: e.g. `groupgroove-app` (this becomes your URL)
   - **Publish**: Code
   - **Runtime stack**: Node 22 LTS
   - **Operating System**: Linux
   - **Region**: choose one close to you
4. Click **Review + Create** → **Create**

---

## Step 3: Set Environment Variables

1. Go to your App Service → **Settings** → **Environment variables**
2. Add the following variables:

   | Name | Value |
   |------|-------|
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | your PostgreSQL connection string from Step 1 |
   | `JWT_SECRET` | a long random string (see below) |

   To generate a secure `JWT_SECRET`, run this in any terminal:
   ```
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

3. Click **Apply** to save

---

## Step 4: Configure Build and Startup

1. In your App Service → **Settings** → **Configuration** → **General settings**
2. Set the **Startup Command** to:
   ```
   node server/index.js
   ```
3. Click **Save**

Then configure the build:

1. Go to **Deployment** → **Deployment Center**
2. Choose **GitHub** as the source and authorize Azure
3. Select your repository and the `main` branch
4. Azure will auto-detect Node.js — confirm the build command is:
   ```
   npm install && npm run build
   ```
   (This installs root dependencies and builds the React frontend into `client/dist`)
5. Click **Save** — Azure will trigger an initial deployment

---

## Step 5: Verify the Deployment

1. Once deployment completes, visit `https://groupgroove-app.azurewebsites.net`
2. You should see the GroupGroove landing page
3. Test registering an account and logging in

If something isn't working, check **App Service** → **Monitoring** → **Log stream** for error output.

---

## Environment Variable Summary

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | Must be set to `production` |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret key for signing login tokens — must be long and random |
| `PORT` | No | Azure sets this automatically — do not override it |
