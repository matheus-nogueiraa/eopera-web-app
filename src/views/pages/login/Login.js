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
    console.log('🔍 === INÍCIO DEBUG LOGIN ===');
    
    // CORREÇÃO PRINCIPAL: Usar o proxy do Nginx em vez de IP direto
    // O Nginx está configurado para fazer proxy de /api para https://10.10.0.13:80
    const apiBaseUrl = `${window.location.origin}/api`;
    
    console.log('🔍 URL da API (via proxy):', apiBaseUrl + '/login');
    console.log('🔍 Origin atual:', window.location.origin);
    
    // Configurar o fetch de forma simples
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
      },
      body: JSON.stringify({ cpf, senha }),
    };
    
    console.log('🔍 Fazendo requisição via proxy do Nginx...');
    
    // Fazer uma única requisição via proxy
    const response = await fetch(`${apiBaseUrl}/login`, fetchOptions);

    console.log('🔍 Status da resposta:', response.status);
    console.log('🔍 Headers:', Object.fromEntries(response.headers.entries()));
    
    // Processar a resposta
    const data = await response.json();
    console.log('🔍 Dados recebidos:', data);
    
    if (response.status === 200) {
      console.log('🔍 LOGIN SUCESSO!');
      
      // Consulta operador após login (também via proxy)
      try {
        const operadorResp = await fetch(`${apiBaseUrl}/consultarOperador?cpf=${cpf}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
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
        console.log('🔍 Erro ao consultar operador:', err);
      }
      
      setToast({ show: true, message: 'Login realizado com sucesso!', type: 'success' });
      setTimeout(() => {
        setLoading(false);
        navigate('/atestados');
      }, 1200);
      
    } else {
      console.log('🔍 LOGIN FALHOU - Status:', response.status);
      setLoading(false);
      const errorMsg = data?.message || data?.error || `Erro ${response.status}`;
      setToast({ show: true, message: errorMsg, type: 'error' });
      setError(errorMsg);
    }
    
  } catch (err) {
    console.error('🔍 === ERRO COMPLETO ===');
    console.error('🔍 Erro:', err);
    
    setLoading(false);
    setToast({ 
      show: true, 
      message: 'Erro de conexão com o servidor. Tente novamente.', 
      type: 'error' 
    });
    setError('Erro de conexão com o servidor.');
    
    console.log('🔍 === FIM DEBUG LOGIN ===');
  }
};