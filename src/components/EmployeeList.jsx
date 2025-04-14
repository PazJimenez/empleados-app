// src/components/EmployeeList.jsx
import React, { useState, useEffect } from 'react';
import { employeeService } from '../services/api';
import { Link } from 'react-router-dom';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getAll();
      setEmployees(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Error al cargar los empleados. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchEmployees();

    // Alternativa con datos de prueba si la API no responde
    /*
    const mockData = [
      {
        id: "1",
        name: "Juan Pérez",
        email: "juan@ejemplo.com",
        department_Id: "1",
        department: "Tecnología",
        position: "Desarrollador",
        position_Id: "1"
      },
      {
        id: "2",
        name: "María González",
        email: "maria@ejemplo.com",
        department_Id: "2",
        department: "Recursos Humanos",
        position: "Gerente",
        position_Id: "2"
      }
    ];
    setEmployees(mockData);
    setLoading(false);
    */

  }, []);
  
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este empleado?')) {
      try {
        await employeeService.delete(id);
        setEmployees(employees.filter(emp => emp.id !== id));
      } catch (err) {
        console.error('Error deleting employee:', err);
        alert('Error al eliminar el empleado');
      }
    }
  };
  
  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
  }
  
  if (error) {
    return <div className="alert alert-danger m-3">{error}</div>;
  }
  
  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Lista de Empleados</h2>
        <Link to="/employees/new" className="btn btn-success">
          <i className="bi bi-plus-circle"></i> Nuevo Empleado
        </Link>
      </div>
      
      {employees.length === 0 ? (
        <div className="alert alert-info">No hay empleados registrados.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Departamento</th>
                <th>Cargo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.id}</td>
                  <td>{employee.name}</td>
                  <td>{employee.email}</td>
                  <td>{employee.department}</td>
                  <td>{employee.position}</td>
                  <td>
                    <div className="btn-group" role="group">
                      {/*<Link 
                        to={`/employees/${employee.id}`} 
                        className="btn btn-sm btn-info"
                      >
                        <i className="bi bi-eye"></i>
                      </Link>*/}
                      <Link 
                        to={`/employees/edit/${employee.id}`} 
                        className="btn btn-sm btn-warning"
                      >
                        <i className="bi bi-pencil"></i>
                      </Link>
                      <button 
                        onClick={() => handleDelete(employee.id)} 
                        className="btn btn-sm btn-danger"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;