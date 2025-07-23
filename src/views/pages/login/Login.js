import React from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
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
          'Authorization': 'Bearer @k)1qlny;dG!ogXC]us7XB(2LzE{@w'
        },
        body: JSON.stringify({ cpf, senha }),
      });
      if (response.status === 200) {
        const result = await response.json();
        localStorage.setItem('nomeUsuario', result.data.nomeLeiturista);
        localStorage.setItem('cpf', cpf);
        localStorage.setItem('matricula', result.data.matricula);
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
                    <h1>Elcop Academy</h1>
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
                        <CButton type="submit" color="primary" className="w-100 py-2 fw-semibold" style={{ fontSize: 18 }}>
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