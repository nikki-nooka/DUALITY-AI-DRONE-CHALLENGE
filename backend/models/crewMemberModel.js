const mongoose = require('mongoose');

const crewMemberSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      enum: ['captain', 'first_officer', 'purser', 'flight_attendant', 'ground'],
      required: true
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    licenseNumber: {
      type: String,
      trim: true
    },
    baseAirport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Airport',
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'on_leave', 'inactive'],
      default: 'active'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('CrewMember', crewMemberSchema);
