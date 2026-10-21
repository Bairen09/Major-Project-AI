# Major Project AI — Step-by-Step Execution Guide

This comprehensive guide walks you through setting up and running the entire **Major Project AI (LocalBoost AI)** full-stack application on your local machine.

---

## 🏗️ Architecture Overview

The system consists of two main subsystems:
1. **Backend API (`/backend`)**:
   - Built with **Node.js**, **Express 5**, and **Mongoose (MongoDB)**.
   - Handles authentication, AI campaign generation (Groq/OpenAI), scheduled jobs, subscription management, and ticket support.
   - Runs by default on: **`http://localhost:5000`**
2. **Frontend Client (`/frontend/src`)**:
   - Built with **React 19**, **Vite**, **TailwindCSS**, and **Radix UI**.
   - Single-page application for the landing page, dashboard, AI post creator, calendar, admin panel, and support desk.
   - Runs by default on: **`http://localhost:5173`**

---

## 📋 System Prerequisites

Ensure you have the following installed on your operating system:
- **Node.js**: `v18.0.0` or higher (`node -v`)
- **npm**: `v9.0.0` or higher (`npm -v`)
- **MongoDB**: Either a local MongoDB instance running on `mongodb://localhost:27017` or a free cloud cluster from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
- **Git**: For version control (`git --version`)

---

## 🚀 Step-by-Step Setup Guide

### Step 1: Open Terminal & Navigate to Project Root
Clone the repository (if setting up on a new machine) and navigate into the root directory:
```bash
git clone https://github.com/Bairen09/Major-Project-AI.git
cd Major-Project-AI
```

---

### Step 2: Configure & Run the Backend

1. **Navigate into the backend directory:**
   ```bash
   cd backend
   ```

2. **Install backend dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file from the provided `.env.example`:
   - On Windows (PowerShell):
     ```powershell
     Copy-Item .env.example .env
     ```
   - On macOS/Linux:
     ```bash
     cp .env.example .env
     ```

4. **Edit `.env` settings:**
   Open `.env` in your text editor and ensure the following keys are set:
   ```env
   NODE_ENV=development
   PORT=5000
   CLIENT_URL=http://localhost:5173

   # MongoDB Connection String
   # For local MongoDB:
   MONGODB_URI=mongodb://localhost:27017/localboost
   # OR for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/localboost

   # JWT Security (Minimum 32 characters)
   JWT_SECRET=super_secret_jwt_key_major_project_ai_2026_xyz
   JWT_EXPIRES_IN=7d

   # AI Generation (Groq is recommended for fast generation)
   GROQ_API_KEY=your_groq_api_key_here
   # Optional fallback:
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_CHAT_MODEL=gpt-4o-mini
   ```

5. **Seed Initial Database Data:**
   Run the seeding scripts to generate pre-configured accounts and demo content:
   ```bash
   # Seed the Super Admin account
   npm run seed:admin

   # Seed Demo Business, Posts, Campaigns, and Notifications
   npm run seed

   # (Optional) Seed Support Staff, Subscriptions, and Tickets
   node src/seeds/extendedSeed.js
   ```

6. **Start the Backend Server:**
   ```bash
   npm run dev
   ```
   *The backend will start with `nodemon` on `http://localhost:5000`.*
   You can verify it is running by opening:
   👉 **`http://localhost:5000/api/v1/health`**

---

### Step 3: Configure & Run the Frontend

> ⚠️ **Important Note on Directory Structure**:
> The frontend application root (containing `package.json` and `vite.config.ts`) is located in **`frontend/src`**.

1. **Open a NEW terminal window** (keep the backend running in the first terminal).

2. **Navigate into `frontend/src`:**
   ```bash
   cd frontend/src
   ```

3. **Install frontend dependencies:**
   ```bash
   npm install
   ```

4. **Verify Frontend Environment:**
   Ensure `frontend/src/.env` exists and contains:
   ```env
   VITE_API_URL=http://localhost:5000/api/v1
   ```
   *(If not present, copy from `frontend/src/.env.example`)*:
   ```powershell
   Copy-Item .env.example .env
   ```

5. **Start the Frontend Development Server:**
   ```bash
   npm run dev
   ```
   *Vite will start the client, usually on `http://localhost:5173`.*

---

## 🔑 Pre-Configured Test Credentials

Once you have run the seed scripts, the following credentials are ready to log in immediately:

| Role | Email | Password | Access / Portal |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@localboost.ai` | `Admin@123` | Platform Admin (`/admin/users`, `/admin/subscriptions`, `/admin/support/stats`) |
| **Demo Business Owner** | `demo@localboost.ai` | `Demo@123` | Full Dashboard (`/dashboard`), AI Generator, Calendar, Saved Posts |
| **Support Staff** | `support_staff1@localboost.ai` | `Password123` | Support Portal (`/support/login` -> `/support/inbox`) |
| **Pro Plan Owner** | `multi_pro@localboost.ai` | `Password123` | Multi-business management & Pro limits |

---

## 🌐 Application Navigation & Endpoints

| View / Feature | URL | Description |
| :--- | :--- | :--- |
| **Landing Page** | `http://localhost:5173/` | Hero section, marketing features, pricing table, and FAQ |
| **Login / Register** | `http://localhost:5173/login` | Authentication and account creation |
| **Dashboard** | `http://localhost:5173/dashboard` | Main analytics, active campaigns, quick stats |
| **AI Content Generator** | `http://localhost:5173/dashboard/generator` | Generate captions, hashtags, and social media posts |
| **Content Calendar** | `http://localhost:5173/dashboard/calendar` | Schedule and view planned content across dates |
| **Saved Posts** | `http://localhost:5173/dashboard/posts` | Manage saved and drafted marketing copy |
| **Support Tickets** | `http://localhost:5173/dashboard/tickets` | User ticket creation and real-time support chat |
| **Admin Panel** | `http://localhost:5173/admin/users` | Manage users, businesses, roles, and subscriptions |
| **Support Staff Desk** | `http://localhost:5173/support/login` | Dedicated portal for support agents to manage tickets |
| **Public Blogs** | `http://localhost:5173/blogs` | SEO blog list and detailed blog reading views |
| **API Health Check** | `http://localhost:5000/api/v1/health` | Backend server & database health verification |

---

## 🛠️ Common Troubleshooting

### 1. Backend: `MongooseServerSelectionError` / Connection Refused
- **Cause**: MongoDB is not running locally, or your MongoDB Atlas IP whitelist does not include your current IP address.
- **Solution**:
  - If using local MongoDB: run `mongod` or verify the MongoDB Windows service is started (`services.msc`).
  - If using MongoDB Atlas: go to Atlas Network Access and click **"Add Current IP Address"** (or allow `0.0.0.0/0` for development).

### 2. Frontend: `Failed to fetch` or Network Errors
- **Cause**: Backend is not running or running on a different port.
- **Solution**:
  - Verify backend is running on `http://localhost:5000`.
  - Check `frontend/src/.env` to ensure `VITE_API_URL=http://localhost:5000/api/v1`.

### 3. Frontend commands fail with `package.json not found`
- **Cause**: Executed command in `frontend/` instead of `frontend/src/`.
- **Solution**:
  - Run `cd frontend/src` and then run `npm install` or `npm run dev`.

### 4. Port 5000 or 5173 Already in Use
- On Windows PowerShell, find and kill the process:
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
  ```
