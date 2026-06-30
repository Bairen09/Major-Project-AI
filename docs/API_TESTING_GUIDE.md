# LocalBoost AI - API Testing Guide (Postman)

This guide allows you to test the entire LocalBoost AI backend from start to finish using Postman, without needing to read the source code.

## 1. Setup

**Backend Base URL**: 
```
http://localhost:5000/api/v1
```
*(If your server runs on a different port, update the base URL accordingly)*

---

## 2. Environment Variables for Postman

Set up the following variables in your Postman Environment or Collection:

- `BASE_URL`: `http://localhost:5000/api/v1`
- `JWT_TOKEN`: (leave blank, populated from Register/Login)
- `BUSINESS_ID`: (leave blank, populated from Create Business)
- `POST_ID`: (leave blank, populated from Save Post)

---

## 3. Testing Order

For a smooth testing flow, hit the endpoints exactly in this order. Every request naturally provides data required by the next request.

Health
↓
Register
↓
Login
↓
Get Me
↓
Forgot Password
↓
Reset Password
↓
Create Business
↓
List Businesses
↓
Get Single Business
↓
Update Business
↓
Update Settings
↓
Get Members
↓
Dashboard Summary
↓
Generate AI Posts
↓
Save Post
↓
List Posts
↓
Get Single Post
↓
Update Post
↓
Duplicate Post
↓
Delete Post
↓
Delete Business

---

## 4. Endpoints

### Health

**Method:** `GET`  
**Full URL:** `{{BASE_URL}}/health`  
**Purpose:** Verify if the backend server is running.  

**Required Headers:**  
No Authorization Required  

**Request Body:** None  

**Successful Response (200):**  
```json
{
  "success": true,
  "message": "Server is running",
  "data": {
    "service": "LocalBoost AI Backend",
    "version": "1.0.0",
    "status": "OK"
  }
}
```

**Variables to Save:** None  

**Common Errors:** None  

---

### Register

**Method:** `POST`  
**Full URL:** `{{BASE_URL}}/auth/register`  
**Purpose:** Create a new user account.  

**Required Headers:**  
- `Content-Type: application/json`  

No Authorization Required  

**Request Body:**  
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "Password@123"
}
```

**Successful Response (201):**  
```json
{
  "success": true,
  "message": "Registration successful.",
  "data": {
    "user": {
      "id": "64abcd123...",
      "name": "Rahul Sharma",
      "email": "rahul@example.com"
    },
    "token": "eyJhbGci...",
    "expiresIn": "7d"
  }
}
```

**Variables to Save:**  
- Save `data.token` as `JWT_TOKEN`  

**Common Errors:**  
- `409` (Email already exists)  
- `422` (Validation failed - invalid email, weak password)  

---

### Login

**Method:** `POST`  
**Full URL:** `{{BASE_URL}}/auth/login`  
**Purpose:** Authenticate and get a JWT token.  

**Required Headers:**  
- `Content-Type: application/json`  

No Authorization Required  

**Request Body:**  
```json
{
  "email": "rahul@example.com",
  "password": "Password@123"
}
```

**Successful Response (200):**  
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": "64abcd123...",
      "name": "Rahul Sharma",
      "email": "rahul@example.com"
    },
    "token": "eyJhbGci..."
  }
}
```

**Variables to Save:**  
- Save `data.token` as `JWT_TOKEN`  

**Common Errors:**  
- `401` (Invalid email or password)  
- `403` (Account deactivated)  
- `422` (Validation failed)  

---

### Get Me

**Method:** `GET`  
**Full URL:** `{{BASE_URL}}/auth/me`  
**Purpose:** Fetch the authenticated user's profile.  

**Required Headers:**  
- `Authorization: Bearer {{JWT_TOKEN}}`  

**Request Body:** None  

**Successful Response (200):**  
```json
{
  "success": true,
  "message": "User fetched successfully.",
  "data": {
    "_id": "64abcd123...",
    "name": "Rahul Sharma",
    "email": "rahul@example.com"
  }
}
```

**Variables to Save:** None  

**Common Errors:**  
- `401` (Unauthorized)  
- `404` (User not found)  

---

### Forgot Password

**Method:** `POST`  
**Full URL:** `{{BASE_URL}}/auth/forgot-password`  
**Purpose:** Request a password reset link.  

**Required Headers:**  
- `Content-Type: application/json`  

No Authorization Required  

**Request Body:**  
```json
{
  "email": "rahul@example.com"
}
```

**Successful Response (200):**  
```json
{
  "success": true,
  "message": "If an account exists with this email, a password reset link has been sent."
}
```

**Variables to Save:** None  

**Common Errors:**  
- `422` (Validation failed)  
- `500` (Failed to send email)  

---

### Reset Password

**Method:** `POST`  
**Full URL:** `{{BASE_URL}}/auth/reset-password`  
**Purpose:** Reset the password using the reset token.  

**Required Headers:**  
- `Content-Type: application/json`  

No Authorization Required  

**Request Body:**  
```json
{
  "token": "COPY_TOKEN_FROM_DATABASE_OR_LOGS",
  "password": "NewPassword@123"
}
```

**Successful Response (200):**  
```json
{
  "success": true,
  "message": "Password has been reset successfully."
}
```

**Variables to Save:** None  

**Common Errors:**  
- `400` (Reset token is invalid or has expired)  
- `422` (Validation failed)  

---

### Create Business

**Method:** `POST`  
**Full URL:** `{{BASE_URL}}/businesses`  
**Purpose:** Create a new business profile.  

**Required Headers:**  
- `Content-Type: application/json`  
- `Authorization: Bearer {{JWT_TOKEN}}`  

**Request Body:**  
```json
{
  "name": "Sharma Realtors",
  "category": "real_estate",
  "industry": "Real Estate",
  "description": "Premium real estate agency in Mumbai.",
  "location": {
    "city": "Mumbai",
    "state": "Maharashtra",
    "country": "India"
  },
  "services": ["Property Sales", "Rentals"]
}
```
*(Valid categories: salon, spa, gym, fitness_studio, restaurant, cafe, bakery, dental_clinic, medical_clinic, real_estate, home_services, retail, other)*

**Successful Response (201):**  
```json
{
  "success": true,
  "message": "Business created successfully.",
  "data": {
    "_id": "64xyz987...",
    "name": "Sharma Realtors",
    "slug": "sharma-realtors",
    "category": "real_estate"
  }
}
```

**Variables to Save:**  
- Save `data._id` as `BUSINESS_ID`  

**Common Errors:**  
- `401` (Unauthorized)  
- `422` (Validation failed - invalid category, missing name)  

---

### List Businesses

**Method:** `GET`  
**Full URL:** `{{BASE_URL}}/businesses/mine`  
**Purpose:** Get all businesses owned by the authenticated user.  

**Required Headers:**  
- `Authorization: Bearer {{JWT_TOKEN}}`  

**Request Body:** None  

**Successful Response (200):**  
```json
{
  "success": true,
  "message": "Businesses fetched successfully.",
  "data": [
    {
      "_id": "64xyz987...",
      "name": "Sharma Realtors",
      "category": "real_estate"
    }
  ]
}
```

**Variables to Save:**  
- Ensure `BUSINESS_ID` matches the `_id` of the business you want to test further.  

**Common Errors:**  
- `401` (Unauthorized)  

---

### Get Single Business

**Method:** `GET`  
**Full URL:** `{{BASE_URL}}/businesses/{{BUSINESS_ID}}`  
**Purpose:** Fetch details of a specific business.  

**Required Headers:**  
- `Authorization: Bearer {{JWT_TOKEN}}`  

**Request Body:** None  

**Successful Response (200):**  
```json
{
  "success": true,
  "message": "Business fetched successfully.",
  "data": {
    "_id": "64xyz987...",
    "name": "Sharma Realtors",
    "category": "real_estate",
    "members": [...]
  }
}
```

**Variables to Save:** None  

**Common Errors:**  
- `401` (Unauthorized)  
- `403` (Forbidden)  
- `404` (Business not found)  

---

### Update Business

**Method:** `PATCH`  
**Full URL:** `{{BASE_URL}}/businesses/{{BUSINESS_ID}}`  
**Purpose:** Update basic business details.  

**Required Headers:**  
- `Content-Type: application/json`  
- `Authorization: Bearer {{JWT_TOKEN}}`  

**Request Body:**  
```json
{
  "description": "Premium real estate agency in Mumbai. Updated description."
}
```

**Successful Response (200):**  
```json
{
  "success": true,
  "message": "Business updated successfully.",
  "data": {
    "_id": "64xyz987...",
    "name": "Sharma Realtors",
    "description": "Premium real estate agency in Mumbai. Updated description."
  }
}
```

**Variables to Save:** None  

**Common Errors:**  
- `401` (Unauthorized)  
- `403` (Forbidden)  
- `404` (Business not found)  
- `422` (Validation Error)  

---

### Update Settings

**Method:** `PATCH`  
**Full URL:** `{{BASE_URL}}/businesses/{{BUSINESS_ID}}/settings`  
**Purpose:** Update business preferences and settings.  

**Required Headers:**  
- `Content-Type: application/json`  
- `Authorization: Bearer {{JWT_TOKEN}}`  

**Request Body:**  
```json
{
  "tone": "professional",
  "timezone": "Asia/Kolkata",
  "language": "en",
  "autoApprovePosts": true,
  "postingPreferences": {
    "preferredDays": ["monday", "wednesday", "friday"],
    "preferredTime": "10:00"
  }
}
```
*(Valid tones: professional, friendly, luxury, fun, casual)*

**Successful Response (200):**  
```json
{
  "success": true,
  "message": "Settings updated successfully.",
  "data": {
    "_id": "64xyz987...",
    "settings": {
      "tone": "professional",
      "timezone": "Asia/Kolkata"
    }
  }
}
```

**Variables to Save:** None  

**Common Errors:**  
- `401` (Unauthorized)  
- `403` (Forbidden)  
- `404` (Business not found)  
- `422` (Validation failed)  

---

### Get Members

**Method:** `GET`  
**Full URL:** `{{BASE_URL}}/businesses/{{BUSINESS_ID}}/members`  
**Purpose:** Fetch members associated with the business.  

**Required Headers:**  
- `Authorization: Bearer {{JWT_TOKEN}}`  

**Request Body:** None  

**Successful Response (200):**  
```json
{
  "success": true,
  "message": "Members fetched successfully.",
  "data": [
    {
      "user": {
        "_id": "64abcd123...",
        "name": "Rahul Sharma",
        "email": "rahul@example.com"
      },
      "role": "owner",
      "joinedAt": "2026-06-29T..."
    }
  ]
}
```

**Variables to Save:** None  

**Common Errors:**  
- `401` (Unauthorized)  
- `403` (Forbidden)  
- `404` (Business not found)  

---

### Dashboard Summary

**Method:** `GET`  
**Full URL:** `{{BASE_URL}}/businesses/{{BUSINESS_ID}}/dashboard/summary`  
**Purpose:** Fetch dashboard metrics for the business.  

**Required Headers:**  
- `Authorization: Bearer {{JWT_TOKEN}}`  

**Request Body:** None  

**Successful Response (200):**  
```json
{
  "success": true,
  "message": "Dashboard summary fetched successfully.",
  "data": {
    "totalPosts": 0,
    "scheduledPosts": 0,
    "publishedPosts": 0,
    "recentActivity": []
  }
}
```

**Variables to Save:** None  

**Common Errors:**  
- `401` (Unauthorized)  
- `403` (Forbidden)  
- `404` (Business not found)  

---

### Generate AI Posts

**Method:** `POST`  
**Full URL:** `{{BASE_URL}}/businesses/{{BUSINESS_ID}}/posts/generate`  
**Purpose:** Generate AI post content.  

**Required Headers:**  
- `Content-Type: application/json`  
- `Authorization: Bearer {{JWT_TOKEN}}`  

**Request Body:**  
```json
{
  "platform": "instagram",
  "goal": "engagement",
  "tone": "professional",
  "topic": "New luxury apartment launch in Bandra",
  "count": 2
}
```
*(Valid platforms: instagram, facebook, google, manual. Valid goals: awareness, leads, sales, engagement)*

**Successful Response (200):**  
```json
{
  "success": true,
  "message": "Posts generated successfully.",
  "data": [
    {
      "content": "Discover true luxury in the heart of Bandra! 🏙️✨...",
      "platform": "instagram"
    }
  ]
}
```

**Variables to Save:** None  

**Common Errors:**  
- `401` (Unauthorized)  
- `403` (Forbidden)  
- `404` (Business not found)  
- `422` (Validation Error)  
- `500` (Internal Server Error / AI Generation Failed)  

---

### Save Post

**Method:** `POST`  
**Full URL:** `{{BASE_URL}}/businesses/{{BUSINESS_ID}}/posts`  
**Purpose:** Save a new social media post to the business.  

**Required Headers:**  
- `Content-Type: application/json`  
- `Authorization: Bearer {{JWT_TOKEN}}`  

**Request Body:**  
```json
{
  "title": "Bandra Launch",
  "content": "Discover true luxury in the heart of Bandra! 🏙️✨ #LuxuryLiving #MumbaiRealEstate",
  "platform": "instagram",
  "hashtags": ["#LuxuryLiving", "#MumbaiRealEstate"],
  "mediaUrls": ["https://example.com/image1.jpg"],
  "aiGenerated": false
}
```

**Successful Response (201):**  
```json
{
  "success": true,
  "message": "Post saved successfully.",
  "data": {
    "_id": "64pqr456...",
    "businessId": "64xyz987...",
    "title": "Bandra Launch",
    "content": "Discover true luxury in the heart of Bandra! 🏙️✨ #LuxuryLiving #MumbaiRealEstate",
    "status": "draft",
    "platform": "instagram"
  }
}
```

**Variables to Save:**  
- Save `data._id` as `POST_ID`  

**Common Errors:**  
- `401` (Unauthorized)  
- `403` (Forbidden)  
- `404` (Business not found)  
- `422` (Validation Error)  

---

### List Posts

**Method:** `GET`  
**Full URL:** `{{BASE_URL}}/businesses/{{BUSINESS_ID}}/posts`  
**Purpose:** Get all posts for the business.  

**Required Headers:**  
- `Authorization: Bearer {{JWT_TOKEN}}`  

**Request Body:** None  

**Successful Response (200):**  
```json
{
  "success": true,
  "message": "Posts fetched successfully.",
  "data": [
    {
      "_id": "64pqr456...",
      "title": "Bandra Launch",
      "status": "draft",
      "platform": "instagram"
    }
  ]
}
```

**Variables to Save:**  
- Save `data[0]._id` as `POST_ID` (if not saved earlier)  

**Common Errors:**  
- `401` (Unauthorized)  
- `403` (Forbidden)  
- `404` (Business not found)  

---

### Get Single Post

**Method:** `GET`  
**Full URL:** `{{BASE_URL}}/businesses/{{BUSINESS_ID}}/posts/{{POST_ID}}`  
**Purpose:** Fetch a specific post.  

**Required Headers:**  
- `Authorization: Bearer {{JWT_TOKEN}}`  

**Request Body:** None  

**Successful Response (200):**  
```json
{
  "success": true,
  "message": "Post fetched successfully.",
  "data": {
    "_id": "64pqr456...",
    "title": "Bandra Launch",
    "content": "Discover true luxury in the heart of Bandra! 🏙️✨ #LuxuryLiving #MumbaiRealEstate"
  }
}
```

**Variables to Save:** None  

**Common Errors:**  
- `401` (Unauthorized)  
- `403` (Forbidden)  
- `404` (Post/Business not found)  

---

### Update Post

**Method:** `PATCH`  
**Full URL:** `{{BASE_URL}}/businesses/{{BUSINESS_ID}}/posts/{{POST_ID}}`  
**Purpose:** Update an existing post.  

**Required Headers:**  
- `Content-Type: application/json`  
- `Authorization: Bearer {{JWT_TOKEN}}`  

**Request Body:**  
```json
{
  "content": "Updated content: Discover true luxury in the heart of Bandra! 🏙️✨",
  "status": "draft"
}
```
*(Note: Only draft status can be set manually. Scheduled and published are managed by the system.)*

**Successful Response (200):**  
```json
{
  "success": true,
  "message": "Post updated successfully.",
  "data": {
    "_id": "64pqr456...",
    "content": "Updated content: Discover true luxury in the heart of Bandra! 🏙️✨"
  }
}
```

**Variables to Save:** None  

**Common Errors:**  
- `401` (Unauthorized)  
- `403` (Forbidden)  
- `404` (Post/Business not found)  
- `422` (Validation Error)  

---

### Duplicate Post

**Method:** `POST`  
**Full URL:** `{{BASE_URL}}/businesses/{{BUSINESS_ID}}/posts/{{POST_ID}}/duplicate`  
**Purpose:** Create a duplicate of an existing post.  

**Required Headers:**  
- `Authorization: Bearer {{JWT_TOKEN}}`  

**Request Body:** None  

**Successful Response (201):**  
```json
{
  "success": true,
  "message": "Post duplicated successfully.",
  "data": {
    "_id": "64stu789...",
    "title": "Bandra Launch",
    "content": "Updated content: Discover true luxury in the heart of Bandra! 🏙️✨",
    "status": "draft"
  }
}
```

**Variables to Save:**  
- Optionally update `POST_ID` to `data._id` for testing operations on the copy.  

**Common Errors:**  
- `401` (Unauthorized)  
- `403` (Forbidden)  
- `404` (Post/Business not found)  

---

### Delete Post

**Method:** `DELETE`  
**Full URL:** `{{BASE_URL}}/businesses/{{BUSINESS_ID}}/posts/{{POST_ID}}`  
**Purpose:** Delete a post.  

**Required Headers:**  
- `Authorization: Bearer {{JWT_TOKEN}}`  

**Request Body:** None  

**Successful Response (204):**  
*(No Content)*

**Variables to Save:** None  

**Common Errors:**  
- `401` (Unauthorized)  
- `403` (Forbidden)  
- `404` (Post/Business not found)  

---

### Delete Business (Optional Cleanup)

**Method:** `DELETE`  
**Full URL:** `{{BASE_URL}}/businesses/{{BUSINESS_ID}}`  
**Purpose:** Delete the entire business and cascade deletes if handled.  

**Required Headers:**  
- `Authorization: Bearer {{JWT_TOKEN}}`  

**Request Body:** None  

**Successful Response (204):**  
*(No Content)*

**Variables to Save:** None  

**Common Errors:**  
- `401` (Unauthorized)  
- `403` (Forbidden)  
- `404` (Business not found)  

---

## 5. Testing Flow

To ensure everything is working correctly, go through this checklist sequentially in Postman:

- [ ] Health
- [ ] Register
- [ ] Login
- [ ] Get Me
- [ ] Forgot Password
- [ ] Reset Password
- [ ] Create Business
- [ ] List Businesses
- [ ] Get Single Business
- [ ] Update Business
- [ ] Update Settings
- [ ] Get Members
- [ ] Dashboard Summary
- [ ] Generate AI Posts
- [ ] Save Post
- [ ] List Posts
- [ ] Get Single Post
- [ ] Update Post
- [ ] Duplicate Post
- [ ] Delete Post
- [ ] Delete Business

---

## 6. Postman Tips

- **Update `JWT_TOKEN`**: After a successful `Register` or `Login`, copy the `token` from the response `data` object and update your environment variable.
- **Update `BUSINESS_ID`**: After a successful `Create Business`, copy the `_id` from the response `data` object. All business-related and post-related endpoints require this in the URL.
- **Update `POST_ID`**: After a successful `Save Post` or `List Posts`, copy a post `_id`. You'll need this to test specific post endpoints.

---

## 7. Final Verification

**Backend Successfully Tested**

If every request succeeds in the order listed above, the backend is fully functional, properly secured, and production-ready for frontend integration. All validation rules, relationships, and authorization checks are working as expected.
