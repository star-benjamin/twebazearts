import client from './client';

export const artworkApi = {
  list:      (params) => client.get('/artworks', { params }).then((r) => r.data),
  detail:    (id)     => client.get(`/artworks/${id}`).then((r) => r.data),
  create:    (body)   => client.post('/artworks', body).then((r) => r.data),
  update:    (id, body) => client.patch(`/artworks/${id}`, body).then((r) => r.data),
  remove:    (id)     => client.delete(`/artworks/${id}`),
  addImage:    (id, body) => client.post(`/artworks/${id}/images`, body).then((r) => r.data),
  removeImage: (id, imageId) => client.delete(`/artworks/${id}/images/${imageId}`),
  listCategories: () => client.get('/artworks/categories').then((r) => r.data),
  createCategory: (body) => client.post('/artworks/categories', body).then((r) => r.data),
};
