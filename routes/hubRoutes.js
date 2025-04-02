const express = require('express');
const router = express.Router();
const hubController = require('../controllers/hubController');
const auth = require('../middleware/auth');

router.get('/status-summary', auth(['hub_staff']), hubController.getHubStatusSummary);
router.get('/parcels', auth(['hub_staff']), hubController.getParcelsByStatus);
router.put('/:id/at-hub', auth(['hub_staff']), hubController.markParcelAtHub);
router.put('/:id/dispatch', auth(['hub_staff']), hubController.dispatchParcel);
router.put('/:id/return', auth(['hub_staff']), hubController.markParcelReturned);
router.get('/real-time-location/:parcelId', auth(['hub_staff', 'admin']), hubController.getRealTimeLocation);
router.put('/:id/status', auth(['hub_staff']), hubController.updateParcelStatus);

module.exports = router;
