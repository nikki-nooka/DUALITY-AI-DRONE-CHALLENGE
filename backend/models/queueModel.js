const mongoose = require('mongoose');

const QueueSchema = new mongoose.Schema({
    queue_no: { type: Number, required: true },
    book_no: { type: Number, required: true },
    doctor_list: [{
        doctor_id: { type: Number, required: true },
        doctor_name: { type: String, required: true }
    }],
    timestamp: { type: Date, required: true } // Timestamp for when the queue was created or updated
});

const Queue = mongoose.model('Queue', QueueSchema);

module.exports = Queue;