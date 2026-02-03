const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema(
  {
    flightNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      required: true
    },
    aircraft: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Aircraft',
      required: true
    },
    departureTime: {
      type: Date,
      required: true
    },
    arrivalTime: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['scheduled', 'boarding', 'departed', 'arrived', 'delayed', 'cancelled'],
      default: 'scheduled'
    },
    seatsAvailable: {
      type: Number,
      required: true,
      min: 0
    },
    crew: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CrewMember'
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Flight', flightSchema);
