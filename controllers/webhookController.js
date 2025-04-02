const Order = require('../models/Order');

exports.receiveOrder = async (req, res) => {
  try {
    const { orderId, merchantId, customerName, shippingAddress, items } = req.body;

    const existingOrder = await Order.findOne({ orderId });
    if (existingOrder) {
      return res.status(400).json({ message: 'Order already exists' });
    }

    const newOrder = new Order({ orderId, merchantId, customerName, shippingAddress, items });
    await newOrder.save();

    res.status(201).json({ message: 'Order received and saved', order: newOrder });
  } catch (error) {
    console.error('Error processing order webhook:', error);
    res.status(500).json({ message: 'Failed to process order' });
  }
};
