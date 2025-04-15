import axios from "axios";
const API_URL = "http://localhost:5146/api"  // ⚠️ Cambia si tu puerto es diferente, también en vite.config.js

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.log("No se encontró token en localStorage");
    }
    return config;
  },
);

// Servicios para autenticación
export const authService = {
  login: async (credentials) => {
    try {
          const response = await api.post('/auth/login', credentials);
      
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        console.log("Token guardado en localStorage");
      }
      return response.data;
    } catch (error) {
      console.error("Error completo:", error);
      throw error;
    }
  },
  logout: () => {
    localStorage.removeItem('token');
  },
 isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
      /* isAuthenticated: () => {
      // Durante el desarrollo, siempre devuelve true para omitir la autenticación
      return true; // Cambiar a localStorage.getItem('token') cuando esté listo para producción
    }*/
};

// Servicios para empleados
export const employeeService = {
  getAll: async () => {
    try {
      const response = await api.get('/employee');
      return response.data;
    } catch (error) {
      console.log('Error completo:', error);
      throw error;
    }
  },
  getById: async (id) => {
    try {
      const response = await api.get(`/employee/${id}`);
      return response.data;
    } catch (error) {
      console.log("No se encontraron empleado");
      throw error;
    }
  },
  create: async (employee) => {
    try {
      const response = await api.post('/employee', employee);
      return response.data;
    } catch (error) {
      console.log("No se pudo crear empleado");
      throw error;
    }
  },
  update: async (id, employee) => {
    try {
      const response = await api.put(`/employee/${id}`, employee);
      return response.data;
    } catch (error) {
      console.log("No se encontraron empleado");
      throw error;
    }
  },
  delete: async (id) => {
    try {
      const response = await api.delete(`/employee/${id}`);
      return response.data;
    } catch (error) {
      console.log("No se encontraron empleado");
      throw error;
    }
  },
  getDepartments: async () => {
    try {
      const response = await api.get('/employee/departments');
      return response.data;
    } catch (error) {
      console.log("No se encontraron departamentos");
      throw error;
    }
  },
  getPositionsByDepartment: async (department_Id) => {
    try {
      const response = await api.get(`/employee/departments/${department_Id}/positions`);
      return response.data;
    } catch (error) {      
      console.log("No se encontraron posiciones");
      throw error;
    }
  },
};
export default api;
