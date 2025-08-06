// services/api.js
import axios from "axios";

const API_URL = "https://appointment-booking-system-backend.onrender.com/api";

// Create axios instance with interceptors for better error handling
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to log outgoing requests (helpful for debugging)
api.interceptors.request.use(
  (config) => {
    console.log(
      `Making ${config.method.toUpperCase()} request to ${config.url}`,
      config.data || config.params
    );
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to log responses
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Doctor services
export const getDoctors = () => api.get("/doctors");
export const getDoctor = (id) => api.get(`/doctors/${id}`);
export const getDoctorSlots = (id, date) =>
  api.get(`/doctors/${id}/slots`, { params: { date } });

// Appointment services
export const getAppointments = () => api.get("/appointments");
export const getAppointment = (id) => api.get(`/appointments/${id}`);
// export const createAppointment = (appointmentData) =>
//   api.post("/appointments", appointmentData);
export const createAppointment = async (appointmentData) => {
  console.log("Sending appointment data:", appointmentData);
  try {
    const response = await api.post("/appointments", appointmentData);
    console.log("Appointment created successfully:", response.data);
    return response;
  } catch (error) {
    console.error(
      "API create appointment error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const updateAppointment = (id, appointmentData) =>
  api.put(`/appointments/${id}`, appointmentData);
export const deleteAppointment = (id) => api.delete(`/appointments/${id}`);

export default api;
