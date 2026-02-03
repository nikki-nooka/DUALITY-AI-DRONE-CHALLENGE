const express = require('express');

const Airport = require('../models/airportModel');
const Aircraft = require('../models/aircraftModel');
const Route = require('../models/routeModel');
const Flight = require('../models/flightModel');
const Passenger = require('../models/passengerModel');
const Booking = require('../models/bookingModel');
const CrewMember = require('../models/crewMemberModel');

const router = express.Router();

const registerResource = ({ path, Model, populate = [] }) => {
  router.get(path, async (req, res) => {
    try {
      let query = Model.find();
      populate.forEach((field) => {
        query = query.populate(field);
      });
      const items = await query.sort({ createdAt: -1 });
      return res.status(200).json(items);
    } catch (error) {
      console.error(`Error fetching ${path}:`, error);
      return res.status(500).json({ message: 'Server error' });
    }
  });

  router.get(`${path}/:id`, async (req, res) => {
    try {
      let query = Model.findById(req.params.id);
      populate.forEach((field) => {
        query = query.populate(field);
      });
      const item = await query;
      if (!item) {
        return res.status(404).json({ message: 'Record not found' });
      }
      return res.status(200).json(item);
    } catch (error) {
      console.error(`Error fetching ${path} by id:`, error);
      return res.status(500).json({ message: 'Server error' });
    }
  });

  router.post(path, async (req, res) => {
    try {
      const item = await Model.create(req.body);
      return res.status(201).json(item);
    } catch (error) {
      console.error(`Error creating ${path}:`, error);
      return res.status(400).json({ message: 'Unable to create record', error: error.message });
    }
  });

  router.put(`${path}/:id`, async (req, res) => {
    try {
      const item = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });
      if (!item) {
        return res.status(404).json({ message: 'Record not found' });
      }
      return res.status(200).json(item);
    } catch (error) {
      console.error(`Error updating ${path}:`, error);
      return res.status(400).json({ message: 'Unable to update record', error: error.message });
    }
  });

  router.delete(`${path}/:id`, async (req, res) => {
    try {
      const item = await Model.findByIdAndDelete(req.params.id);
      if (!item) {
        return res.status(404).json({ message: 'Record not found' });
      }
      return res.status(200).json({ message: 'Record deleted' });
    } catch (error) {
      console.error(`Error deleting ${path}:`, error);
      return res.status(500).json({ message: 'Server error' });
    }
  });
};

registerResource({ path: '/airports', Model: Airport });
registerResource({ path: '/aircraft', Model: Aircraft });
registerResource({ path: '/routes', Model: Route, populate: ['origin', 'destination'] });
registerResource({ path: '/flights', Model: Flight, populate: ['route', 'aircraft', 'crew'] });
registerResource({ path: '/passengers', Model: Passenger });
registerResource({ path: '/bookings', Model: Booking, populate: ['passenger', 'flight'] });
registerResource({ path: '/crew', Model: CrewMember, populate: ['baseAirport'] });

module.exports = router;
