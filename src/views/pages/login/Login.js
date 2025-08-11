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
      // Preparar CPF (remover formatação)
      const cpfLimpo = cpf.replace(/[^\d]/g, '');
      
      // URL a ser usada - temporariamente usando conexão direta
      const apiUrl = 'https://adm.elcop.eng.br:443/api/login';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          cpf: cpfLimpo,
          senha 
        })
      });
      
      // Ler resposta como texto primeiro
      const responseText = await response.text();
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.log('🔍 Erro ao parsear JSON:', jsonError);
      }
      
      if (response.status === 200) {
        // === LOGS ESPECÍFICOS PARA CONSULTA DO OPERADOR ===
        console.log('🔍 === INÍCIO CONSULTA OPERADOR ===');
        
        // Consulta operador após login
        try {
          console.log('🔍 CPF limpo para consulta:', cpfLimpo);
          
          const operadorResp = await fetch(`/api/consultarOperador?cpf=${cpfLimpo}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`
            },
          });
          
          console.log('🔍 Status da consulta operador:', operadorResp.status);
          
          if (operadorResp.status === 200) {
            const operadorData = await operadorResp.json();
            console.log('🔍 Dados do operador recebidos:', operadorData);
            
            if (operadorData.status && operadorData.data) {
              console.log('🔍 Dados válidos do operador - salvando no localStorage...');
              console.log('🔍 Matricula:', operadorData.data.matricula);
              console.log('🔍 Nome:', operadorData.data.nome);
              console.log('🔍 CPF:', operadorData.data.cpf);
              
              localStorage.setItem('matricula', operadorData.data.matricula);
              localStorage.setItem('nomeUsuario', operadorData.data.nome);
              localStorage.setItem('cpf', operadorData.data.cpf);
              
              // Verificar se foi salvo no localStorage
              console.log('🔍 Verificando localStorage após salvar:');
              console.log('🔍 localStorage.nomeUsuario:', localStorage.getItem('nomeUsuario'));
              console.log('🔍 localStorage.matricula:', localStorage.getItem('matricula'));
              console.log('🔍 localStorage.cpf:', localStorage.getItem('cpf'));
            } else {
              console.log('🔍 ERRO: Dados do operador inválidos ou ausentes');
              console.log('🔍 operadorData.status:', operadorData.status);
              console.log('🔍 operadorData.data:', operadorData.data);
            }
          } else {
            console.log('🔍 ERRO: Falha na consulta do operador - Status:', operadorResp.status);
            const errorText = await operadorResp.text();
            console.log('🔍 Resposta de erro:', errorText);
          }
        } catch (err) {
          console.log('🔍 ERRO CATCH na consulta operador:', err);
        }
        
        console.log('🔍 === FIM CONSULTA OPERADOR ===');
        
        setToast({ show: true, message: 'Login realizado com sucesso!', type: 'success' });
        setTimeout(() => {
          setLoading(false);
          navigate('/atestados');
        }, 1200);
      } else {
        setLoading(false);
        const errorMsg = data?.message || data?.error || `Erro ${response.status}`;
        setToast({ show: true, message: errorMsg, type: 'error' });
        setError(errorMsg);
      }
    } catch (err) {
      setLoading(false);
      
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setToast({ show: true, message: 'Erro de conexão: Não foi possível conectar ao servidor.', type: 'error' });
        setError('Erro de conexão com o servidor.');
      } else if (err.name === 'TypeError' && err.message.includes('NetworkError')) {
        setToast({ show: true, message: 'Erro de rede: Verifique sua conexão.', type: 'error' });
        setError('Erro de rede.');
      } else {
        setToast({ show: true, message: `Erro inesperado: ${err.message}`, type: 'error' });
        setError(`Erro inesperado: ${err.message}`);
      }
    }
  };

  // Função para testar conexão direta com a API
  
  
  // Função para testar conexão direta com o backend, ignorando o Nginx
  

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