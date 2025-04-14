const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Middleware to check JWT and attach req.user
const {
  getDriverParcels,
  updateParcelStatus
} = require('../controllers/driverController');

// 📨 GET all parcels assigned to the logged-in driver
router.get('/parcels', auth('driver'), getDriverParcels);

// 🔁 Update the status of a specific parcel
router.patch('/parcels/:id/status', auth('driver'), updateParcelStatus);

module.exports = router;
