const Order = require('../models/Order');
const Parcel = require('../models/Parcel');
const PickupRequest = require('../models/PickupRequest');
const sendEmail = require('../config/email');
const axios = require('axios');
const checkIfWithinM25 = require('../utils/checkM25');


exports.getParcels = async (req, res) => {
  try {
    const parcels = await Parcel.find({ sender: req.user.userId }).sort({ createdAt: -1 });
    console.log(parcels)
    res.json(parcels);
  } catch (error) {
    console.error('Error fetching parcels:', error.message);
    res.status(500).json({ message: 'Server error while fetching parcels' });
  }
};
// Create Order
exports.createOrder = async (req, res) => {
  try {
    const { orderId, customerName, shippingAddress, items } = req.body;
   console.log(req.user.userId)
    const order = new Order({
      orderId,
      merchantId: req.user.userId,
      customerName,
      shippingAddress,
      items
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get Orders
exports.getOrders = async (req, res) => {
  try {
    console.log(req.user)
    const orders = await Order.find({ merchantId: req.user.userId });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// CREATE Pickup Request (multiple parcelIds)
exports.createPickupRequest = async (req, res) => {
  try {
    const { parcelIds, pickupDate, pickupTime, address } = req.body;

    if (!Array.isArray(parcelIds) || parcelIds.length === 0 || !pickupDate || !pickupTime || !address) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const pickup = new PickupRequest({
      merchantId: req.user.userId,
      parcelIds,
      pickupDate,
      pickupTime,
      address
    });

    await pickup.save();
    res.status(201).json(pickup);
  } catch (error) {
    console.error('Pickup request error:', error);
    res.status(500).json({ message: error.message });
  }
};

// GET Pickup Requests
exports.getPickupRequests = async (req, res) => {
  try {
    const requests = await PickupRequest.find({ merchantId: req.user.userId });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await sendEmail(order.shippingAddress, 'Order Status Update', `Your order is now ${status}`);
    res.json({ message: 'Order status updated and notification sent', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.searchOrders = async (req, res) => {
  try {
    const { status, customerName, orderId } = req.query;
    const query = { merchantId: req.user.userId };

    if (status) query.status = status;
    if (customerName) query.customerName = { $regex: customerName, $options: 'i' };
    if (orderId) query.orderId = orderId;

    const orders = await Order.find(query);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.optimizeRoute = async (req, res) => {
  try {
    const { stops, driverId } = req.body;

    if (!stops || !Array.isArray(stops) || stops.length < 2) {
      return res.status(400).json({ message: "Invalid stops data." });
    }

    // Circuit API URL and API Key
    const apiUrl = 'https://api.circuit.com/v1/route/optimize';
    const apiKey = process.env.CIRCUIT_API_KEY;

    const response = await axios.post(apiUrl, {
      stops,
      driverId,
    }, {
      headers: { Authorization: `Bearer ${apiKey}` }
    });

    res.json({ message: 'Route optimized successfully', data: response.data });
  } catch (error) {
    console.error('Error optimizing route:', error.message);
    res.status(500).json({ message: 'Failed to optimize route' });
  }
};
exports.getRealTimeLocation = async (req, res) => {
  try {
    const { parcelId } = req.params;
    const parcel = await Parcel.findById(parcelId);

    if (!parcel) {
      return res.status(404).json({ message: 'Parcel not found' });
    }

    // Simulated location data for real-time tracking
    const simulatedLocation = {
      lat: 51.509865 + (Math.random() * 0.02 - 0.01),
      lng: -0.118092 + (Math.random() * 0.02 - 0.01),
    };

    res.json({ parcelId, location: simulatedLocation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.trackParcelPublicly = async (req, res) => {
  try {
    const { trackingId } = req.params;
    const parcel = await Parcel.findOne({ trackingId });

    if (!parcel) {
      return res.status(404).json({ message: 'Tracking ID not found' });
    }

    res.json({
      trackingId,
      status: parcel.status,
      receiver: parcel.receiver,
      address: parcel.address,
      updatedAt: parcel.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getAnalytics = async (req, res) => {
  const merchantId = req.user.id;

  try {
    const totalOrders = await Order.countDocuments({ merchant: merchantId });
    const deliveredOrders = await Parcel.countDocuments({ merchant: merchantId, status: 'Delivered' });
    const inTransitParcels = await Parcel.countDocuments({ merchant: merchantId, status: 'In Transit' });
    const totalRevenue = await Order.aggregate([
      { $match: { merchant: merchantId, status: 'Delivered' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.status(200).json({
      totalOrders,
      deliveredOrders,
      inTransitParcels,
      totalRevenue: totalRevenue[0]?.total || 0,
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
exports.createParcelsBulk = async (req, res) => {
  try {
    const { parcels } = req.body;
    const senderId = req.user.userId;

    if (!Array.isArray(parcels) || parcels.length === 0) {
      return res.status(400).json({ message: 'No parcels provided.' });
    }

    const enrichedParcels = parcels.map((p) => ({
      trackingId: p['Parcel Reference']?.trim(),
      receiver: p['Recipient Name']?.trim(),
      address: `${p['Address Line 1']?.trim() || ''} ${p['Address Line 2']?.trim() || ''}, ${p['City']?.trim() || ''}`,
      postcode: p['Postcode']?.trim(),
      phone: p['Phone Number']?.trim() || '',
      deliveryType: 'Standard',
      sender: senderId,
      isWithinM25: checkIfWithinM25(p['Postcode']),
    }));

    // Optional validation: filter out entries missing required fields
    const validParcels = enrichedParcels.filter(p =>
      p.trackingId && p.receiver && p.address && p.postcode && typeof p.isWithinM25 === 'boolean'
    );

    if (validParcels.length === 0) {
      return res.status(400).json({ message: 'No valid parcels to insert.' });
    }

    const created = await Parcel.insertMany(validParcels);
    res.status(201).json(created);
  } catch (error) {
    console.warn('🔴 Bulk creation error:', error);
    res.status(500).json({ message: 'Failed to process bulk upload' });
  }
};




