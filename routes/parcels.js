const express = require('express');
const { createParcel, assignDriver, updateStatus, trackParcel,sendNotification, generateLabel } = require('../controllers/parcelController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.post('/', authMiddleware(['merchant']), createParcel);
router.put('/:id/assign', authMiddleware(['admin']), assignDriver);
router.put('/:id/status', authMiddleware(['driver']), updateStatus);
router.get('/parcels/:id/label', authMiddleware(['merchant']), generateLabel);
router.get('/track/:trackingId', trackParcel);
router.post('/send-notification', authMiddleware(['admin', 'merchant']), sendNotification);

module.exports = router;
        