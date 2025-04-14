import axios from "axios";
const API_URL = "http://localhost:5146/api"  // ⚠️ Cambia si tu puerto es diferente, también en vite.config.js

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log("¿Hay token?", !!token);
    if (token) {
      console.log("Token encontrado:", token);
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
      console.log("URL de login:", `${API_URL}/auth/login`);
      console.log("Credenciales a enviar:", credentials);
      
      const response = await api.post('/auth/login', credentials);
      console.log("Respuesta del servidor:", response);
      
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
      console.log('Intentando obtener empleados desde:', API_URL + '/employee');
      const response = await api.get('/employee');
      console.log('Respuesta recibida:', response);
      return response.data;
    } catch (error) {
      console.log('Error completo:', error);
      throw error;
    }
  },
  /*getById: async (id) => {
    console.log("Se encontraron los empleados hola", id);
    try {
      const response = await api.get(`/employee/${id}`);
      console.log("Se encontraron los empleados", response);
      return response.data;
    } catch (error) {
      console.log("No se encontraron empleado");
      throw error;
    }
  },*/
  create: async (employee) => {
    try {
      const response = await api.post('/employee', employee);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  update: async (id, employee) => {
    try {
      const response = await api.put(`/employee/${id}`, employee);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  delete: async (id) => {
    try {
      const response = await api.delete(`/employee/${id}`);
      console.log("Se encontraron los empleados", response);
      return response.data;
    } catch (error) {
      console.log("No se encontraron empleado");
      throw error;
    }
  },
  getDepartments: async () => {
    try {
      const response = await api.get('/employee/departments');
      console.log("Se encontraron los departamentos", response);
      return response.data;
    } catch (error) {
      console.log("No se encontraron departamentos");
      throw error;
    }
  },
  getPositionsByDepartment: async (department_Id) => {
    try {
      const response = await api.get(`/employee/departments/${department_Id}/positions`);
      console.log("Se encontraron las posiciones", response);
      return response.data;
    } catch (error) {      
      console.log("No se encontraron posiciones");
      throw error;
    }
  },
};
export default api;
