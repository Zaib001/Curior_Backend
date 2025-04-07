const User = require('../models/User');
const Order = require('../models/Order');
const Parcel = require('../models/Parcel');
const PickupRequest = require('../models/PickupRequest');
const { generateCSV } = require('../utils/generateCSV');
const sendEmail = require('../config/email')

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude password for security
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.exportRevenueReportCSV = async (req, res) => {
  try {
    const report = await Order.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalRevenue: { $sum: "$amount" },
        }
      }
    ]);

    const fields = [
      { label: 'Month', key: '_id' },
      { label: 'Total Revenue', key: 'totalRevenue' }
    ];

    require('../utils/generateCSV').generateCSV(report, fields, 'revenue_report', res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getAllParcels = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOption = { [sortBy]: order === 'asc' ? 1 : -1 };

    const parcels = await Parcel.find()
      .populate('sender', 'name email')   // if sender field is correct
      .populate('driverId', 'name email') // if driverId is the correct field
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const totalParcels = await Parcel.countDocuments();

    res.json({
      totalPages: Math.ceil(totalParcels / limit),
      currentPage: parseInt(page),
      totalParcels,
      data: parcels,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getAllDrivers = async (req, res) => {
  try {
    const drivers = await User.find({ role: 'driver' }).select('_id name email');
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Assign Driver to Parcel
exports.assignDriverToParcels = async (req, res) => {
  const { parcelIds, driverId } = req.body;
  if (!parcelIds?.length || !driverId)
    return res.status(400).json({ message: 'Parcel IDs and Driver ID are required' });

  try {
    const result = await Parcel.updateMany(
      { _id: { $in: parcelIds } },
      { driverId }
    );
    res.json({ message: 'Driver assigned successfully', result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOption = { [sortBy]: order === 'asc' ? 1 : -1 };

    const orders = await Order.find()
      .populate('merchantId', 'name email')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const totalOrders = await Order.countDocuments();

    res.json({
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: parseInt(page),
      totalOrders,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRevenueReport = async (req, res) => {
  try {
    const report = await Order.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: "$amount" } } }
    ]);

    res.json(report.length ? report[0] : { totalRevenue: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getOrderStatusReport = async (req, res) => {
  try {
    const report = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getDeliveryTimeReport = async (req, res) => {
  try {
    const report = await Parcel.aggregate([
      {
        $match: { status: 'Delivered' }
      },
      {
        $project: {
          trackingId: 1,
          deliveryTimeInDays: {
            $divide: [
              { $subtract: ["$updatedAt", "$createdAt"] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      }
    ]);

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMonthlyRevenueReport = async (req, res) => {
  try {
    const report = await Order.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalRevenue: { $sum: "$amount" },
        },
      },
      { $sort: { "_id": 1 } }
    ]);

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getTopMerchants = async (req, res) => {
  try {
    const report = await Order.aggregate([
      {
        $group: {
          _id: "$merchantId",
          totalOrders: { $sum: 1 }
        }
      },
      { $sort: { totalOrders: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'merchant'
        }
      },
      {
        $project: {
          merchantName: { $arrayElemAt: ['$merchant.name', 0] },
          totalOrders: 1
        }
      }
    ]);

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getParcelStatusTrends = async (req, res) => {
  try {
    const report = await Parcel.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getRevenueReportByDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};

    if (startDate && endDate) {
      filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const report = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" }
        }
      }
    ]);

    res.json(report.length ? report[0] : { totalRevenue: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getParcelStatusReportByDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};

    if (startDate && endDate) {
      filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const report = await Parcel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.exportParcelStatusCSV = async (req, res) => {
  try {
    const report = await Parcel.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const fields = [
      { label: 'Status', key: '_id' },
      { label: 'Count', key: 'count' }
    ];

    require('../utils/generateCSV').generateCSV(report, fields, 'parcel_status_report', res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getAverageDeliveryTime = async (req, res) => {
  try {
    const report = await Parcel.aggregate([
      { $match: { status: 'Delivered' } },
      {
        $project: {
          deliveryTime: {
            $divide: [
              { $subtract: ["$deliveredAt", "$createdAt"] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDeliveryTime: { $avg: "$deliveryTime" }
        }
      }
    ]);

    res.json(report.length ? report[0] : { avgDeliveryTime: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getOrderValueInsights = async (req, res) => {
  try {
    const highestOrder = await Order.findOne().sort({ amount: -1 });
    const lowestOrder = await Order.findOne().sort({ amount: 1 });

    res.json({ highestOrder, lowestOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.emailRevenueReport = async (req, res) => {
  try {
    const report = await Order.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalRevenue: { $sum: "$amount" }
        }
      }
    ]);

    const fields = [
      { label: 'Month', key: '_id' },
      { label: 'Total Revenue', key: 'totalRevenue' }
    ];

    const filename = 'revenue_report.csv';
    const csvBuffer = await generateCSV(report, fields, filename);

    await sendEmail(
      req.body.email,
      'Monthly Revenue Report',
      'Please find the attached revenue report.',
      [{ filename, content: csvBuffer }]
    );

    res.json({ message: 'Revenue report sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all pickup requests (admin view)
exports.getAllPickupRequests = async (req, res) => {
  try {
    const requests = await PickupRequest.find().populate('merchantId', 'name email');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markParcelAsReturned = async (req, res) => {
  try {
    const parcel = await Parcel.findById(req.params.id);
    if (!parcel) return res.status(404).json({ message: 'Parcel not found' });
    parcel.currentStatus = 'Returned';
    await parcel.save();
    res.json({ message: 'Parcel marked as returned', data: parcel });
  } catch (error) {
    res.status(500).json({ message: 'Error updating status', error });
  }
};
exports.markParcelAsReturned = async (req, res) => {
  try {
    const parcel = await Parcel.findById(req.params.id);
    if (!parcel) return res.status(404).json({ message: 'Parcel not found' });
    parcel.currentStatus = 'Returned';
    await parcel.save();
    res.json({ message: 'Parcel marked as returned', data: parcel });
  } catch (error) {
    res.status(500).json({ message: 'Error updating status', error });
  }
};
exports.updateParcelById = async (req, res) => {
  try {
    const updated = await Parcel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Parcel not found' });
    res.json({ message: 'Parcel updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error updating parcel', error });
  }
};
exports.getParcelById = async (req, res) => {
  try {
    const parcel = await Parcel.findById(req.params.id);
    if (!parcel) return res.status(404).json({ message: 'Parcel not found' });
    res.json(parcel);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching parcel', error });
  }
};
exports.deleteParcelById = async (req, res) => {
  try {
    const deleted = await Parcel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Parcel not found' });
    res.json({ message: 'Parcel deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting parcel', error });
  }
};
