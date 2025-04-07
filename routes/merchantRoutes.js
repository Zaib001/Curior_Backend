const express = require('express');
const { createOrder, getOrders,createParcelsBulk, trackParcelPublicly,getParcels,optimizeRoute, getAnalytics,updateOrderStatus,searchOrders,getRealTimeLocation, createPickupRequest, getPickupRequests } = require('../controllers/merchantController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Merchant Routes
router.get('/parcels', authMiddleware(['merchant']), getParcels); 
router.post('/orders', authMiddleware(['merchant']), createOrder);
router.get('/orders', authMiddleware(['merchant']), getOrders);
router.post('/pickups', authMiddleware(['merchant']), createPickupRequest);
router.get('/pickups', authMiddleware(['merchant']), getPickupRequests);
router.put('/orders/:id/status', authMiddleware(['merchant']), updateOrderStatus);
router.get('/orders/search', authMiddleware(['merchant']), searchOrders);
router.post('/optimize-route', authMiddleware(['driver']), optimizeRoute);
router.get('/real-time-location/:parcelId', authMiddleware(['driver', 'admin']), getRealTimeLocation);
router.get('/track/:trackingId', authMiddleware(['merchant']), trackParcelPublicly);
router.get('/analytics', authMiddleware(['merchant']), getAnalytics);
router.post('/parcels/bulk', authMiddleware(['merchant']), createParcelsBulk);

module.exports = router;
