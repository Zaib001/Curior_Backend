const express = require('express');
const router = express.Router();
const {
  getAssignedParcels,
  getRealTimeLocation,
  optimizeRoute,
  updateParcelStatus
} = require('../controllers/driverController');

const authMiddleware = require('../middleware/auth'); // JWT middleware

// All routes protected for driver role
router.get('/assigned', authMiddleware(['driver']), getAssignedParcels);
router.get('/real-time-location/:parcelId', authMiddleware(['driver']), getRealTimeLocation);
router.post('/optimize-route', authMiddleware(['driver']), optimizeRoute);
router.put('/:parcelId/status', authMiddleware(['driver']), updateParcelStatus);

module.exports = router;
