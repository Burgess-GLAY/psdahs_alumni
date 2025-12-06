require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
let memoryServer = null;
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const eventRoutes = require('./routes/events');
const donationRoutes = require('./routes/donations');
const adminRoutes = require('./routes/admin');
const alumniRoutes = require('./routes/alumni');
const classGroupRoutes = require('./routes/classGroups');
const groupPostRoutes = require('./routes/groupPosts');
const { errorHandler } = require('./middleware/errorHandler');
const albumRoutes = require('./routes/albums');
const testRoutes = require('./routes/test');
const userClassGroupRoutes = require('./routes/userClassGroups');
const announcementRoutes = require('./routes/announcements');
const communityRoutes = require('./routes/community');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from backend uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from frontend/public
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Serve images from frontend/public/images
app.use('/images', express.static(path.join(__dirname, '../frontend/public/images')));

// Log static file requests for debugging
app.use('/images', (req, res, next) => {
  console.log(`Image requested: ${req.url}`);
  next();
});

// Database connection with dev fallback to in-memory server
async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/psdahs_alumni?directConnection=true';
  const options = {
    dbName: 'psdahs_alumni',
    useNewUrlParser: true,
    useUnifiedTopology: true
  };

  console.log('Attempting to connect to MongoDB...');
  console.log('Connection URI:', uri);
  console.log('Connection options:', JSON.stringify(options, null, 2));

  try {
    const connection = await mongoose.connect(uri, options);
    console.log('MongoDB connected successfully!');
    console.log('MongoDB connection details:', {
      host: connection.connection.host,
      port: connection.connection.port,
      name: connection.connection.name,
      db: connection.connection.db.databaseName,
      collections: await connection.connection.db.listCollections().toArray()
    });

    // Add event listeners for connection
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to DB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected');
    });

  } catch (err) {
    console.error('MongoDB connection error:', {
      message: err.message,
      code: err.code,
      codeName: err.codeName,
      name: err.name,
      stack: err.stack
    });
    process.exit(1);
  }
}

// Auto-seed admin on startup
async function seedAdminUser() {
  const User = require('./models/User');
  const adminEmail = process.env.ROOT_ADMIN_EMAIL || 'root@psdahs.local';
  const password = process.env.ROOT_ADMIN_PASSWORD || 'Carp12345@';

  try {
    let user = await User.findOne({ email: adminEmail });
    if (!user) {
      user = new User({
        firstName: 'Root',
        lastName: 'Admin',
        email: adminEmail,
        password,
        graduationYear: 1900,
        isAdmin: true,
        isVerified: true,
      });
      await user.save();
      console.log('Auto-seeded root admin:', adminEmail);
    } else if (!user.isAdmin || !user.isVerified) {
      // Update existing user to ensure admin and verified status
      user.isAdmin = true;
      user.isVerified = true;
      await user.save();
      console.log('Updated existing admin user:', adminEmail);
    }
  } catch (err) {
    console.error('Auto-seed admin failed:', err.message);
  }
}

// Ensure Burgess admin exists
async function seedBurgessAdmin() {
  const User = require('./models/User');
  const adminEmail = 'burgessglay12@gmail.com';
  const password = process.env.BURGESS_ADMIN_PASSWORD || 'Carp12345@';
  try {
    let user = await User.findOne({ email: adminEmail });
    if (!user) {
      user = new User({
        firstName: 'Burgess Awalayah',
        lastName: 'Glay',
        email: adminEmail,
        password,
        graduationYear: 2008,
        isAdmin: true,
        isVerified: true,
      });
      await user.save();
      console.log('Seeded Burgess admin:', adminEmail);
    } else {
      user.isAdmin = true; user.isVerified = true; await user.save();
      console.log('Ensured Burgess admin privileges:', adminEmail);
    }
  } catch (err) { console.error('Seed Burgess admin failed:', err.message); }
}

connectDB().then(() => { seedAdminUser(); seedBurgessAdmin(); });

// Test route to verify image serving
app.get('/test-image', (req, res) => {
  const imagePath = path.join(__dirname, '../frontend/public/images/class-of-2019-2020.jpeg');
  res.sendFile(imagePath);
});

// Routes
app.use('/api/announcements', announcementRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/test', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/class-groups', classGroupRoutes);
app.use('/api', groupPostRoutes);
app.use('/api', albumRoutes);
app.use('/api', userClassGroupRoutes);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
