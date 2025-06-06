const express = require('express');
const {
  getAllUsers,
  deleteUser,
  markParcelAsReturned, deleteParcelById, updateParcelById, getParcelById,
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
  getAllPickupRequests,
  assignDriver,updateParcelStatus

} = require('../controllers/adminController');

const authMiddleware = require('../middleware/auth');
const { getRealTimeLocation } = require('../controllers/merchantController');
const { sendNotification } = require('../controllers/parcelController');

const router = express.Router();

// ✅ User Management APIs
router.get('/users', authMiddleware(['admin']), getAllUsers);
router.delete('/users/:userId', authMiddleware(['admin']), deleteUser);

// ✅ Parcel Management APIs
router.get('/parcels', authMiddleware(['admin']), getAllParcels);
router.get('/orders', authMiddleware(['admin']), getAllOrders);

router.get('/drivers', authMiddleware(['admin']), getAllDrivers);
router.get('/pickups', authMiddleware(['admin']), getAllPickupRequests);
// Assign Driver to Parcel
router.put('/assign-driver', authMiddleware(['admin']), assignDriver);
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
// Parcel management routes (to be implemented in controller)
router.get('/parcels/:id', authMiddleware(['admin']), getParcelById); // optional
router.put('/parcels/:id', authMiddleware(['admin']), updateParcelById);
router.delete('/parcels/:id', authMiddleware(['admin']), deleteParcelById);

router.patch('/parcels/:id/return', authMiddleware(['admin']), markParcelAsReturned);
router.patch('/parcels/:id/status', authMiddleware(['admin']), updateParcelStatus);
// ✅ Real-Time Tracking API
router.get('/real-time-location/:parcelId', authMiddleware(['driver', 'admin']), getRealTimeLocation);

// ✅ Notification API
router.post('/send-notification', authMiddleware(['admin', 'merchant']), sendNotification);

module.exports = router;
