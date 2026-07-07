# LifeLink – Real-Time Emergency Blood Donation Platform

LifeLink is an enterprise-grade, production-ready full-stack MERN application that connects blood donors, recipients, hospitals, and blood banks in real time. It features automatic geolocation matching, real-time Socket.io dispatch, secure rate-limiting, custom inputs sanitization, and structured logging.

---

## 🏗️ Architecture & Security Overview

```
                        ┌────────────────────────┐
                        │   React.js Frontend    │
                        │ (Vite / TS / Tailwind) │
                        └───────────┬────────────┘
                                    │ (HTTP & WebSockets)
                                    ▼
                        ┌────────────────────────┐
                        │   Express.js Backend   │
                        │  (Dynamic Config/CORS) │
                        └─────┬────────────┬─────┘
                              │            │
            ┌─────────────────▼──┐      ┌──▼─────────────────┐
            │   MongoDB Atlas    │      │    Socket.IO       │
            │ (2dsphere Spatial) │      │ (Real-time Rooms)  │
            └────────────────────┘      └────────────────────┘
```

* **Dynamic Config Layer:** No direct access to `process.env`. All configuration is parsed and exported dynamically via `backend/config/index.js` (including SMTP and Twilio parameters).
* **Enterprise Security:**
  * **CORS Protection:** Configurable via the `CORS_ORIGIN` environment variable (wildcards are blocked).
  * **Security Headers:** Enforced using `helmet` for defense against clickjacking and click vulnerabilities.
  * **Sanitization Middleware:** Custom NoSQL Sanitizer (protecting against query-operator injection) and HTML escaping (XSS cleaner) applied globally.
  * **Rate Limiting:** IP-based rate limiters on general APIs (100 req/15min) and strict authentication rate limiters (20 attempts/hour).
  * **Brute-Force Protection:** Smart lockout logic (locks accounts for 1 hour after 5 consecutive failed login attempts).
* **Robust Verification Engine:**
  * Hashed/encrypted email verification and password reset workflows.
  * Rate-limited mobile SMS verification with 5-minute code expirations and a 3-attempt limit to prevent verification bypass.
* **Resilient Infrastructure:**
  * Winston dynamic logging: files for local development, raw JSON console streaming (stdout) for cloud logs capture.
  * Mongoose connection pooling and exponential backoff retry cycles.
  * Clean `SIGINT`/`SIGTERM` handlers for graceful server and socket shutdowns.

---

## 📂 Folder Structure Documentation

```
LifeLink/
├── .github/workflows/      # CI/CD pipelines
│   └── ci.yml              # Automated build, lint, and test runner
├── backend/
│   ├── config/             # DB connection, Winston logging, and dynamic environment exports
│   │   ├── db.js
│   │   ├── index.js        # Central Configuration Manager
│   │   └── logger.js
│   ├── controllers/        # REST Route handlers (auth, requests, assistant, notifications)
│   ├── docs/               # Swagger OpenAPI specifications
│   ├── middleware/         # Auth guards, security filters, rate limiters, validation schemas
│   ├── models/             # Mongoose Schemas (User, BloodRequest, AuditLog, etc.)
│   ├── routes/             # Express routes mount directories
│   ├── services/           # Underlying business services (SMTP, Twilio OTP, matching logic)
│   ├── sockets/            # Real-time WebSockets event listeners and rooms
│   ├── server.js           # Server initializer & process signal listeners
│   └── app.js              # Express app middleware configuration
├── src/                    # Frontend React SPA
│   ├── api/                # Axios Client Instance configuration (with interceptors)
│   ├── components/         # Layout components & Reusable UI elements
│   ├── context/            # Auth context provider wrapper
│   ├── store/              # Zustand state manager stores
│   └── pages/              # Routing pages (Dashboard, Verification, Tracking Map, FAQ)
```

---

## 🔑 Environment Setup Guide

To run the application locally or in production, configure the following keys in your `.env` file (see `.env.example` for reference):

```bash
# General Server Keys
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_uri
ENCRYPTION_KEY=64_char_hex_encryption_key

# CORS & Client Locations
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173

# Authentication Token Settings
JWT_SECRET=your_jwt_access_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Nodemailer / SMTP
EMAIL_PROVIDER=smtp
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
EMAIL_FROM="LifeLink Admin" <no-reply@lifelink.org>

# Twilio SMS OTP
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

*Note: For local frontend builds, supply `VITE_API_URL` and `VITE_SOCKET_URL` variables pointing to your backend address.*

---

## 📡 API Endpoint Documentation

### Authentication (`/api/v1/auth`)
* `POST /register` — Register a new account.
* `POST /login` — Authenticate and retrieve Access and Refresh tokens.
* `POST /logout` — Clear session cookies and invalidate refresh tokens.
* `POST /refresh-token` — Exchange valid refresh tokens for new access tokens.
* `POST /forgot-password` — Dispatch reset links.
* `POST /reset-password` — Apply new password.
* `GET /verify-email` — Verify email address.
* `POST /send-otp` — Generate and send SMS OTP verification (requires authorization).
* `POST /verify-mobile` — Submit SMS OTP verification code (requires authorization).

### Emergency Blood Requests (`/api/v1/requests`)
* `POST /` — Dispatch a new emergency request (triggers real-time 10km spatial matching).
* `GET /` — Fetch Paginated/filtered active blood requests.
* `GET /:requestId` — Fetch single request details (including donor responses).
* `POST /:requestId/respond` — Donor response (Accept/Pass).
* `PATCH /:requestId/status` — Modify request status (Traveling, Donation Completed).

### AI Assistant Chat (`/api/v1/assistant`)
* `GET /` — Fetch user's chat message history.
* `POST /` — Send message and generate AI guide rules.

---

## 🚀 Getting Started

### 1. Installation
Install core packages across frontend and backend from the root directory:
```bash
npm install
```

### 2. Run Tests
Verify configuration safety and API structures:
```bash
npm test
```

### 3. Run Development Servers
Start both frontend (Vite) and backend (Nodemon) concurrently:
```bash
npm run dev
```

### 4. Build Production Bundle
```bash
npm run build
```

---

## 🌐 Production Deployment

For full instructions on how to containerize the application, set up MongoDB Atlas, host the backend on Google Cloud Run, and deploy the React frontend on Vercel, refer to the [Production Deployment & Architecture Guide](.system_generated/../production_documentation.md) (saved in your workspace artifacts).
