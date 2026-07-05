import client from './client';

export const inquiryApi = {
  submit: (body) => client.post('/inquiries', body).then((r) => r.data), // public
  list:   (params) => client.get('/inquiries', { params }).then((r) => r.data),
  detail: (id)   => client.get(`/inquiries/${id}`).then((r) => r.data),
  update: (id, body) => client.patch(`/inquiries/${id}`, body).then((r) => r.data),
  generateQuote: (id, body) => client.post(`/inquiries/${id}/quote`, body).then((r) => r.data),
};
