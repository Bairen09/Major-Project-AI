# LocalBoost AI — Deployment Guide

This guide covers the deployment of the LocalBoost AI application, focusing on Render for the backend and Vercel for the frontend. Follow these instructions precisely to ensure production stability.

---

## 1. Backend Deployment (Render)

Deploy the backend as a **Web Service** on Render.

*   **Root Directory:** `backend`
*   **Build Command:** `npm install`
*   **Start Command:** `npm start`
*   **Health Check Path:** `/health`
*   **Auto Deploy:** `Yes` (Triggered on pushes to the main branch)

### Environment Variables
Configure the following in the Render dashboard:

| Variable | Description |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `PORT` | `5000` (Render will assign this automatically, but set it as a fallback) |
| `MONGODB_URI` | Your production MongoDB connection string |
| `JWT_SECRET` | A secure, random string (min 32 characters) |
| `CLIENT_URL` | Your frontend production URL (e.g., `https://your-frontend.vercel.app`). Can be a comma-separated list of URLs. |
| `CLOUDINARY_CLOUD_NAME` | *(Optional)* From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | *(Optional)* From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET`| *(Optional)* From Cloudinary dashboard |
| `GROQ_API_KEY` | *(Optional)* From Groq console |
| `IMAGE_PROVIDER` | *(Optional)* `openai`, `gemini`, or `flux` |
| `IMAGE_API_KEY` | *(Optional)* Your API key for the chosen image provider |
| `IMAGE_MODEL` | *(Optional)* Depends on the provider (e.g., `dall-e-3`) |

> [!NOTE]
> The backend is built with graceful degradation. If Cloudinary or Image Provider variables are missing, the server will still boot successfully, but image-related endpoints will fail gracefully when called.

### Database & External Services Setup
*   **MongoDB:** Ensure you whitelist IP `0.0.0.0/0` in MongoDB Atlas (Render uses dynamic IPs).
*   **Cloudinary:** Create a free Cloudinary account and fetch your API keys.
*   **Groq API:** Get your free API key from the Groq console for text AI generation.
*   **Image Generation:** Set `IMAGE_PROVIDER` and `IMAGE_API_KEY` to instantly enable marketing image generation.

### Common Errors & Troubleshooting
*   **MongoDB Connection Failed:** Check that your MongoDB Atlas IP Access List allows all IPs (`0.0.0.0/0`).
*   **CORS Errors:** Ensure your `CLIENT_URL` exactly matches your frontend's Vercel URL without a trailing slash (e.g., `https://localboost.vercel.app`).

---

## 2. Frontend Deployment (Vercel)

Deploy the frontend using Vercel. Connect your repository and configure the project.

*   **Framework Preset:** `Vite`
*   **Root Directory:** `frontend/src`
*   **Build Command:** `npm run build`
*   **Output Directory:** `dist`
*   **Install Command:** `npm install` (Vercel handles this by default)

### Environment Variables
| Variable | Description |
| :--- | :--- |
| `VITE_API_URL` | The production URL of your Render backend (e.g., `https://localboost-backend.onrender.com/api/v1`) |

### Vercel Rewrite Configuration
A `vercel.json` file is placed in the `frontend/src` root directory to handle Single Page Application (SPA) routing, ensuring refreshes on sub-routes don't result in a 404 error:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Custom Domain Notes
If you attach a custom domain in Vercel later, you must add that new domain to the backend's `CLIENT_URL` environment variable (comma-separated).

### Common Errors & Troubleshooting
*   **404 on Refresh:** Ensure Vercel detects `vercel.json` in the `frontend` root directory.
*   **Network Errors / Blank Data:** Double check that `VITE_API_URL` points exactly to your backend root API path (with `/api/v1`).

---

## 3. Deployment Order & Verification

Follow this exact sequence for a successful deployment:

1.  **Deploy Backend** on Render.
2.  **Configure Environment Variables** in Render settings.
3.  **Verify Health Endpoint** by visiting `https://your-backend.onrender.com/health` (should return `{"status":"ok"}`).
4.  **Deploy Frontend** on Vercel.
5.  **Configure VITE_API_URL** in Vercel settings and trigger a redeploy if needed.
6.  **Verify Authentication:** Sign up / log in to ensure MongoDB and JWT are working.
7.  **Verify Dashboard:** Ensure summary metrics load properly.
8.  **Verify AI Generator:** Generate a post to verify the Groq integration.
9.  **Verify Calendar:** Check that scheduled posts display.
10. **Verify Analytics:** Ensure the chart renders.
11. **Verify Settings:** Update settings to verify PUT requests.
12. **Verify Saved Posts:** Check list rendering and filters.
13. **Verify Media Upload:** Upload an image to verify Cloudinary integration.
14. **Verify AI Image Generation:** Generate an image to verify the configured `IMAGE_PROVIDER`.
