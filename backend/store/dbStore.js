const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { isMongoConnected } = require('../config/db');
const { seedUsers, seedEvents, seedBookings, seedTickets, seedCheckIns } = require('../data/seedData');

// Mongoose Models
const UserModel = require('../models/User');
const EventModel = require('../models/Event');
const BookingModel = require('../models/Booking');
const TicketModel = require('../models/Ticket');
const CheckInModel = require('../models/CheckIn');

const DB_FILE = path.join(__dirname, '../data/db.json');

// In-Memory store
let memoryDB = {
  users: [],
  events: [],
  bookings: [],
  tickets: [],
  checkIns: [],
};

// Generate a 24-character hexadecimal ObjectId-compatible string
const generateId = () => {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const random = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  return (timestamp + random).substring(0, 24);
};

// Load or initialize DB
const initStore = async () => {
  if (isMongoConnected()) {
    try {
      // Seed MongoDB if empty
      const userCount = await UserModel.countDocuments();
      if (userCount === 0) {
        console.log('[Database] Seeding initial data into MongoDB...');
        await UserModel.insertMany(seedUsers);
        await EventModel.insertMany(seedEvents);
        await BookingModel.insertMany(seedBookings);
        await TicketModel.insertMany(seedTickets);
        await CheckInModel.insertMany(seedCheckIns);
        console.log('[Database] MongoDB seeded successfully.');
      }
    } catch (e) {
      console.error('[Database] Seeding MongoDB failed:', e.message);
    }
    return;
  }

  // Load from db.json if exists, else seed
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      memoryDB = JSON.parse(data);
      console.log('[Database] Loaded persisted embedded database state.');
    } else {
      memoryDB = {
        users: [...seedUsers],
        events: [...seedEvents],
        bookings: [...seedBookings],
        tickets: [...seedTickets],
        checkIns: [...seedCheckIns],
      };
      saveStore();
      console.log('[Database] Initialized embedded database with pre-seeded demo records.');
    }
  } catch (err) {
    console.error('[Database] Error initializing file store:', err.message);
    memoryDB = {
      users: [...seedUsers],
      events: [...seedEvents],
      bookings: [...seedBookings],
      tickets: [...seedTickets],
      checkIns: [...seedCheckIns],
    };
  }
};

const saveStore = () => {
  if (isMongoConnected()) return;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryDB, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Database] Failed to write db.json:', err.message);
  }
};

// Helper to sanitize user (exclude password)
const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...sanitized } = user;
  return sanitized;
};

// Helper to populate booking
const populateBooking = (booking) => {
  if (!booking) return null;
  const copy = { ...booking };
  if (typeof copy.event === 'string') {
    const ev = memoryDB.events.find((e) => String(e._id) === String(copy.event));
    if (ev) copy.event = ev;
  }
  if (typeof copy.user === 'string') {
    const u = memoryDB.users.find((u) => String(u._id) === String(copy.user));
    if (u) copy.user = sanitizeUser(u);
  }
  return copy;
};

// Helper to populate ticket
const populateTicket = (ticket) => {
  if (!ticket) return null;
  const copy = { ...ticket };
  if (typeof copy.event === 'string') {
    const ev = memoryDB.events.find((e) => String(e._id) === String(copy.event));
    if (ev) copy.event = ev;
  }
  if (typeof copy.booking === 'string') {
    const bk = memoryDB.bookings.find((b) => String(b._id) === String(copy.booking));
    if (bk) copy.booking = bk;
  }
  return copy;
};

// Store Interface
const Store = {
  // USER METHODS
  User: {
    find: async (query = {}) => {
      if (isMongoConnected()) {
        return await UserModel.find(query).select('-password');
      }
      return memoryDB.users
        .filter((u) => {
          if (query.role && u.role !== query.role) return false;
          if (query.status && u.status !== query.status) return false;
          return true;
        })
        .map(sanitizeUser);
    },

    findById: async (id) => {
      if (isMongoConnected()) {
        return await UserModel.findById(id).select('-password');
      }
      const u = memoryDB.users.find((u) => String(u._id) === String(id));
      return sanitizeUser(u);
    },

    findOneWithPassword: async (query) => {
      if (isMongoConnected()) {
        return await UserModel.findOne(query).select('+password');
      }
      return memoryDB.users.find((u) => {
        if (query.email && u.email.toLowerCase() === query.email.toLowerCase()) return true;
        if (query._id && String(u._id) === String(query._id)) return true;
        return false;
      }) || null;
    },

    findOne: async (query) => {
      if (isMongoConnected()) {
        return await UserModel.findOne(query).select('-password');
      }
      const u = memoryDB.users.find((u) => {
        if (query.email && u.email.toLowerCase() === query.email.toLowerCase()) return true;
        if (query._id && String(u._id) === String(query._id)) return true;
        return false;
      });
      return sanitizeUser(u);
    },

    create: async (userData) => {
      if (isMongoConnected()) {
        return await UserModel.create(userData);
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      const newUser = {
        _id: generateId(),
        name: userData.name,
        email: userData.email.toLowerCase().trim(),
        password: hashedPassword,
        role: userData.role || 'attendee',
        avatar: userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        bio: userData.bio || '',
        phone: userData.phone || '',
        status: 'active',
        createdAt: new Date(),
      };
      memoryDB.users.push(newUser);
      saveStore();
      return sanitizeUser(newUser);
    },

    findByIdAndUpdate: async (id, updates) => {
      if (isMongoConnected()) {
        return await UserModel.findByIdAndUpdate(id, updates, { new: true }).select('-password');
      }
      const idx = memoryDB.users.findIndex((u) => String(u._id) === String(id));
      if (idx === -1) return null;

      // Handle password update if included
      if (updates.password) {
        const salt = await bcrypt.genSalt(10);
        updates.password = await bcrypt.hash(updates.password, salt);
      }

      memoryDB.users[idx] = { ...memoryDB.users[idx], ...updates };
      saveStore();
      return sanitizeUser(memoryDB.users[idx]);
    },

    countDocuments: async (query = {}) => {
      if (isMongoConnected()) {
        return await UserModel.countDocuments(query);
      }
      return memoryDB.users.filter((u) => {
        if (query.role && u.role !== query.role) return false;
        return true;
      }).length;
    },

    comparePassword: async (enteredPassword, hashedPassword) => {
      return await bcrypt.compare(enteredPassword, hashedPassword);
    },
  },

  // EVENT METHODS
  Event: {
    find: async (filter = {}, sort = { createdAt: -1 }) => {
      if (isMongoConnected()) {
        let q = EventModel.find(filter);
        if (sort) q = q.sort(sort);
        return await q;
      }

      let results = [...memoryDB.events];

      if (filter.organizer) {
        results = results.filter((e) => String(e.organizer) === String(filter.organizer));
      }
      if (filter.category && filter.category !== 'All') {
        results = results.filter((e) => e.category === filter.category);
      }
      if (filter.status) {
        results = results.filter((e) => e.status === filter.status);
      }
      if (filter.$or) {
        // Search keyword
        const regexes = filter.$or.map((o) => {
          const key = Object.keys(o)[0];
          return { key, rx: o[key].$regex ? new RegExp(o[key].$regex, o[key].$options || 'i') : null };
        });
        results = results.filter((e) => {
          return regexes.some((r) => r.rx && r.rx.test(e[r.key] || ''));
        });
      }

      // Add virtual ticketsRemaining
      results = results.map((e) => ({
        ...e,
        ticketsRemaining: Math.max(0, (e.capacity || 0) - (e.registeredCount || 0)),
      }));

      // Sort
      if (sort.date === 1) {
        results.sort((a, b) => new Date(a.date) - new Date(b.date));
      } else if (sort.date === -1) {
        results.sort((a, b) => new Date(b.date) - new Date(a.date));
      } else if (sort.ticketPrice === 1) {
        results.sort((a, b) => a.ticketPrice - b.ticketPrice);
      } else if (sort.ticketPrice === -1) {
        results.sort((a, b) => b.ticketPrice - a.ticketPrice);
      } else {
        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      return results;
    },

    findById: async (id) => {
      if (isMongoConnected()) {
        return await EventModel.findById(id).populate('organizer', 'name email avatar bio');
      }
      const ev = memoryDB.events.find((e) => String(e._id) === String(id));
      if (!ev) return null;
      const organizer = memoryDB.users.find((u) => String(u._id) === String(ev.organizer));
      return {
        ...ev,
        organizer: sanitizeUser(organizer) || { name: ev.organizerName },
        ticketsRemaining: Math.max(0, (ev.capacity || 0) - (ev.registeredCount || 0)),
      };
    },

    create: async (eventData) => {
      if (isMongoConnected()) {
        return await EventModel.create(eventData);
      }
      const newEvent = {
        _id: generateId(),
        ...eventData,
        registeredCount: 0,
        status: eventData.status || 'published',
        featured: eventData.featured || false,
        tags: eventData.tags || [],
        createdAt: new Date(),
      };
      newEvent.ticketsRemaining = Math.max(0, newEvent.capacity - newEvent.registeredCount);
      memoryDB.events.push(newEvent);
      saveStore();
      return newEvent;
    },

    findByIdAndUpdate: async (id, updates) => {
      if (isMongoConnected()) {
        return await EventModel.findByIdAndUpdate(id, updates, { new: true });
      }
      const idx = memoryDB.events.findIndex((e) => String(e._id) === String(id));
      if (idx === -1) return null;
      memoryDB.events[idx] = { ...memoryDB.events[idx], ...updates };
      saveStore();
      return {
        ...memoryDB.events[idx],
        ticketsRemaining: Math.max(0, (memoryDB.events[idx].capacity || 0) - (memoryDB.events[idx].registeredCount || 0)),
      };
    },

    findByIdAndDelete: async (id) => {
      if (isMongoConnected()) {
        return await EventModel.findByIdAndDelete(id);
      }
      const idx = memoryDB.events.findIndex((e) => String(e._id) === String(id));
      if (idx === -1) return null;
      const [deleted] = memoryDB.events.splice(idx, 1);
      saveStore();
      return deleted;
    },

    countDocuments: async (query = {}) => {
      if (isMongoConnected()) {
        return await EventModel.countDocuments(query);
      }
      return memoryDB.events.filter((e) => {
        if (query.organizer && String(e.organizer) !== String(query.organizer)) return false;
        if (query.status && e.status !== query.status) return false;
        return true;
      }).length;
    },
  },

  // BOOKING METHODS
  Booking: {
    find: async (query = {}, sort = { createdAt: -1 }) => {
      if (isMongoConnected()) {
        return await BookingModel.find(query).populate('event').populate('user', '-password').sort(sort);
      }
      let results = [...memoryDB.bookings];
      if (query.user) {
        results = results.filter((b) => String(b.user) === String(query.user));
      }
      if (query.event) {
        results = results.filter((b) => String(b.event) === String(query.event));
      }
      if (query.bookingStatus) {
        results = results.filter((b) => b.bookingStatus === query.bookingStatus);
      }

      results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return results.map(populateBooking);
    },

    findById: async (id) => {
      if (isMongoConnected()) {
        return await BookingModel.findById(id).populate('event').populate('user', '-password');
      }
      const bk = memoryDB.bookings.find((b) => String(b._id) === String(id));
      return populateBooking(bk);
    },

    findOne: async (query) => {
      if (isMongoConnected()) {
        return await BookingModel.findOne(query).populate('event').populate('user', '-password');
      }
      const bk = memoryDB.bookings.find((b) => {
        if (query.bookingReference && b.bookingReference === query.bookingReference) return true;
        if (query.event && query.user && String(b.event) === String(query.event) && String(b.user) === String(query.user)) {
          if (query.bookingStatus && b.bookingStatus !== query.bookingStatus) return false;
          return true;
        }
        return false;
      });
      return populateBooking(bk);
    },

    create: async (bookingData) => {
      if (isMongoConnected()) {
        return await BookingModel.create(bookingData);
      }
      const newBooking = {
        _id: generateId(),
        ...bookingData,
        bookingStatus: bookingData.bookingStatus || 'confirmed',
        createdAt: new Date(),
      };
      memoryDB.bookings.push(newBooking);
      saveStore();
      return populateBooking(newBooking);
    },

    findByIdAndUpdate: async (id, updates) => {
      if (isMongoConnected()) {
        return await BookingModel.findByIdAndUpdate(id, updates, { new: true }).populate('event');
      }
      const idx = memoryDB.bookings.findIndex((b) => String(b._id) === String(id));
      if (idx === -1) return null;
      memoryDB.bookings[idx] = { ...memoryDB.bookings[idx], ...updates };
      saveStore();
      return populateBooking(memoryDB.bookings[idx]);
    },

    countDocuments: async (query = {}) => {
      if (isMongoConnected()) {
        return await BookingModel.countDocuments(query);
      }
      return memoryDB.bookings.filter((b) => {
        if (query.bookingStatus && b.bookingStatus !== query.bookingStatus) return false;
        if (query.event && String(b.event) !== String(query.event)) return false;
        return true;
      }).length;
    },
  },

  // TICKET METHODS
  Ticket: {
    find: async (query = {}) => {
      if (isMongoConnected()) {
        return await TicketModel.find(query).populate('event').populate('booking');
      }
      let results = [...memoryDB.tickets];
      if (query.booking) {
        results = results.filter((t) => String(t.booking) === String(query.booking));
      }
      if (query.event) {
        results = results.filter((t) => String(t.event) === String(query.event));
      }
      if (query.status) {
        results = results.filter((t) => t.status === query.status);
      }
      return results.map(populateTicket);
    },

    findById: async (id) => {
      if (isMongoConnected()) {
        return await TicketModel.findById(id).populate('event').populate('booking');
      }
      const t = memoryDB.tickets.find((t) => String(t._id) === String(id));
      return populateTicket(t);
    },

    findOne: async (query) => {
      if (isMongoConnected()) {
        return await TicketModel.findOne(query).populate('event').populate('booking');
      }
      const t = memoryDB.tickets.find((item) => {
        if (query.ticketCode && item.ticketCode.toUpperCase() === query.ticketCode.toUpperCase()) return true;
        if (query.booking && String(item.booking) === String(query.booking)) return true;
        if (query._id && String(item._id) === String(query._id)) return true;
        return false;
      });
      return populateTicket(t);
    },

    create: async (ticketData) => {
      if (isMongoConnected()) {
        return await TicketModel.create(ticketData);
      }
      const newTicket = {
        _id: generateId(),
        ...ticketData,
        status: ticketData.status || 'valid',
        usedAt: null,
        checkedInBy: null,
        createdAt: new Date(),
      };
      memoryDB.tickets.push(newTicket);
      saveStore();
      return populateTicket(newTicket);
    },

    findByIdAndUpdate: async (id, updates) => {
      if (isMongoConnected()) {
        return await TicketModel.findByIdAndUpdate(id, updates, { new: true }).populate('event').populate('booking');
      }
      const idx = memoryDB.tickets.findIndex((t) => String(t._id) === String(id));
      if (idx === -1) return null;
      memoryDB.tickets[idx] = { ...memoryDB.tickets[idx], ...updates };
      saveStore();
      return populateTicket(memoryDB.tickets[idx]);
    },
  },

  // CHECKIN METHODS
  CheckIn: {
    find: async (query = {}, sort = { timestamp: -1 }) => {
      if (isMongoConnected()) {
        return await CheckInModel.find(query).populate('event').populate('ticket').sort(sort);
      }
      let results = [...memoryDB.checkIns];
      if (query.event) {
        results = results.filter((c) => String(c.event) === String(query.event));
      }
      results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return results;
    },

    create: async (checkInData) => {
      if (isMongoConnected()) {
        return await CheckInModel.create(checkInData);
      }
      const newCheckIn = {
        _id: generateId(),
        ...checkInData,
        timestamp: new Date(),
      };
      memoryDB.checkIns.push(newCheckIn);
      saveStore();
      return newCheckIn;
    },

    countDocuments: async (query = {}) => {
      if (isMongoConnected()) {
        return await CheckInModel.countDocuments(query);
      }
      return memoryDB.checkIns.filter((c) => {
        if (query.event && String(c.event) !== String(query.event)) return false;
        return true;
      }).length;
    },
  },

  initStore,
  generateId,
};

module.exports = Store;

