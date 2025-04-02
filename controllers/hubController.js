const Parcel = require('../models/Parcel');
const DriverLocation = require('../models/DriverLocation'); // If you're using a location model

exports.getHubStatusSummary = async (req, res) => {
  try {
    const summary = await Parcel.aggregate([
      { $group: { _id: '$currentStatus', count: { $sum: 1 } } },
    ]);

    const formatted = summary.map((item) => ({
      label: item._id,
      count: item.count,
    }));

    res.json(formatted); // ✅ Make sure it returns an array
  } catch (error) {
    console.error('Summary Error:', error.message);
    res.status(500).json({ message: 'Failed to get status summary' });
  }
};

// ✅ Get Parcels by Status
exports.getParcelsByStatus = async (req, res) => {
  try {
    const { status } = req.query;
    const parcels = await Parcel.find({ currentStatus: status });
    res.json(parcels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Mark Parcel as At Hub
exports.markParcelAtHub = async (req, res) => {
  try {
    const parcel = await Parcel.findByIdAndUpdate(
      req.params.id,
      { currentStatus: 'At Hub' },
      { new: true }
    );
    res.json(parcel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Dispatch Parcel
exports.dispatchParcel = async (req, res) => {
  try {
    const parcel = await Parcel.findByIdAndUpdate(
      req.params.id,
      { currentStatus: 'Dispatched' },
      { new: true }
    );
    res.json(parcel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Return Parcel
exports.markParcelReturned = async (req, res) => {
  try {
    const parcel = await Parcel.findByIdAndUpdate(
      req.params.id,
      { currentStatus: 'Returned' },
      { new: true }
    );
    res.json(parcel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Real-Time Location
exports.getRealTimeLocation = async (req, res) => {
  try {
    const parcelId = req.params.parcelId;
    const location = await DriverLocation.findOne({ parcelId }); // adjust if stored by driverId
    res.json(location || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ General Status Update
exports.updateParcelStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const parcel = await Parcel.findByIdAndUpdate(
      req.params.id,
      { currentStatus: status },
      { new: true }
    );
    res.json(parcel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
  