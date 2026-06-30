# LocalBoost AI - API & Middleware Documentation

This document describes the request/response guidelines, standard wrappers, middleware configurations, error handling patterns, and active endpoints of the LocalBoost AI Backend API.

---

## 1. Global Middleware Pipelines

Every request sent to `/api/v1` goes through a strict sequence of middlewares in `app.js` to ensure tracebility, safety, performance, and rate compliance:

1. **Request Tracking (`requestId.js`)**:
   - Automatically generates a unique Version 4 UUID for every request.
   - Attaches the ID as `req.requestId` for logging and error reporting.
   - Binds the response header `X-Request-ID`.
2. **Security Headers (`helmet`)**:
   - Configures secure HTTP headers to mitigate cross-site scripting (XSS), clickjacking, and MIME sniffing attacks.
3. **CORS (`cors`)**:
   - Enables requests from trusted origins configured under `process.env.CLIENT_URL` (default: `http://localhost:5173`) with credentials allowed.
4. **Morgan Logger**:
   - Formatted to log HTTP method, path, response status, duration, and the associated Request ID during development.
5. **Compression (`compression`)**:
   - Minimizes network payloads by gzip compressing JSON responses.
6. **Global Rate Limiter (`rateLimiter.js`)**:
   - Implements `express-rate-limit` using `process.env.RATE_LIMIT_WINDOW_MS` (default: 15 min) and `process.env.RATE_LIMIT_MAX` (default: 100).
   - Prevents brute force and denial of service.
   - An additional `authLimiter` is available for authentication endpoints (limit: 10 attempts per 15 min window).

---

## 2. API Standardization

### 2.1 Success Response Utility (`apiResponse.js`)

All successful controller resolutions utilize the `sendSuccess` or `sendCreated` functions to build predictable JSON models:

* **Success Standard (HTTP 200)**:
  ```json
  {
    "success": true,
    "message": "Resource retrieved successfully",
    "data": { ... }
  }
  ```

* **Created Standard (HTTP 201)**:
  ```json
  {
    "success": true,
    "message": "Business profile created successfully",
    "data": { ... }
  }
  ```

* **No Content Standard (HTTP 204)**:
  - Returns status `204` with an empty response body.

### 2.2 Error Handling & Responses (`errorHandler.js`)

Operational errors (e.g. invalid inputs, missing fields, connection loss) throw an instance of the custom `AppError` class. The centralized error handling middleware catches all runtime exceptions and converts them into standardized responses.

#### Standard Error Formats (JSON)

* **Bad Request / Validation (HTTP 400)**:
  Thrown for mongoose schemas validation failures, listing all failing fields.
  ```json
  {
    "success": false,
    "message": "Name is required, Email must be a valid email address"
  }
  ```

* **Conflict / Duplicate Keys (HTTP 409)**:
  Automatically parsed from MongoDB `11000` errors (e.g., trying to register an existing email).
  ```json
  {
    "success": false,
    "message": "Email already exists"
  }
  ```

* **Internal Server Error (HTTP 500)**:
  ```json
  {
    "success": false,
    "message": "Internal Server Error"
  }
  ```

* **Development-Mode Exception Tracing**:
  If `NODE_ENV=development`, the JSON response is appended with a `stack` property containing the error trace:
  ```json
  {
    "success": false,
    "message": "Resource not found",
    "stack": "Error: Resource not found\n    at BaseService.throwIfNotFound (C:\\Users\\baira\\localboost-ai\\backend\\src\\services\\base\\BaseService.js:9:13)..."
  }
  ```

---

## 3. Endpoints Documentation

### 3.1 Health Check
Checks the server running status, system resources, and environment settings.

* **Route**: `/api/v1/health`
* **Method**: `GET`
* **Authentication**: None
* **Middlewares Applied**: Request ID, Helmet, CORS, Morgan, Compression, Global Rate Limiter.
* **Success Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "message": "Server is running",
    "data": {
      "service": "LocalBoost AI Backend",
      "version": "1.0.0",
      "status": "OK",
      "environment": "development",
      "uptime": 12,
      "timestamp": "2026-06-29T10:15:00.000Z",
      "requestId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
    }
  }
  ```

### 3.2 404 Route Fallback
Triggers when a request path or HTTP verb does not match any registered router endpoints.

* **Success Response (HTTP 404)**:
  ```json
  {
    "success": false,
    "message": "Route not found",
    "path": "/api/v1/doesnotexist",
    "method": "GET",
    "requestId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
  }
  ```
