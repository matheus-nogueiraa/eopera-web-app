import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const nomeUsuario = localStorage.getItem('nomeUsuario');
  if (!nomeUsuario) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
