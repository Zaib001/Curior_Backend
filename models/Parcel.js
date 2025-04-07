const mongoose = require('mongoose');

const parcelSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      required: true,
      trim: true,
    },
    receiver: {
      type: String,
      required: true,
      trim: true,
    },
    trackingId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    address: { // ✅ Add this
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    deliveryType: {
      type: String,
      enum: ['Standard', 'Express', 'Same Day'],
      default: 'Standard',
    },

    postcode: { // ✅ Add this
      type: String,
      required: true,
      trim: true,
    },
    currentStatus: {
      type: String,
      enum: ['Created', 'Picked Up', 'In Transit', 'At Hub', 'Out for Delivery', 'Delivered', 'Returned'],
      default: 'Created',
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    hubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isWithinM25: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Parcel', parcelSchema);
