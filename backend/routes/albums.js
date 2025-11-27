const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getGroupAlbums, createGroupAlbum } = require('../controllers/albumController');

router.get('/class-groups/:id/albums', protect, getGroupAlbums);
router.post('/class-groups/:id/albums', protect, createGroupAlbum);

module.exports = router;
