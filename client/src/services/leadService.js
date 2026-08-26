import api from './api';

export async function getLeads(params) {
  const response = await api.get('/leads', { params });
  return response.data;
}

export async function getLead(id) {
  const response = await api.get(`/leads/${id}`);
  return response.data;
}

export async function createLead(payload) {
  const response = await api.post('/leads', payload);
  return response.data;
}

export async function updateLead(id, payload) {
  const response = await api.put(`/leads/${id}`, payload);
  return response.data;
}

export async function deleteLead(id) {
  const response = await api.delete(`/leads/${id}`);
  return response.data;
}
