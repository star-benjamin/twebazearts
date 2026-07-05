import client from './client';

export const artistApi = {
  list:   (params) => client.get('/artists', { params }).then((r) => r.data),
  detail: (id)     => client.get(`/artists/${id}`).then((r) => r.data),
  create: (body)   => client.post('/artists', body).then((r) => r.data),
  update: (id, body) => client.patch(`/artists/${id}`, body).then((r) => r.data),
  remove: (id)     => client.delete(`/artists/${id}`),
};
