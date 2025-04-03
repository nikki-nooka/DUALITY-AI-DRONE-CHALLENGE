const moongoose = require('mongoose');
const express = require('express');

const router = express.Router();
const Medicine = require('../models/inventoryModel');

router.post('/update_medicine_stock', async (req, res) => {
    const { medicine_id, expiry_date, quantity } = req.body;
    try {
        const medicine = await Medicine.findOne({ medicine_id: medicine_id });
        if (!medicine) {
            return res.status(404).send('Medicine not found');
        }

        let found = false;
        for (let i = 0; i < medicine.medicine_details.length; i++) {
            const detail = medicine.medicine_details[i];
            const detailDate = new Date(detail.expiry_date).toISOString().split('T')[0];
            const requestDate = new Date(expiry_date).toISOString().split('T')[0];
            
            if (detailDate === requestDate) {
                medicine.medicine_details[i].quantity = quantity;
                found = true;
                break;
            }
        }

        if (!found) {
            return res.status(404).send('Medicine with the expiry date not found');
        }

        medicine.total_quantity = medicine.medicine_details.reduce(
            (total, detail) => total + detail.quantity, 0
        );

        await medicine.save();
        res.send(medicine);
    } catch (error) {
        console.error('Error updating medicine stock:', error);
        res.status(500).send('Server error');
    }
});

router.post('/add_new_medicine_details', async (req, res) => {
    const { medicine_id, medicine_name, expiry_date, quantity } = req.body;
    
    try {
      const medicine = await Medicine.findOne({ medicine_id });
      if (!medicine) {
        return res.status(404).send('Medicine not found');
      }
  
      medicine.medicine_details.push({
        medicine_name,
        expiry_date,
        quantity
      });
  
      medicine.total_quantity += quantity;
  
      await medicine.save();
  
      res.status(200).json(medicine);
    } catch (error) {
      console.error('Error adding medicine details:', error);
      res.status(500).send('Server error');
    }
  });

const addMedicine = async (req, res) => {
    try {
        const {
            medicine_formulation,
            medicine_name,
            expiry_date,
            quantity
        } = req.body;
        console.log(req.body);

        if (!medicine_formulation || !medicine_name || !expiry_date || !quantity) {
            return res.status(400).json({ message: 'All fields are required' });
        }


        const existingMedicine = await Medicine.findOne({ medicine_formulation });

        if (existingMedicine) {
            return res.status(400).json({ message: 'Medicine with this formulation already exists' });
        } else {
            let medicine_id = 1;
            const medicines = await Medicine.find();
            while (medicines.find((medicine) => medicine.medicine_id === medicine_id.toString())) {
                medicine_id++;
            }
            const newMedicine = new Medicine({
                medicine_id: medicine_id.toString(),
                medicine_formulation,
                total_quantity: quantity,
                medicine_details: [{
                    medicine_name,
                    expiry_date,
                    quantity
                }]
            });

            await newMedicine.save();
            return res.status(201).json({
                message: 'New medicine added to inventory',
                medicine: newMedicine
            });
        }
    } catch (error) {
        console.error('Error adding medicine:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
router.post('/add_new_medicine', addMedicine);

router.get('/get_medicines', async (req, res) => {
    try {
        const medicines = await Medicine.find();
        console.log(medicines[0].medicine_details[0].expiry_date);
        res.json(medicines);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving medicines');
    }
});

router.get('/get_medicine/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const medicine = await Medicine.find({ medicine_id: id });
        if (!medicine) {
            res.status(404).send('Medicine not found');
        }
        res.json(medicine);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving medicine');
    }
});

router.post('/update_medicine_expiry_date', async(req, res) => {
    const medicine_id = req.body.medicine_id;
    const old_expiry_date = req.body.old_expiry_date;
    const new_expiry_date = req.body.new_expiry_date;

    try {
        console.log(medicine_id, old_expiry_date, new_expiry_date);

        const medicine = await Medicine.findOne({ medicine_id: medicine_id });
        if (!medicine) {
            return res.status(404).send('Medicine not found');
        }

        let found = false;
        for (let i = 0; i < medicine.medicine_details.length; i++) {
            const detail = medicine.medicine_details[i];
            const detailDate = new Date(detail.expiry_date).toISOString().split('T')[0];
            const oldDate = new Date(old_expiry_date).toISOString().split('T')[0];
            
            if (detailDate === oldDate) {
                medicine.medicine_details[i].expiry_date = new_expiry_date;
                found = true;
                break;
            }
        }
        
        if (!found) {
            return res.status(404).send('Medicine with the expiry date not found');
        }

        await medicine.save();
        
        // Send a message saying that the medicine has been updated
        return res.status(200).json({ message: 'Medicine Expiry Date updated successfully' });
    } catch (error) {
        console.error('Error updating medicine expiry date:', error);
        return res.status(500).send('Server error');
    }
});

router.post('/delete_medicine_batch' , async(req , res) => {
    const medicine_id = req.body.medicine_id;
    const expiry_date = req.body.expiry_date;

    try {
        const medicine = await Medicine.findOne({ medicine_id: medicine_id });
        if (!medicine) {
            return res.status(404).send('Medicine not found');
        }

        let found = false;
        for (let i = 0; i < medicine.medicine_details.length; i++) {
            const detail = medicine.medicine_details[i];
            const detailDate = new Date(detail.expiry_date).toISOString().split('T')[0];
            const requestDate = new Date(expiry_date).toISOString().split('T')[0];
            
            if (detailDate === requestDate) {
                // Remove the medicine detail from the array
                medicine.medicine_details.splice(i, 1);
                found = true;
                break;
            }
        }

        if (!found) {
            return res.status(404).send('Medicine with the expiry date not found');
        }

        medicine.total_quantity = medicine.medicine_details.reduce(
            (total, detail) => total + detail.quantity, 0
        );

        await medicine.save();
        res.send(medicine);
    } catch (error) {
        console.error('Error deleting medicine:', error);
        res.status(500).send('Server error');
    }
});

router.post('/delete_medicine' , async(req , res) => {
    const medicine_id = req.body.medicine_id ;
    // Delete the medicine from the database with the given medicine_id
    try {
        const medicine = await Medicine.findOneAndDelete({ medicine_id: medicine_id });
        if (!medicine) {
            return res.status(404).send('Medicine not found');
        }
        res.send(medicine);
    } catch (error) {
        console.error('Error deleting medicine:', error);
        res.status(500).send('Server error');
    }

}) ;

module.exports = router;
