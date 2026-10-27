// API client utility

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.message || `Request failed with status ${res.status}`;
    const error = new Error(errorMsg);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
};

export const api = {
  // Auth
  register: (payload) =>
    fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(handleResponse),

  login: (payload) =>
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(handleResponse),

  getMe: () =>
    fetch('/api/auth/me', {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  updateProfile: (payload) =>
    fetch('/api/auth/profile', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }).then(handleResponse),

  // Events
  getEvents: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    return fetch(`/api/events?${query.toString()}`).then(handleResponse);
  },

  getEventById: (id) =>
    fetch(`/api/events/${id}`).then(handleResponse),

  getCategories: () =>
    fetch('/api/events/meta/categories').then(handleResponse),

  createEvent: (payload) =>
    fetch('/api/events', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }).then(handleResponse),

  updateEvent: (id, payload) =>
    fetch(`/api/events/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }).then(handleResponse),

  deleteEvent: (id) =>
    fetch(`/api/events/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Bookings
  createBooking: (payload) =>
    fetch('/api/bookings', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }).then(handleResponse),

  getMyBookings: () =>
    fetch('/api/bookings/my', {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  getBookingById: (id) =>
    fetch(`/api/bookings/${id}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  cancelBooking: (id) =>
    fetch(`/api/bookings/${id}/cancel`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Tickets & Verification
  getTicket: (idOrCode) =>
    fetch(`/api/tickets/${idOrCode}`).then(handleResponse),

  verifyCheckIn: (payload) =>
    fetch('/api/tickets/verify-checkin', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }).then(handleResponse),

  getEventCheckIns: (eventId) =>
    fetch(`/api/tickets/checkins/${eventId}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Dashboard
  getOrganizerDashboard: () =>
    fetch('/api/dashboard/organizer', {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Admin
  getAdminStats: () =>
    fetch('/api/admin/stats', {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  getAdminUsers: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetch(`/api/admin/users?${q}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse);
  },

  updateAdminUser: (id, payload) =>
    fetch(`/api/admin/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }).then(handleResponse),

  getAdminEvents: () =>
    fetch('/api/admin/events', {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  updateAdminEventStatus: (id, payload) =>
    fetch(`/api/admin/events/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }).then(handleResponse),
};

