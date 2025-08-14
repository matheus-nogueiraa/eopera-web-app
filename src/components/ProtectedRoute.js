import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePermissoesContext } from '../contexts/PermissoesContext';
import { CSpinner, CContainer } from '@coreui/react';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const nomeUsuario = localStorage.getItem('nomeUsuario');
  const { verificarPermissaoRota, loading } = usePermissoesContext();
  
  // Se não há usuário logado, redirecionar para login
  if (!nomeUsuario) {
    return <Navigate to="/login" replace />;
  }

  // Enquanto carrega as permissões, mostrar loading
  if (loading) {
    return (
      <CContainer className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <CSpinner color="primary" />
      </CContainer>
    );
  }

  // Verificar se o usuário tem permissão para acessar a rota atual
  const rotaAtual = location.pathname;
  const temPermissao = verificarPermissaoRota(rotaAtual);

  // Se não tem permissão, redirecionar para home
  if (!temPermissao) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default ProtectedRoute;
