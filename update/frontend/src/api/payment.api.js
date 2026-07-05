import client from './client';

export const paymentApi = {
  list:   (params) => client.get('/payments', { params }).then((r) => r.data),
  create: (body) => client.post('/payments', body).then((r) => r.data),
  remove: (id) => client.delete(`/payments/${id}`),
};
