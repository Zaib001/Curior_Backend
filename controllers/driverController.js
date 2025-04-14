const Parcel = require('../models/Parcel');


exports.getDriverParcels = async (req, res) => {
  const driverId = req.user.userId;
  const parcels = await Parcel.find({ driverId });
  res.json(parcels);
};
exports.updateParcelStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  await Parcel.findByIdAndUpdate(id, { currentStatus: status });
  res.json({ message: 'Status updated' });
};
exports.getAssignedParcels = async (req, res) => {
  try {
    const driverId = req.user.userId;
    const parcels = await Parcel.find({ driverId }).sort({ createdAt: -1 });
    res.json(parcels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
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


