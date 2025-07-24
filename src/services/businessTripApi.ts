import api from '../apiBase';

export const getBusinessTrips = () => api.get('/business-trips');
export const getBusinessTripById = (id: string) => api.get(`/business-trips/${id}`);

export const createBusinessTrip = (formData: FormData) =>
  api.post('/business-trips', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const updateBusinessTrip = (id: string, formData: FormData) =>
  api.put(`/business-trips/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const deleteBusinessTrip = (id: string) => api.delete(`/business-trips/${id}`); 