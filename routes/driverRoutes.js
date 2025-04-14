const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Middleware to check JWT and attach req.user
const {
  getDriverParcels,
  updateParcelStatus,updateParcelLocation,getTrackingInfo
} = require('../controllers/driverController');

// 📨 GET all parcels assigned to the logged-in driver
router.get('/parcels', auth('driver'), getDriverParcels);
router.get('/track/:trackingId', auth('driver'), getTrackingInfo);

// 🔁 Update the status of a specific parcel
router.patch('/parcels/:id/status', auth('driver'), updateParcelStatus);
router.patch('/parcels/:id/location', auth('driver'), updateParcelLocation);

module.exports = router;
