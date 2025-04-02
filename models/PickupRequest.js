const mongoose = require('mongoose');

const pickupRequestSchema = new mongoose.Schema({
  parcelId: { type: String, required: true },
  pickupDate: { type: String, required: true },
  pickupTime: { type: String, required: true },
  address: { type: String, required: true },
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('PickupRequest', pickupRequestSchema);
