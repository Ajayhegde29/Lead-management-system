import api from './api';

export async function getFollowUps(leadId) {
  const response = await api.get(`/leads/${leadId}/follow-ups`);
  return response.data;
}

export async function addFollowUp(leadId, payload) {
  const response = await api.post(`/leads/${leadId}/follow-ups`, payload);
  return response.data;
}
