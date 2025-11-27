# PSDAHS Alumni Platform - Backend

Production-ready Node.js backend API for the PSDAHS Alumni Management Platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB (optional - in-memory fallback available)

### Installation

```bash
# Install dependencies (from project root)
npm install

# Start backend server
npm run start:backend
```

Backend runs on `http://localhost:5000`

## 📋 Environment Setup

Create `.env` file in project root:

```env
# MongoDB connection (optional - uses in-memory DB if not provided)
# MONGODB_URI=mongodb://localhost:27017/psdahs-alumni

# Root admin credentials (auto-seeded on startup)
ROOT_ADMIN_EMAIL=burgessglay12@gmail.com
ROOT_ADMIN_PASSWORD=Carp12345@

# JWT secret for authentication
JWT_SECRET=supersecret_local_dev_key

# Optional: Production mode
# NODE_ENV=production
```

## 🔑 Default Admin Access

**Email:** `burgessglay12@gmail.com`  
**Password:** `Carp12345@`

Auto-seeded on server startup. Change credentials in `.env`.

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /me` - Get current user (Protected)

### Users (`/api/users`)
- `GET /me` - Get my profile (Protected)
- `PUT /me` - Update my profile (Protected)
- `PUT /change-password` - Change password (Protected)
- `GET /` - List all users (Admin)
- `GET /stats` - User statistics (Admin)
- `GET /:id` - Get user by ID (Admin)
- `PUT /:id` - Update user (Admin)
- `DELETE /:id` - Delete user (Admin)

### Events (`/api/events`)
- `GET /` - List all events (Public)
- `GET /upcoming` - Get upcoming events (Public)
- `GET /user/registered` - My registered events (Protected)
- `GET /:id` - Get event details (Public)
- `POST /` - Create event (Admin)
- `PUT /:id` - Update event (Admin)
- `DELETE /:id` - Delete event (Admin)
- `POST /:id/register` - Register for event (Protected)
- `DELETE /:id/register` - Cancel registration (Protected)

### Donations (`/api/donations`)
- `POST /` - Process donation (Protected)
- `GET /user/me` - My donations (Protected)
- `GET /` - List all donations (Admin)
- `GET /stats` - Donation statistics (Admin)
- `GET /:id` - Get donation by ID (Protected)
- `PUT /:id/status` - Update donation status (Admin)

### Alumni (`/api/alumni`)
- `GET /` - List all alumni (Admin)
- `GET /stats` - Alumni statistics (Admin)
- `GET /:id` - Get alumnus profile (Admin)
- `PUT /:id` - Update alumnus (Admin)
- `DELETE /:id` - Delete alumnus (Admin)

### Admin (`/api/admin`)
- `GET /health` - Health check (Public)
- `POST /users/:id/promote` - Promote user to admin (Admin)
- `POST /users/:id/demote` - Demote admin to user (Admin)

## 🔐 Authentication

Protected routes require JWT token in header:

```bash
x-auth-token: <your-jwt-token>
```

## 📊 Database

### MongoDB Connection
- **Production:** Uses `MONGODB_URI` from `.env`
- **Development:** Auto-fallback to in-memory MongoDB if connection fails
- **In-Memory:** Perfect for local dev, resets on restart

### Models
- **User** - Alumni profiles with auth
- **Event** - Alumni events and registrations
- **Donation** - Donation tracking (simulated payment)
- **AlumniClass** - Class-specific data and representatives
- **Announcement** - Platform announcements

## 🛠️ Development Scripts

```bash
# Start backend server
npm run start:backend

# Seed admin user manually
npm run seed:admin
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### MongoDB Connection Issues
- Ensure MongoDB is running OR
- Remove `MONGODB_URI` from `.env` to use in-memory DB

### Authentication Errors
- Verify JWT token in `x-auth-token` header
- Check token expiration (5 days default)
- Re-login to get fresh token

## 📦 Dependencies

### Core
- **express** - Web framework
- **mongoose** - MongoDB ODM
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **cors** - CORS middleware
- **dotenv** - Environment variables

### Validation & Security
- **express-validator** - Input validation
- **validator** - String validation

### Development
- **mongodb-memory-server** - In-memory MongoDB
- **axios** - HTTP client for testing

## 🏗️ Architecture

```
backend/
├── controllers/       # Business logic
├── models/           # Database schemas
├── routes/           # API route definitions
├── middleware/       # Auth & error handling
├── scripts/          # Utility scripts
└── server.js         # Entry point
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control (Admin/User)
- Input validation on all endpoints
- CORS protection
- Secure error handling

## 🚀 Production Deployment

1. Set `NODE_ENV=production` in environment
2. Use real MongoDB instance (set `MONGODB_URI`)
3. Generate strong `JWT_SECRET`
4. Configure proper CORS origins
5. Enable HTTPS
6. Set secure admin credentials

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

### Paginated Response
```json
{
  "success": true,
  "count": 10,
  "total": 100,
  "totalPages": 10,
  "currentPage": 1,
  "data": [ /* items */ ]
}
```

## 🧪 Testing

```bash
# Login test
node backend/test-login-simple.js

# Full API test suite
node backend/test-api.js
```

## 📞 Support

For issues or questions, contact the development team.

---

⚡ **Production-ready. Zero compromises. Ship ready.**
