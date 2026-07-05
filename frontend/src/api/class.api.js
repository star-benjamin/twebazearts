import client from './client';

export const classApi = {
  list:   (params) => client.get('/classes', { params }).then((r) => r.data), // public
  detail: (id) => client.get(`/classes/${id}`).then((r) => r.data),           // public
  book:   (id, body) => client.post(`/classes/${id}/bookings`, body).then((r) => r.data), // public

  create: (body) => client.post('/classes', body).then((r) => r.data),
  update: (id, body) => client.patch(`/classes/${id}`, body).then((r) => r.data),
  remove: (id) => client.delete(`/classes/${id}`),
  roster: (id) => client.get(`/classes/${id}/roster`).then((r) => r.data),
  markAttendance: (id, bookingId, attended) =>
    client.patch(`/classes/${id}/bookings/${bookingId}`, { attended }).then((r) => r.data),
};
