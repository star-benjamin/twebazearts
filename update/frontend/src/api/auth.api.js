import client from './client';

export const authApi = {
  login:  (body) => client.post('/auth/login', body).then((r) => r.data),
  logout: ()     => client.post('/auth/logout').then((r) => r.data),
  me:     ()     => client.get('/auth/me').then((r) => r.data),
  updateProfile: (body) => client.patch('/auth/profile', body).then((r) => r.data),
};
