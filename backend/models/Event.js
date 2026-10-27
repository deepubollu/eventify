const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add an event title'],
    trim: true,
    maxlength: [120, 'Title cannot be more than 120 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please add an event description'],
    maxlength: [5000, 'Description cannot be more than 5000 characters'],
  },
  category: {
    type: String,
    required: [true, 'Please specify an event category'],
    enum: [
      'Technology',
      'Music & Concerts',
      'Workshops & Education',
      'Business & Networking',
      'Sports & Fitness',
      'Arts & Culture',
      'Food & Drink',
      'Community',
    ],
    default: 'Technology',
  },
  date: {
    type: String,
    required: [true, 'Please add the event date (YYYY-MM-DD)'],
  },
  time: {
    type: String,
    required: [true, 'Please add the event time (HH:MM)'],
  },
  venue: {
    type: String,
    required: [true, 'Please add the venue address or link'],
  },
  locationType: {
    type: String,
    enum: ['in-person', 'online'],
    default: 'in-person',
  },
  ticketPrice: {
    type: Number,
    required: [true, 'Please set ticket price (0 for free)'],
    min: [0, 'Ticket price cannot be negative'],
    default: 0,
  },
  capacity: {
    type: Number,
    required: [true, 'Please set maximum attendee capacity'],
    min: [1, 'Capacity must be at least 1'],
  },
  registeredCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  organizerName: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['published', 'draft', 'cancelled', 'completed'],
    default: 'published',
  },
  featured: {
    type: Boolean,
    default: false,
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Virtual for remaining tickets
eventSchema.virtual('ticketsRemaining').get(function () {
  return Math.max(0, this.capacity - this.registeredCount);
});

eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);

