# LifeLink Deployment & Production Checklist Guide

This document guides you through hosting LifeLink on production infrastructure: **Vercel** (Frontend), **Render/Railway** (Backend API), and **MongoDB Atlas** (Database Cloud).

---

## 💾 1. Database Setup: MongoDB Atlas

1. **Create Cluster:** Log into MongoDB Atlas and provision a free or shared M-0 Cluster.
2. **Access Security:**
   * Go to **Network Access** and select **Add IP Address**. For deployment, allow access from anywhere (`0.0.0.0/0`) since cloud backend providers utilize dynamic IP routing.
   * Go to **Database Access** and add a user with `readWriteAnyDatabase` roles.
3. **Get Connection String:**
   * Select **Connect** -> **Drivers** -> Node.js.
   * Copy the connection string. Replace `<password>` with your database user password.
   * Example: `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/LifeLink?retryWrites=true&w=majority`

---

## ⚙️ 2. Backend Deployment: Render or Railway

### Deploying to Render
1. Create a Render account and connect your GitHub repository.
2. Select **New** -> **Web Service**.
3. Choose the repository and set:
   * **Language:** `Node`
   * **Build Command:** `npm install`
   * **Start Command:** `node backend/server.js` *(Note: nodemon is not used in production)*
4. Go to **Environment** and add the following variables:
   * `NODE_ENV`: `production`
   * `PORT`: `10000` (Render defaults to 10000)
   * `MONGODB_URI`: *Your MongoDB connection string*
   * `FRONTEND_URL`: *Your Vercel URL (e.g. `https://lifelink-client.vercel.app`)*
   * `CORS_ORIGIN`: *Your Vercel URL*
   * `JWT_SECRET`: *Generate a strong secret*
   * `JWT_REFRESH_SECRET`: *Generate a strong secret*
   * `ENCRYPTION_KEY`: *64 hexadecimal characters*
   * `LOG_LEVEL`: `info`
   * `EMAIL_PROVIDER`: `smtp`
   * `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`: *SMTP configuration details*
   * `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`: *Twilio configuration details*
5. Select **Deploy Web Service**. Render will build and deploy the backend. Make a note of the live web service URL (e.g., `https://lifelink-api.onrender.com`).

---

## 🎨 3. Frontend Deployment: Vercel

1. Create a Vercel account and import your GitHub repository.
2. Configure Project Settings:
   * **Framework Preset:** `Vite`
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
3. Add Environment Variables:
   * `VITE_API_URL`: `https://your-backend-render-url.onrender.com/api/v1`
   * `VITE_SOCKET_URL`: `https://your-backend-render-url.onrender.com`
4. Click **Deploy**. Vercel will bundle the production static assets and make the frontend live.

---

## 📋 4. Final Production Readiness Checklist

Confirm these items are fully complete before final evaluation:

- [x] **No Direct env Variables:** All env lookups must import from `backend/config/index.js`.
- [x] **Secure Cookies:** Cookies are set to `secure: true` and `sameSite: 'strict'` in production mode.
- [x] **CORS Origins restricted:** All wildcards (`*`) have been removed from CORS settings.
- [x] **Secure Random OTPs:** OTPs are randomly generated, expire in 5 minutes, and verification is limited to 3 failed attempts (no static `'123456'` code).
- [x] **Email SMTP Ready:** SMTP transporters are initialized from config properties instead of hardcoded strings.
- [x] **Graceful Teardown:** Signal listeners (`SIGTERM`/`SIGINT`) properly close connection pools.
- [x] **Console Logs in Production:** Winston is configured to stream to stdout/stderr in production so cloud platforms capture them.
- [x] **Linter and Build Verify:** CI checks (`eslint` and `npm run build`) are passing cleanly.
