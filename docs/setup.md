# LocalBoost AI - Environment & Setup Instructions

This document provides a guide to setting up, running, validating, and managing the LocalBoost AI backend locally.

---

## 1. Local Prerequisites
- **Node.js**: `>=18.0.0`
- **npm**: `>=9.0.0`
- **MongoDB Atlas Cluster** (or local MongoDB database instances running on localhost)

---

## 2. Installation Steps

1. **Clone the Repository**:
   ```bash
   git clone <repository_url> localboost-ai
   cd localboost-ai
   ```

2. **Backend Setup**:
   Navigate to the backend directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the example environment configuration into a local file:
   ```bash
   cp .env.example .env
   ```
   Open the `.env` file and set the required variables (specifically `MONGODB_URI` and a random string for `JWT_SECRET`).

---

## 3. Environment Variable Blueprints

Below are the variables managed inside `.env`:

| Key | Type | Description | Default | Required |
|---|---|---|---|---|
| `NODE_ENV` | String | Application runtime mode (`development`, `production`) | `development` | Yes |
| `PORT` | Number | Port binding for the HTTP server | `5000` | Yes |
| `CLIENT_URL` | String | CORS permitted client access origin | `http://localhost:5173` | Yes |
| `MONGODB_URI` | String | Full MongoDB Atlas cluster connection link | - | **Yes** |
| `JWT_SECRET` | String | Encryption token used for signing JWT cookies (min 32 chars) | - | **Yes** |
| `JWT_EXPIRES_IN` | String | Expiry period for authentication tokens | `7d` | No |
| `RESET_TOKEN_EXPIRES_IN`| Number | Expiration timing for passwords reset limits (in ms) | `3600000` (1 hr) | No |
| `RATE_LIMIT_WINDOW_MS` | Number | Rate limit sliding window tracker (in ms) | `900000` (15 min) | No |
| `RATE_LIMIT_MAX` | Number | Maximum requests allowed globally inside the window limit | `100` | No |
| `AUTH_RATE_LIMIT_MAX` | Number | Maximum requests allowed on auth routes (login/register) | `10` | No |

---

## 4. Run Scripts

All scripts must be executed inside the `/backend` folder.

- **Production Run**:
  Starts the server via the node engine directly.
  ```bash
  npm run start
  ```

- **Development Run**:
  Launches server inside a `nodemon` wrapper that automatically refreshes the node lifecycle when file edits are detected.
  ```bash
  npm run dev
  ```

- **Lint Checks**:
  ```bash
  npm run lint
  ```

---

## 5. Startup Validation Checks

Upon execution (`npm run dev`), the application performs several automated tests before starting the server:

1. **Environment Verification (`env.js`)**:
   - Ensures `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV`, `PORT`, and `CLIENT_URL` are not empty.
   - Throws a critical error and terminates the process immediately if any keys are missing.
   - Ensures `JWT_SECRET` is at least 32 characters long.
2. **Database Verification (`db.js`)**:
   - Boots up the Mongoose client connection to MongoDB Atlas.
   - Displays a success message showing the host database once connected, or prints a fail message and exits on exception.
