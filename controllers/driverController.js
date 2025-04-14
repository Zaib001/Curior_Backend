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
  const { parcels } = req.body;

  if (!Array.isArray(parcels) || parcels.length === 0) {
    return res.status(400).json({ message: 'No parcels provided.' });
  }

  try {
    const circuitResponse = await axios.post('https://api.circuit.com/v1/optimize', {
      stops: parcels.map(p => ({
        address: p.address,
        lat: p.currentLocation?.lat,
        lng: p.currentLocation?.lng,
        id: p._id,
      })),
    }, {
      headers: {
        Authorization: `Bearer YOUR_CIRCUIT_API_KEY`,
      },
    });

    res.json(circuitResponse.data);
  } catch (err) {
    console.error('Circuit error:', err);
    res.status(500).json({ message: 'Failed to optimize route' });
  }
};

// 📍 Update location (PATCH /driver/parcels/:id/location)
exports.updateParcelLocation = async (req, res) => {
  const { id } = req.params;
  const { lat, lng } = req.body;
  await Parcel.findByIdAndUpdate(id, {
    currentLocation: { lat, lng },
    locationUpdatedAt: new Date()
  });
  res.json({ message: 'Location updated' });
};

// 🌐 Public tracking page data (GET /public/track/:trackingId)
exports.getTrackingInfo = async (req, res) => {
  const { trackingId } = req.params;
  const parcel = await Parcel.findOne({ trackingId });
  if (!parcel) return res.status(404).json({ message: 'Not found' });
  res.json(parcel);
};

