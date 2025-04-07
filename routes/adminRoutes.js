const express = require('express');
const {
  getAllUsers,
  deleteUser,
  getAllParcels,
  getAllOrders,
  getRevenueReport,
  getOrderStatusReport,
  getDeliveryTimeReport,
  getMonthlyRevenueReport,
  getTopMerchants,
  getParcelStatusTrends,
  getRevenueReportByDate,
  getParcelStatusReportByDate,
  exportRevenueReportCSV,
  exportParcelStatusCSV,
  getAverageDeliveryTime,
  getOrderValueInsights,
  getAllDrivers,
  assignDriverToParcel,
  getAllPickupRequests

} = require('../controllers/adminController');

const authMiddleware = require('../middleware/auth');
const { getRealTimeLocation } = require('../controllers/merchantController');
const { assignDriver, sendNotification } = require('../controllers/parcelController');

const router = express.Router();

// ✅ User Management APIs
router.get('/users', authMiddleware(['admin']), getAllUsers);
router.delete('/users/:userId', authMiddleware(['admin']), deleteUser);

// ✅ Parcel Management APIs
router.get('/parcels', authMiddleware(['admin']), getAllParcels);
router.get('/orders', authMiddleware(['admin']), getAllOrders);
router.get('/pickups', authMiddleware(['admin']),getAllPickupRequests);
router.get('/drivers', authMiddleware(['admin']), getAllDrivers);
// Assign Driver to Parcel
router.put('/parcels/:parcelId/assign-driver', authMiddleware(['admin']), assignDriverToParcel);
// ✅ Reports APIs
router.get('/reports/revenue', authMiddleware(['admin']), getRevenueReport);
router.get('/reports/status', authMiddleware(['admin']), getOrderStatusReport);
router.get('/reports/delivery-time', authMiddleware(['admin']), getDeliveryTimeReport);
router.get('/reports/monthly-revenue', authMiddleware(['admin']), getMonthlyRevenueReport);
router.get('/reports/top-merchants', authMiddleware(['admin']), getTopMerchants);
router.get('/reports/parcel-status-trends', authMiddleware(['admin']), getParcelStatusTrends);
router.get('/reports/revenue-date', authMiddleware(['admin']), getRevenueReportByDate);
router.get('/reports/status-date', authMiddleware(['admin']), getParcelStatusReportByDate);
router.get('/reports/revenue-csv', authMiddleware(['admin']), exportRevenueReportCSV);
router.get('/reports/status-csv', authMiddleware(['admin']), exportParcelStatusCSV);
router.get('/reports/average-delivery-time', authMiddleware(['admin']), getAverageDeliveryTime);
router.get('/reports/order-value-insights', authMiddleware(['admin']), getOrderValueInsights);
router.delete('/users/:id', authMiddleware(['admin']), deleteUser);

// ✅ Real-Time Tracking API
router.get('/real-time-location/:parcelId', authMiddleware(['driver', 'admin']), getRealTimeLocation);

// ✅ Parcel Assignment API
router.put('/:id/assign', authMiddleware(['admin']), assignDriver);

// ✅ Notification API
router.post('/send-notification', authMiddleware(['admin', 'merchant']), sendNotification);

module.exports = router;
