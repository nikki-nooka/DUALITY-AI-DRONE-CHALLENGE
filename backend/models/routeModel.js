const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema(
  {
    origin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Airport',
      required: true
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Airport',
      required: true
    },
    distanceKm: {
      type: Number,
      required: true,
      min: 1
    },
    typicalDurationMinutes: {
      type: Number,
      required: true,
      min: 1
    }
  },
  { timestamps: true }
);

routeSchema.index({ origin: 1, destination: 1 }, { unique: true });

module.exports = mongoose.model('Route', routeSchema);
