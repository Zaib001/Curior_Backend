const Parcel = require('../models/Parcel');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendNotification = async (req, res) => {
  try {
    const { trackingId, email, phone, status } = req.body;

    const message = `Your parcel with Tracking ID: ${trackingId} is now ${status}.`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Parcel Status Update',
      text: message,
    });

    res.json({ message: 'Notification sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Create Parcel
exports.createParcel = async (req, res) => {
  try {
    const { trackingId, receiver, address, postcode, isWithinM25 } = req.body;

    if (!trackingId || !receiver || !address || !postcode) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingParcel = await Parcel.findOne({ trackingId });
    if (existingParcel) {
      return res.status(400).json({ message: 'Parcel with this tracking ID already exists.' });
    }

    const parcel = new Parcel({
      trackingId,
      sender: req.user.userId, // or req.user._id based on your token structure
      receiver,
      address,
      postcode, // ✅ Add postcode
      isWithinM25,
      currentStatus: 'Created',
    });

    await parcel.save();
    res.status(201).json({ message: 'Parcel created successfully', parcel });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Assign Driver (Admin)
exports.assignDriver = async (req, res) => {
  try {
    const { driverId } = req.body;
    const parcel = await Parcel.findByIdAndUpdate(
      req.params.id,
      { driverId, currentStatus: 'Picked Up' },
      { new: true }
    );

    if (!parcel) {
      return res.status(404).json({ message: 'Parcel not found.' });
    }

    res.json({ message: 'Driver assigned successfully', parcel });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Update Status (Driver)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Picked Up', 'In Transit', 'At Hub', 'Out for Delivery', 'Delivered', 'Returned'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    const parcel = await Parcel.findByIdAndUpdate(
      req.params.id,
      { currentStatus: status },
      { new: true }
    );

    if (!parcel) {
      return res.status(404).json({ message: 'Parcel not found.' });
    }

    res.json({ message: 'Parcel status updated successfully', parcel });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



exports.generateLabel = async (req, res) => {
  try {
    const parcel = await Parcel.findById(req.params.id);
    if (!parcel) return res.status(404).json({ message: 'Parcel not found' });

    const doc = new PDFDocument();
    res.setHeader('Content-Disposition', 'attachment; filename=label.pdf');
    res.setHeader('Content-Type', 'application/pdf');

    doc.pipe(res);

    // Add label content
    doc.fontSize(18).text('Parcel Shipping Label', { align: 'center' });
    doc.fontSize(12).text(`Tracking ID: ${parcel.trackingId}`);
    doc.text(`Receiver: ${parcel.receiver}`);
    doc.text(`Address: ${parcel.address}`);
    doc.text(`Status: ${parcel.currentStatus}`);

    // Generate and add QR Code
    const qrCodeDataURL = await QRCode.toDataURL(parcel.trackingId);
    const qrCodeImage = qrCodeDataURL.replace(/^data:image\/png;base64,/, '');
    const qrBuffer = Buffer.from(qrCodeImage, 'base64');
    doc.image(qrBuffer, 250, doc.y + 20, { fit: [150, 150] });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.trackParcel = async (req, res) => {
  try {
    const parcel = await Parcel.findOne({ trackingId: req.params.trackingId });

    if (!parcel) {
      return res.status(404).json({ message: 'Parcel not found' });
    }

    res.json({
      trackingId: parcel.trackingId,
      receiver: parcel.receiver,
      address: parcel.address,
      currentStatus: parcel.currentStatus,
      createdAt: parcel.createdAt,
      updatedAt: parcel.updatedAt,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

