import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);

// Users
export const getMe = () => api.get('/users/me');
export const updateMe = (data) => api.put('/users/me', data);

// Doctors
export const getDoctors = (params) => api.get('/doctors', { params });
export const getDoctor = (id) => api.get(`/doctors/${id}`);
export const addSlots = (slots) => api.post('/doctors/slots', { slots });
export const deleteSlot = (slotId) => api.delete(`/doctors/slots/${slotId}`);
export const updateDoctorProfile = (data) => api.put('/doctors/profile', data);

// Appointments
export const bookAppointment = (data) => api.post('/appointments', data);
export const getMyAppointments = () => api.get('/appointments/my');
export const getDoctorAppointments = () => api.get('/appointments/doctor');
export const updateAppointmentStatus = (id, data) => api.put(`/appointments/${id}/status`, data);
export const cancelAppointment = (id) => api.put(`/appointments/${id}/cancel`);
export const rescheduleAppointment = (id, data) => api.put(`/appointments/${id}/reschedule`, data);
export const rateAppointment = (id, data) => api.post(`/appointments/${id}/rate`, data);

// Admin
export const getAdminMetrics = () => api.get('/admin/metrics');
export const getAdminDoctors = () => api.get('/admin/doctors');
export const getAdminPatients = () => api.get('/admin/patients');
export const approveDoctor = (id) => api.put(`/admin/doctors/${id}/approve`);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);

export default api;
