const mongoose = require('mongoose');

const aircraftSchema = new mongoose.Schema(
  {
    tailNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    model: {
      type: String,
      required: true,
      trim: true
    },
    manufacturer: {
      type: String,
      required: true,
      trim: true
    },
    seatCapacity: {
      type: Number,
      required: true,
      min: 1
    },
    rangeKm: {
      type: Number,
      required: true,
      min: 1
    },
    status: {
      type: String,
      enum: ['active', 'maintenance', 'retired'],
      default: 'active'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Aircraft', aircraftSchema);
