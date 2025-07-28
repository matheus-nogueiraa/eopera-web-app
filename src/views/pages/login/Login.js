import React from 'react'
import { useState } from 'react'
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

const Login = () => {
  const navigate = useNavigate();
  const [ cpf, setCpf ] = useState('');
  const [ senha, setSenha ] = useState('');
  const [ error, setError ] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!cpf && !senha) {
      setError('CPF e senha são obrigatórios.');
      return;
    } else if (!cpf) {
      setError('CPF é obrigatório.');
      return;
    } else if (!senha) {
      setError('Senha é obrigatória.');
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
        navigate('/dashboard');
      } else {
        setError('CPF ou senha inválidos.');
      }
    } catch (err) {
      setError('Erro ao conectar à API.');
    }
  };

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={4}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleLogin}>
                    <CCardImage src="src/assets/images/Elcop academy.png" alt="Elcop Academy" width={80} />
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
                       
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={12}>
                        <CButton type="submit" color="primary" className="w-100 py-1 fw-semibold" style={{ fontSize: 16 }}>
                          Login
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