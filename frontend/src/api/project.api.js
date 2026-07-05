import client from './client';

export const projectApi = {
  create: (body) => client.post('/projects', body).then((r) => r.data),
  list:   (params) => client.get('/projects', { params }).then((r) => r.data),
  detail: (id) => client.get(`/projects/${id}`).then((r) => r.data),
  update: (id, body) => client.patch(`/projects/${id}`, body).then((r) => r.data),
};
