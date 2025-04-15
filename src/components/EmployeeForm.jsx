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
  // Se agregan estas constantes para utilizar los datos estáticos
  //const [availablePositions, setAvailablePositions] = useState([]);

  /*Datos estáticos de departamentos y posiciones
  const departmentData = [
    { id: "dept1", name: "Administración" },
    { id: "dept2", name: "Desarrollo" },
    { id: "dept3", name: "Marketing" },
    { id: "dept4", name: "Recursos Humanos" },
    { id: "dept5", name: "Ventas" }
  ];
  
  // Mapeo de posiciones por departamento
  const positionData = {
    dept1: [
      { id: "pos1", name: "Gerente Administrativo" },
      { id: "pos2", name: "Asistente Administrativo" },
      { id: "pos3", name: "Contador" }
    ],
    dept2: [
      { id: "pos4", name: "Desarrollador Frontend" },
      { id: "pos5", name: "Desarrollador Backend" },
      { id: "pos6", name: "Ingeniero QA" },
      { id: "pos7", name: "DevOps" }
    ],
    dept3: [
      { id: "pos8", name: "Gerente de Marketing" },
      { id: "pos9", name: "Especialista en Redes Sociales" },
      { id: "pos10", name: "Diseñador Gráfico" }
    ],
    dept4: [
      { id: "pos11", name: "Gerente de RRHH" },
      { id: "pos12", name: "Reclutador" },
      { id: "pos13", name: "Especialista en Compensaciones" }
    ],
    dept5: [
      { id: "pos14", name: "Gerente de Ventas" },
      { id: "pos15", name: "Representante de Ventas" },
      { id: "pos16", name: "Ejecutivo de Cuentas" }
    ]
  };*/
  

  //Cargar departamentos desde el backend
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

  /* Actualizar las posiciones disponibles cuando cambia el departamento (datos estáticos)
  useEffect(() => {
    if (employee.department_Id) {
      setAvailablePositions(positionData[employee.department_Id] || []);
    } else {
      setAvailablePositions([]);
    }
  }, [employee.department_Id]);*/
  
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

      /* agregar esta configuración si se quiere dejar los datos estáticos
      setEmployee({
        ...data,
        department_Id: data.department_Id || '',
        position_Id: data.position_Id || ''
      });
         hasta aqui*/
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
      // quitar comentario si se quiere usar datos estáticos
      //const selectedDept = departmentData.find(dept => dept.id === value);
      setEmployee({
        ...employee,
        department_Id: value,
        department: selectedDept ? selectedDept.name : '',
        position_Id: '',
        position: ''
      });
    } else if (name === 'position_Id') {
      const selectedPos = positions.find(pos => pos.id === value);
      // quitar comentario si se quiere usar datos estáticos
      //const selectedPos = availablePositions.find(pos => pos.id === value);
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
            /* quitar comentario si se quiere usar datos del backend
            {departmentData.map((dept) => (*/
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
            /* quitar comentario si se quiere usar datos del backend
            {availablePositions.map((pos) => (*/
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