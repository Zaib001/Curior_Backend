const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// @route   POST /api/orders/webhook
// @desc    Webhook to receive orders from Shopify/WooCommerce
// @access  Public (should be protected with a secret key in production)
router.post('/webhook', async (req, res) => {
  try {
    const { orderId, merchantId, customerName, shippingAddress, items } = req.body;

    // Validate required fields
    if (!orderId || !merchantId || !customerName || !shippingAddress || !items || !items.length) {
      return res.status(400).json({ message: 'Missing or invalid order data' });
    }

    // Prevent duplicate orders
    const existingOrder = await Order.findOne({ orderId });
    if (existingOrder) {
      return res.status(409).json({ message: 'Order already exists' });
    }

    const newOrder = new Order({
      orderId,
      merchantId,
      customerName,
      shippingAddress,
      items,
    });

    await newOrder.save();
    res.status(201).json({ message: 'Order synced successfully', order: newOrder });
  } catch (error) {
    console.error('Order webhook error:', error.message);
    res.status(500).json({ message: 'Failed to sync order' });
  }
});

module.exports = router;


// const express = require('express');
// const router = express.Router();
// const Order = require('../models/Order');

// // @route   POST /api/orders/webhook
// // @desc    Webhook to receive orders securely
// // @access  Protected via header token
// router.post('/webhook', async (req, res) => {
//   const secret = req.headers['x-webhook-secret'];

//   // ✅ Validate the secret token
//   if (!secret || secret !== process.env.WEBHOOK_SECRET) {
//     return res.status(403).json({ message: 'Unauthorized webhook request' });
//   }

//   try {
//     const { orderId, merchantId, customerName, shippingAddress, items } = req.body;

//     // Validate required fields
//     if (!orderId || !merchantId || !customerName || !shippingAddress || !items || !items.length) {
//       return res.status(400).json({ message: 'Missing or invalid order data' });
//     }

//     // Prevent duplicate orders
//     const existingOrder = await Order.findOne({ orderId });
//     if (existingOrder) {
//       return res.status(409).json({ message: 'Order already exists' });
//     }

//     const newOrder = new Order({ orderId, merchantId, customerName, shippingAddress, items });
//     await newOrder.save();

//     res.status(201).json({ message: 'Order synced successfully', order: newOrder });
//   } catch (error) {
//     console.error('Order webhook error:', error.message);
//     res.status(500).json({ message: 'Failed to sync order' });
//   }
// });

// module.exports = router;
