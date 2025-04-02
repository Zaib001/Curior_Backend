const express = require('express');
const connectDB = require('./config/db');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

connectDB();
const app = express();
app.use(express.json());
app.use(morgan('dev')); // Logs requests
app.use(helmet()); // Security headers
app.use(cors()); // Cross-Origin requests

// 🌐 API Routes
app.use('/api/auth', require('./routes/auth'));                   // Auth routes (Login/Register)
app.use('/api/parcels', require('./routes/parcels'));        // Parcel management (create, label, status update)
app.use('/api/merchant', require('./routes/merchantRoutes'));     // Merchant (orders, pickups, analytics)
app.use('/api/admin', require('./routes/adminRoutes'));           // Admin dashboard, reports, user mgmt
app.use('/api/driver', require('./routes/driverRoutes'));         // Driver dashboard, status updates, real-time tracking
app.use('/api/hub', require('./routes/hubRoutes'));               // Hub dashboard: at-hub, dispatch, return
app.use('/api/webhooks', require('./routes/webhookRoutes'));      // Webhook integrations (e.g., Shopify, WooCommerce)

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
