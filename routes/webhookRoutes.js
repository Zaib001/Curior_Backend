const express = require('express');
const { receiveOrder } = require('../controllers/webhookController');
const router = express.Router();

// Shopify/WooCommerce Webhook Endpoint
router.post('/orders', receiveOrder);

module.exports = router;
