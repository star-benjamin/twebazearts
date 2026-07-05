import client from './client';

export const commissionApi = {
  submit: (body) => client.post('/commissions', body).then((r) => r.data), // public
  createFromInquiry: (inquiry_id) => client.post('/commissions/from-inquiry', { inquiry_id }).then((r) => r.data),
  list:   () => client.get('/commissions').then((r) => r.data),
  detail: (id) => client.get(`/commissions/${id}`).then((r) => r.data),
  update: (id, body) => client.patch(`/commissions/${id}`, body).then((r) => r.data),
};
