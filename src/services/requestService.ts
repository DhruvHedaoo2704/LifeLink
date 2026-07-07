import apiClient from '../api/apiClient';

export interface RequestFilter {
  bloodType?: string;
  urgency?: string;
  status?: string;
  lat?: number;
  lng?: number;
  maxDistanceKm?: number;
  page?: number;
  limit?: number;
}

export const createBloodRequest = async (requestData: any) => {
  const response = await apiClient.post('/requests', requestData);
  return response.data.data;
};

export const getBloodRequests = async (filters: RequestFilter = {}) => {
  const response = await apiClient.get('/requests', { params: filters });
  return response.data.data;
};

export const respondToRequest = async (requestId: string, actionData: { response: 'yes' | 'no'; estimatedArrival?: string; message?: string }) => {
  const response = await apiClient.post(`/requests/${requestId}/respond`, actionData);
  return response.data.data;
};

export const updateRequestStatus = async (requestId: string, status: string, note?: string) => {
  const response = await apiClient.patch(`/requests/${requestId}/status`, { status, note });
  return response.data.data;
};
