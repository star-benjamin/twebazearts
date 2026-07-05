import client from './client';

export const testimonialApi = {
  list:   (params) => client.get('/testimonials', { params }).then((r) => r.data),
  create: (body) => client.post('/testimonials', body).then((r) => r.data),
  update: (id, body) => client.patch(`/testimonials/${id}`, body).then((r) => r.data),
  remove: (id) => client.delete(`/testimonials/${id}`),
};
