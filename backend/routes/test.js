const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Test database connection
router.get('/test-db', async (req, res) => {
  try {
    // Check if mongoose is connected
    const isConnected = mongoose.connection.readyState === 1;
    
    if (!isConnected) {
      return res.status(500).json({
        success: false,
        message: 'Database not connected',
        connectionState: mongoose.connection.readyState
      });
    }

    // Try to run a simple query
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    res.json({
      success: true,
      message: 'Database connection successful',
      database: db.databaseName,
      collections: collections.map(c => c.name)
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection test failed',
      error: error.message
    });
  }
});

module.exports = router;
