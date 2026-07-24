import client from './client';

export const blogApi = {
  list:        (params) => client.get('/blog', { params }).then((r) => r.data),
  detailBySlug: (slug) => client.get(`/blog/slug/${slug}`).then((r) => r.data),
  create: (body) => client.post('/blog', body).then((r) => r.data),
  update: (id, body) => client.patch(`/blog/${id}`, body).then((r) => r.data),
  remove: (id) => client.delete(`/blog/${id}`),
  exportPdf: (id) => client.get(`/blog/${id}/export-pdf`, { responseType: 'blob' }).then((r) => r.data),
};
