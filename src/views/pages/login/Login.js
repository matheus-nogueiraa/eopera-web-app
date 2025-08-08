import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
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
import './login.css'
import pkg from '../../../../package.json';
import { color } from 'chart.js/helpers'

const Login = () => {
  const navigate = useNavigate();
  const [ cpf, setCpf ] = useState('');
  const [ senha, setSenha ] = useState('');
  const [ error, setError ] = useState('');
  const [ loading, setLoading ] = useState(false);
  const [ toast, setToast ] = useState({ show: false, message: '', type: '', time: 300 });

  // Esconde o erro automaticamente após 2,5 segundos
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 2500);
      return () => clearTimeout(timer);
    }
  }, [ error ]);

  // Esconde o toast após um tempo
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ ...toast, show: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [ toast ]);

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
          navigate('/atestados');
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
    <div className="login-page">
      <style>
      </style>

      {/* Toast */}
      {toast.show && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 9999,
            background: toast.type === 'success' ? '#90171B' : '#dc3545',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: 8,
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            minWidth: 300,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '50%'
          }}>
            {toast.type === 'success' ? '✓' : '!'}
          </div>
          {toast.message}
        </div>
      )}

      <div className="login-container">
        {/* Elementos decorativos */}
        <div className="circle-decoration decoration-1"></div>
        <div className="circle-decoration decoration-2"></div>
        <div className="circle-decoration decoration-3"></div>

        {/* Seção da marca/logo */}
        <div className="brand-section">
          <div className="logo-container">
            <img
              src='https://static.wixstatic.com/media/85cac4_bd48f6aa00f24193893686e9643162e7~mv2.png/v1/fill/w_328,h_194,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Design%20sem%20nome.png'
              alt="Logo"
              className="brand-logo"
            />
          </div>
        </div>

        {/* Seção do formulário */}
        <div className="login-form-section">
          <div className="login-form-container">
            <h1 className="login-heading">Bem-vindo(a)!</h1>
            <p className="login-subheading">Faça login com CPF e senha</p>

            {error && <div className="error-message">{error}</div>}

            <CForm onSubmit={handleLogin}>
              <div className="mb-4">
                <label htmlFor="cpf-input" className="form-label text-white mb-2">CPF</label>
                <CInputGroup>
                  <CInputGroupText>
                    <CIcon icon={cilUser} />
                  </CInputGroupText>
                  <CFormInput
                    id="cpf-input"
                    placeholder="Digite seu CPF"
                    autoComplete="username"
                    value={cpf}
                    onChange={e => setCpf(e.target.value)}
                    disabled={loading}
                    className="form-input"
                  />
                </CInputGroup>
              </div>

              <div className="mb-4">
                <label htmlFor="password-input" className="form-label text-white mb-2">Senha</label>
                <CInputGroup>
                  <CInputGroupText>
                    <CIcon icon={cilLockLocked} />
                  </CInputGroupText>
                  <CFormInput
                    id="password-input"
                    type="password"
                    placeholder="Digite sua senha"
                    autoComplete="current-password"
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    disabled={loading}
                    className="form-input"
                  />
                </CInputGroup>
              </div>

              <CButton
                type="submit"
                color="primary"
                className="w-100 login-btn mt-4"
                disabled={loading}
              >
                {loading ? (
                  <span>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Entrando...
                  </span>
                ) : (
                  'Entrar'
                )}
              </CButton>
            </CForm>
          </div>
        </div>
      </div>
      {/* Versão no canto inferior direito */}
      <div
        style={{
          position: 'fixed',
          right: 16,
          bottom: 10,
          color: 'white',
          opacity: 0.7,
          fontSize: 14,
          zIndex: 9999,
          pointerEvents: 'none',
          userSelect: 'none'
        }}
      >
        Versão: {pkg.version}
      </div>
    </div>
  )
}

export default Login