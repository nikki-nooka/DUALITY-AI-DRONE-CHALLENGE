require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');

// Initialize the models in the db
require('./models/userModel');
require('./models/patientModel');
require('./models/medicineCategoryModel');
require('./models/inventoryModel');
require('./models/patientHistoryModel');
require('./models/vitalsModel');
require('./models/doctorModel');

const patientRoutes = require('./routes/patientRoutes');
const vitalRoutes = require('./routes/vitalRoutes');


const app = express();
app.use(express.json());
app.use(cors());

connectDB();

app.use('/api/patients', patientRoutes);
app.use('/api/vitals', vitalRoutes);

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));