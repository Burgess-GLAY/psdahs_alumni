# PSDAHS Alumni Portal - API Usage Guide

## ✅ SYSTEM STATUS: FULLY OPERATIONAL

Backend: http://localhost:5000  
Admin Email: burgessglay12@gmail.com  
Admin Password: Carp12345@

---

## 🔐 Authentication Flow

### 1. Login (Get Token)
**Endpoint:** `POST /api/auth/login`  
**Access:** Public

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "burgessglay12@gmail.com",
    "password": "Carp12345@"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Copy the token** and use it in the `x-auth-token` header for protected routes.

---

### 2. Register New User
**Endpoint:** `POST /api/auth/register`  
**Access:** Public

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "graduationYear": 2020
  }'
```

---

### 3. Get Current User Info
**Endpoint:** `GET /api/auth/me`  
**Access:** Private (requires token)

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "x-auth-token: YOUR_TOKEN_HERE"
```

---

## 👥 Users Management

### Get All Users (Admin)
**Endpoint:** `GET /api/users`  
**Access:** Admin

```bash
curl -X GET http://localhost:5000/api/users \
  -H "x-auth-token: YOUR_TOKEN_HERE"
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `search` - Search by name or email
- `graduationYear` - Filter by year

**Example with filters:**
```bash
curl -X GET "http://localhost:5000/api/users?page=1&limit=10&search=john" \
  -H "x-auth-token: YOUR_TOKEN_HERE"
```

---

### Get User by ID (Admin)
**Endpoint:** `GET /api/users/:id`  
**Access:** Admin

```bash
curl -X GET http://localhost:5000/api/users/USER_ID_HERE \
  -H "x-auth-token: YOUR_TOKEN_HERE"
```

---

### Update User (Admin)
**Endpoint:** `PUT /api/users/:id`  
**Access:** Admin

```bash
curl -X PUT http://localhost:5000/api/users/USER_ID_HERE \
  -H "x-auth-token: YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated",
    "lastName": "Name",
    "isVerified": true
  }'
```

---

### Get My Profile
**Endpoint:** `GET /api/users/me`  
**Access:** Private

```bash
curl -X GET http://localhost:5000/api/users/me \
  -H "x-auth-token: YOUR_TOKEN_HERE"
```

---

### Update My Profile
**Endpoint:** `PUT /api/users/me`  
**Access:** Private

```bash
curl -X PUT http://localhost:5000/api/users/me \
  -H "x-auth-token: YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1234567890",
    "bio": "Updated bio",
    "occupation": "Software Engineer"
  }'
```

---

## 🎓 Alumni Management

### Get All Alumni (Admin)
**Endpoint:** `GET /api/alumni`  
**Access:** Admin

```bash
curl -X GET http://localhost:5000/api/alumni \
  -H "x-auth-token: YOUR_TOKEN_HERE"
```

---

### Get Alumni Statistics (Admin)
**Endpoint:** `GET /api/alumni/stats`  
**Access:** Admin

```bash
curl -X GET http://localhost:5000/api/alumni/stats \
  -H "x-auth-token: YOUR_TOKEN_HERE"
```

---

### Update Alumni Profile (Admin)
**Endpoint:** `PUT /api/alumni/:id`  
**Access:** Admin

```bash
curl -X PUT http://localhost:5000/api/alumni/USER_ID_HERE \
  -H "x-auth-token: YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated",
    "lastName": "Alumni"
  }'
```

---

## 📅 Events Management

### Get All Events
**Endpoint:** `GET /api/events`  
**Access:** Public

```bash
curl -X GET http://localhost:5000/api/events
```

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page
- `type` - Event type
- `search` - Search term
- `upcoming=true` - Only upcoming events

---

### Get Upcoming Events
**Endpoint:** `GET /api/events/upcoming`  
**Access:** Public

```bash
curl -X GET http://localhost:5000/api/events/upcoming
```

---

### Create Event (Admin)
**Endpoint:** `POST /api/events`  
**Access:** Admin

```bash
curl -X POST http://localhost:5000/api/events \
  -H "x-auth-token: YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Alumni Reunion 2025",
    "description": "Annual alumni gathering",
    "startDate": "2025-12-01T10:00:00Z",
    "endDate": "2025-12-01T18:00:00Z",
    "location": "Main Campus",
    "eventType": "reunion",
    "isPublished": true
  }'
```

---

### Register for Event
**Endpoint:** `POST /api/events/:id/register`  
**Access:** Private

```bash
curl -X POST http://localhost:5000/api/events/EVENT_ID_HERE/register \
  -H "x-auth-token: YOUR_TOKEN_HERE"
```

---

## 💰 Donations

### Process Donation
**Endpoint:** `POST /api/donations`  
**Access:** Private

```bash
curl -X POST http://localhost:5000/api/donations \
  -H "x-auth-token: YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "paymentMethod": "credit_card",
    "purpose": "scholarship_fund",
    "isAnonymous": false,
    "notes": "For student scholarships"
  }'
```

---

### Get All Donations (Admin)
**Endpoint:** `GET /api/donations`  
**Access:** Admin

```bash
curl -X GET http://localhost:5000/api/donations \
  -H "x-auth-token: YOUR_TOKEN_HERE"
```

---

### Get My Donations
**Endpoint:** `GET /api/donations/user/me`  
**Access:** Private

```bash
curl -X GET http://localhost:5000/api/donations/user/me \
  -H "x-auth-token: YOUR_TOKEN_HERE"
```

---

## 🔧 Admin Tools

### Health Check
**Endpoint:** `GET /api/admin/health`  
**Access:** Public

```bash
curl -X GET http://localhost:5000/api/admin/health
```

---

### Promote User to Admin
**Endpoint:** `POST /api/admin/users/:id/promote`  
**Access:** Admin

```bash
curl -X POST http://localhost:5000/api/admin/users/USER_ID_HERE/promote \
  -H "x-auth-token: YOUR_TOKEN_HERE"
```

---

## 🚨 Common Issues & Solutions

### Issue: "Cannot GET /api/auth/login"
**Solution:** Use POST, not GET. Login requires sending credentials in request body.

```bash
# ❌ WRONG
curl -X GET http://localhost:5000/api/auth/login

# ✅ CORRECT
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"...","password":"..."}'
```

---

### Issue: "No token, authorization denied"
**Solution:** Include the token in the header.

```bash
# ❌ WRONG
curl -X GET http://localhost:5000/api/users/me

# ✅ CORRECT
curl -X GET http://localhost:5000/api/users/me \
  -H "x-auth-token: YOUR_TOKEN_HERE"
```

---

## 🧪 Testing Your API

Run the test script to verify everything works:

```bash
node backend/test-api.js
```

Or test login only:

```bash
node backend/test-login-simple.js
```

---

## 📝 Notes

- **Token Expiration:** Tokens expire after 5 days
- **In-Memory Database:** Data is lost when server restarts (use real MongoDB for persistence)
- **Admin Auto-Seeding:** Root admin is created automatically on server startup
- **CORS:** Enabled for all origins in development

---

## 🎯 Quick Start Example

```bash
# 1. Login and get token
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"burgessglay12@gmail.com","password":"Carp12345@"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 2. Use token to get your profile
curl -X GET http://localhost:5000/api/users/me \
  -H "x-auth-token: $TOKEN"

# 3. Get all users (admin only)
curl -X GET http://localhost:5000/api/users \
  -H "x-auth-token: $TOKEN"
```

---

## ✅ System Ready!

Backend is running on: http://localhost:5000  
Frontend is running on: http://localhost:3001  

Your admin credentials:
- Email: burgessglay12@gmail.com
- Password: Carp12345@

All CRUD operations are functional and tested. Happy coding! 🚀
