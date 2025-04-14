// src/components/EmployeeForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { employeeService } from '../services/api';

const EmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [employee, setEmployee] = useState({
    name: '',
    email: '',
    department_Id: '',
    department: '',
    position_Id: '',
    position: ''
  });
  
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Cargar departamentos
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setDataLoading(true);
        const data = await employeeService.getDepartments();
        console.log("Departamento", data);
        setDepartments(data);
      } catch (error) {
        console.error('Error loading departments:', error);
        setSubmitError('No se pudieron cargar los departamentos');
      } finally {
        setDataLoading(false);
      }
    };
    
    fetchDepartments();
  }, []);
  
  // Cargar posiciones cuando cambia el departamento
  useEffect(() => {
    const fetchPositions = async () => {
      if (!employee.department_Id) return;
      
      try {
        setDataLoading(true);
        const data = await employeeService.getPositionsByDepartment(employee.department_Id);
        setPositions(data);
      } catch (error) {
        console.error('Error loading positions:', error);
      } finally {
        setDataLoading(false);
      }
    };
    
    fetchPositions();
  }, [employee.department_Id]);
  
  // Cargar empleado si estamos editando
  useEffect(() => {
    if (isEditing) {
      fetchEmployee();
    }
  }, [id]);
  
  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getById(id);
      setEmployee(data);
    } catch (error) {
      console.error('Error fetching employee:', error);
      setSubmitError('No se pudo cargar la información del empleado.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
   if (!employee.name || !employee.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    
    if (!employee.email || !employee.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(employee.email)) {
      newErrors.email = 'El email no es válido';
    }
    
    if (!employee.department_Id) {
      newErrors.department_Id = 'El departamento es requerido';
    }
    
    if (!employee.position_Id) {
      newErrors.position_Id = 'El cargo es requerido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Si cambia el departamento, resetear la posición
    if (name === 'department_Id') {
      const selectedDept = departments.find(dept => dept.id === value);
      setEmployee({
        ...employee,
        department_Id: value,
        department: selectedDept ? selectedDept.name : '',
        position_Id: '',
        position: ''
      });
    } else if (name === 'position_Id') {
      const selectedPos = positions.find(pos => pos.id === value);
      setEmployee({
        ...employee,
        position_Id: value,
        position: selectedPos ? selectedPos.name : ''
      });
    } else {
      setEmployee({
        ...employee,
        [name]: value
      });
    }    
    // Eliminar el error cuando el usuario escribe
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setSubmitError('');
      
      if (isEditing) {
        await employeeService.update(id, employee);
      } else {
        await employeeService.create(employee);
      }
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving employee:', error);
      setSubmitError(
        error.response?.data?.message || 
        'Error al guardar la información. Por favor, intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && isEditing) {
    return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
  }
  
  return (
    <div className="container mt-4">
      <h2>{isEditing ? 'Editar Empleado' : 'Nuevo Empleado'}</h2>
      
      {submitError && <div className="alert alert-danger">{submitError}</div>}
      
      <form onSubmit={handleSubmit} className="mt-3">
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Nombre Completo</label>
          <input
            type="text"
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            id="name"
            name="name"
            value={employee.name}
            onChange={handleChange}
            placeholder="Ej: Juan Pérez"
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>
        
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            id="email"
            name="email"
            value={employee.email}
            onChange={handleChange}
            placeholder="correo@ejemplo.com"
          />
          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
        </div>
        
        <div className="mb-3">
          <label htmlFor="department_Id" className="form-label">Departamento</label>
          <select
            className={`form-select ${errors.department_Id ? 'is-invalid' : ''}`}
            id="department_Id"
            name="department_Id"
            value={employee.department_Id}
            onChange={handleChange}
            disabled={dataLoading}
          >
            <option value="">Seleccione un departamento</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          {errors.department_Id && <div className="invalid-feedback">{errors.department_Id}</div>}
        </div>
        
        <div className="mb-3">
          <label htmlFor="position_Id" className="form-label">Cargo</label>
          <select
            className={`form-select ${errors.position_Id ? 'is-invalid' : ''}`}
            id="position_Id"
            name="position_Id"
            value={employee.position_Id}
            onChange={handleChange}
            disabled={!employee.department_Id || dataLoading}
          >
            <option value="">Seleccione un cargo</option>
            {positions.map((pos) => (
              <option key={pos.id} value={pos.id}>
                {pos.name}
              </option>
            ))}
          </select>
          {errors.position_Id && <div className="invalid-feedback">{errors.position_Id}</div>}
          {!employee.department_Id && <small className="text-muted">Primero seleccione un departamento</small>}
        </div>
        
        <div className="mt-4 d-flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={loading || dataLoading}>
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => navigate('/dashboard')}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;