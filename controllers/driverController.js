const Parcel = require('../models/Parcel');

// Get all assigned parcels for a driver
exports.getAssignedParcels = async (req, res) => {
  try {
    const driverId = req.user.userId;
    const parcels = await Parcel.find({ driverId }).sort({ createdAt: -1 });
    res.json(parcels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get real-time location for a parcel
exports.getRealTimeLocation = async (req, res) => {
  try {
    const { parcelId } = req.params;
    // Placeholder - In production you'd fetch GPS from a tracking device or source
    const mockLocation = {
      lat: 51.5074,
      lng: -0.1278,
      updatedAt: new Date(),
    };
    res.json(mockLocation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Optimize route (example using just parcel list sorting)
exports.optimizeRoute = async (req, res) => {
  try {
    const { parcelIds } = req.body;
    // Simulate a sorted route based on proximity or ID
    const parcels = await Parcel.find({ _id: { $in: parcelIds } });
    const sortedParcels = parcels.sort((a, b) =>
      a.address.localeCompare(b.address)
    );
    res.json(sortedParcels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update parcel status
exports.updateParcelStatus = async (req, res) => {
  try {
    const { parcelId } = req.params;
    const { status } = req.body;

    const parcel = await Parcel.findById(parcelId);
    if (!parcel) return res.status(404).json({ message: 'Parcel not found' });

    parcel.currentStatus = status;
    await parcel.save();

    res.json({ message: 'Parcel status updated', parcel });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
