const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  attendee: {
    name: { type: String, required: true },
    email: { type: String, required: true },
  },
  qrData: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['valid', 'used', 'cancelled'],
    default: 'valid',
  },
  usedAt: {
    type: Date,
    default: null,
  },
  checkedInBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Ticket', ticketSchema);

