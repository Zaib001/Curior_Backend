const mongoose = require('mongoose');

const pickupRequestSchema = new mongoose.Schema({
  parcelIds: {
    type: [String], // array of parcel _id
    required: true
  },
  pickupDate: { type: String, required: true },
  pickupTime: { type: String, required: true },
  address: { type: String, required: true },
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('PickupRequest', pickupRequestSchema);
