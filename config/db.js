const mongoose = require('mongoose');

const connectDB = async () => {
  try {
  
    await mongoose.connect("mongodb+srv://zebimalik4567:0JRah3RfhsqTCOwI@cluster0.6jhoy.mongodb.net/CouriorService");
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❗ Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
