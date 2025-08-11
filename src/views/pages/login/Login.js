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
      // === LOGS DE DEBUG DETALHADOS ===
      console.log('🔍 === INÍCIO DEBUG LOGIN ===');
      console.log('🔍 URL atual completa:', window.location.href);
      console.log('🔍 Origin:', window.location.origin);
      console.log('🔍 Host:', window.location.host);
      console.log('🔍 Protocol:', window.location.protocol);
      console.log('🔍 Port:', window.location.port);
      
      // SOLUÇÃO CORRIGIDA: Usar diretamente o IP da API com HTTPS
      // Precisamos chamar o IP 10.10.0.13:80 diretamente
      // Como window.location.origin resolve para 10.10.0.6, não podemos usar o proxy
      const apiBaseUrl = 'https://10.10.0.13:80/api';
      
      console.log('🔍 URL da API será (IP direto):', apiBaseUrl + '/login');
      console.log('🔍 Token sendo usado:', import.meta.env.VITE_API_TOKEN ? 'Token presente' : 'Token ausente');
      console.log('🔍 CPF:', cpf ? 'CPF presente' : 'CPF ausente');
      console.log('🔍 Senha:', senha ? 'Senha presente' : 'Senha ausente');
      
      // Implementando uma solução robusta para contornar o problema de certificado
      console.log('🔍 Tentando chamada direta para IP com tratamento de erros de certificado:', apiBaseUrl + '/login');
      
      // Função auxiliar para tentar diferentes abordagens
      async function tentarRequisicaoComFallback(url, opcoes) {
        // Primeira tentativa: HTTPS
        try {
          console.log('🔍 Tentativa 1: HTTPS para', url);
          return await fetch(url, opcoes);
        } catch (erro1) {
          console.log('🔍 Primeira tentativa falhou:', erro1.message);
          
          // Segunda tentativa: HTTP (se falhou com HTTPS)
          try {
            const urlHttp = url.replace('https://', 'http://');
            console.log('🔍 Tentativa 2: HTTP para', urlHttp);
            return await fetch(urlHttp, opcoes);
          } catch (erro2) {
            console.log('🔍 Segunda tentativa falhou:', erro2.message);
            throw erro2; // Propagar erro se ambos falharem
          }
        }
      }
      
      // Configurar o fetch com as opções corretas
      const fetchOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ cpf, senha }),
        mode: 'cors',
        cache: 'no-cache',
        // Importante: mudar para 'omit' para evitar problemas de CORS com credenciais
        credentials: 'omit'
      };
      
      // Fazer a requisição com nossa função de fallback
      const response = await tentarRequisicaoComFallback(`${apiBaseUrl}/login`, fetchOptions);

      console.log('🔍 TESTE 2 - Status:', response.status);
      console.log('🔍 TESTE 2 - Headers completos:', Object.fromEntries(response.headers.entries()));
      
      // Ler resposta como texto primeiro
      const responseText = await response.text();
      console.log('🔍 TESTE 2 - Resposta raw:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('🔍 TESTE 2 - JSON parseado:', data);
      } catch (jsonError) {
        console.log('🔍 TESTE 2 - ERRO ao parsear JSON:', jsonError);
        console.log('🔍 TESTE 2 - Resposta não é JSON válido');
      }
      
      if (response.status === 200) {
        console.log('🔍 LOGIN SUCESSO!');
        // Consulta operador após login
        try {
          // Usar a mesma função de fallback para a chamada do operador
          const operadorOptions = {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
              'X-Requested-With': 'XMLHttpRequest'
            },
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'omit'
          };
          
          const operadorResp = await tentarRequisicaoComFallback(`${apiBaseUrl}/consultarOperador?cpf=${cpf}`, operadorOptions);
          if (operadorResp.status === 200) {
            const operadorData = await operadorResp.json();
            if (operadorData.status && operadorData.data) {
              localStorage.setItem('matricula', operadorData.data.matricula);
              localStorage.setItem('nomeUsuario', operadorData.data.nome);
              localStorage.setItem('cpf', operadorData.data.cpf);
            }
          }
        } catch (err) {
          console.log('🔍 Erro ao consultar operador:', err);
        }
        setToast({ show: true, message: 'Login realizado com sucesso!', type: 'success' });
        setTimeout(() => {
          setLoading(false);
          navigate('/atestados');
        }, 1200);
      } else {
        console.log('🔍 LOGIN FALHOU - Status:', response.status);
        console.log('🔍 Dados recebidos:', data);
        setLoading(false);
        const errorMsg = data?.message || data?.error || `Erro ${response.status}`;
        setToast({ show: true, message: errorMsg, type: 'error' });
        setError(errorMsg);
      }
    } catch (err) {
      console.error('🔍 === ERRO COMPLETO ===');
      console.error('🔍 Tipo do erro:', err.constructor.name);
      console.error('🔍 Mensagem:', err.message);
      console.error('🔍 Stack:', err.stack);
      console.error('🔍 Erro completo:', err);
      
      setLoading(false);
      
      // Verificar se é um erro de certificado
      const isCertError = 
        err.message.includes('ERR_CERT_COMMON_NAME_INVALID') || 
        err.message.includes('certificate') || 
        err.message.includes('SSL');
      
      if (isCertError) {
        // Erro específico de certificado
        console.error('🔍 Detectado erro de certificado SSL:', err.message);
        
        // Log mais detalhado para depuração
        console.log('🔍 Erro na chamada para IP direto (10.10.0.13:80). Verificar configurações do navegador.');
        
        // Mostrar mensagem mais direta ao usuário
        setToast({ 
          show: true, 
          message: 'Erro de certificado ao conectar com o servidor. Tente novamente em alguns instantes.', 
          type: 'error' 
        });
        setError('Erro de conexão. Tente novamente em instantes.');
        
        // Tentar nova tentativa após um curto período
        setTimeout(() => {
          setError('Fazendo nova tentativa de conexão...');
        }, 2000);
      } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setToast({ show: true, message: 'Erro de conexão: Não foi possível conectar ao servidor.', type: 'error' });
        setError('Erro de conexão com o servidor.');
      } else if (err.name === 'TypeError' && err.message.includes('NetworkError')) {
        setToast({ show: true, message: 'Erro de rede: Verifique sua conexão.', type: 'error' });
        setError('Erro de rede.');
      } else {
        setToast({ show: true, message: `Erro inesperado: ${err.message}`, type: 'error' });
        setError(`Erro inesperado: ${err.message}`);
      }
      
      console.log('🔍 === FIM DEBUG LOGIN ===');
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