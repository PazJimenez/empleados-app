// src/pages/DashboardPage.jsx
import React from 'react';
import EmployeeList from '../components/EmployeeList';

const DashboardPage = () => {
  return (
    <div className="container">
      <h1 className="my-4">Panel de Empleados</h1>
      <EmployeeList />
    </div>
  );
};

export default DashboardPage;