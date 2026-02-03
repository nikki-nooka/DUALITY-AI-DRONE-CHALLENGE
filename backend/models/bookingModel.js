const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    passenger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Passenger',
      required: true
    },
    flight: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flight',
      required: true
    },
    seatNumber: {
      type: String,
      required: true,
      trim: true
    },
    fareClass: {
      type: String,
      enum: ['economy', 'premium', 'business', 'first'],
      default: 'economy'
    },
    status: {
      type: String,
      enum: ['reserved', 'ticketed', 'checked-in', 'cancelled'],
      default: 'reserved'
    },
    bookedAt: {
      type: Date,
      default: Date.now
    },
    paidAmount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
