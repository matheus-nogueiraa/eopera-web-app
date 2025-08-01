import React from 'react'
import { useState } from 'react'
import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCardImage,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { setTimeout } from 'core-js'

const Login = () => {
  const navigate = useNavigate();
  const [ cpf, setCpf ] = useState('');
  const [ senha, setSenha ] = useState('');
  const [ error, setError ] = useState('');
  // Esconde o erro automaticamente após 2,5 segundos
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 2500);
      return () => clearTimeout(timer);
    }
  }, [error]);
  const [ loading, setLoading ] = useState(false);
  const [ toast, setToast ] = useState({ show: false, message: '', type: '', time: 300 });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!cpf && !senha) {
      setError('CPF e senha são obrigatórios.');
      setLoading(false);
      return;
    } else if (!cpf) {
      setError('CPF é obrigatório.');
      setLoading(false);
      return;
    } else if (!senha) {
      setError('Senha é obrigatória.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`
        },
        body: JSON.stringify({ cpf, senha }),
      });
      if (response.status === 200) {
        // Consulta operador após login
        try {
          const operadorResp = await fetch(`/api/consultarOperador?cpf=${cpf}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`
            },
          });
          if (operadorResp.status === 200) {
            const operadorData = await operadorResp.json();
            if (operadorData.status && operadorData.data) {
              localStorage.setItem('matricula', operadorData.data.matricula);
              localStorage.setItem('nomeUsuario', operadorData.data.nome);
              localStorage.setItem('cpf', operadorData.data.cpf);
            }
          }
        } catch (err) {
          // Falha ao consultar operador, mas login foi bem-sucedido
        }
        setToast({ show: true, message: 'Login realizado com sucesso!', type: 'success' });
        setTimeout(() => {
          setLoading(false);
          navigate('/ranking');
        }, 1200);
      } else {
        setLoading(false);
        setToast({ show: true, message: 'CPF ou senha inválidos.', type: 'error' });
        setError('CPF ou senha inválidos.');
      }
    } catch (err) {
      setLoading(false);
      setToast({ show: true, message: 'Erro ao conectar à API.', type: 'error' });
      setError('Erro ao conectar à API.');
    }
  };

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        {/* Toast simples */}
        {toast.show && (
          <div
            style={{
              position: 'fixed',
              top: 20,
              right: 20,
              zIndex: 9999,
              background: toast.type === 'success' ? '#198754' : '#dc3545',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              minWidth: 200,
              fontWeight: 500,
            }}
          >
            {toast.message}
          </div>
        )}
        <CRow className="justify-content-center">
          <CCol md={4}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleLogin}>
                    <CCardImage src="src/assets/images/Elcop-academy.png" alt="Elcop Academy" width={80} />
                    <p className="text-body-secondary">Entre com cpf e senha</p>
                    {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="CPF"
                        autoComplete="username"
                        value={cpf}
                        onChange={e => setCpf(e.target.value)}
                        disabled={loading}
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Senha"
                        autoComplete="current-password"
                        value={senha}
                        onChange={e => setSenha(e.target.value)}
                        disabled={loading}
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={12}>
                        <CButton type="submit" color="primary" className="w-100 py-1 fw-semibold" style={{ fontSize: 18 }} disabled={loading}>
                          {loading ? (
                            <span>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Entrando...
                            </span>
                          ) : (
                            'Entrar'
                          )}
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login