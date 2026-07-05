import client from './client';

export const adminApi = {
  dashboard: () => client.get('/admin/dashboard').then((r) => r.data),
};
