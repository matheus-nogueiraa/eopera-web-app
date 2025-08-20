import { useState, useEffect } from 'react';
// sessionManager.js

class SessionManager {
  constructor() {
    this.sessionData = null;
    this.sessionTimeout = null;
    this.sessionDuration = 30 * 60 * 1000; // 30 minutos
    this.warningTime = 5 * 60 * 1000; // Aviso 5 minutos antes
    this.listeners = [];

    // Verifica se existe sessão ativa no sessionStorage (mais seguro que localStorage)
    this.initializeSession();
  }

  // Inicializa a sessão
  initializeSession() {
    try {
      // Tenta carregar do sessionStorage primeiro (más seguro)
      let sessionKey = sessionStorage.getItem('session_key');
      let sessionExpiry = sessionStorage.getItem('session_expiry');
      let encryptedData = sessionStorage.getItem('session_data');
      let loadedFromLocal = false;

      // Se não existir em sessionStorage, tenta localStorage (caso "lembrar-me")
      if (!sessionKey || !sessionExpiry || !encryptedData) {
        const lk = localStorage.getItem('session_key');
        const le = localStorage.getItem('session_expiry');
        const ld = localStorage.getItem('session_data');
        if (lk && le && ld) {
          sessionKey = lk;
          sessionExpiry = le;
          encryptedData = ld;
          loadedFromLocal = true;
        }
      }

      if (sessionKey && sessionExpiry && encryptedData) {
        const now = new Date().getTime();
        const expiryTime = parseInt(sessionExpiry, 10);

        if (now < expiryTime) {
          // Descriptografa e restaura sessão
          const data = this.decrypt(encryptedData, sessionKey);
          if (data) {
            this.sessionData = data;

            // Garante que sessionStorage esteja preenchido nesta aba (para APIs que leem só sessionStorage)
            try {
              sessionStorage.setItem('session_key', sessionKey);
              sessionStorage.setItem('session_data', encryptedData);
              sessionStorage.setItem('session_expiry', expiryTime.toString());
            } catch (err) {
              // falha ao escrever sessionStorage não bloqueia a sessão
            }

            // Sincroniza localStorage com chaves compat (nome/cpf/etc.)
            try {
              localStorage.setItem('nomeUsuario', data.nome || '');
              localStorage.setItem('cpf', data.cpf || '');
              localStorage.setItem('matricula', data.matricula || '');
              localStorage.setItem('admin', data.admin || 'N');
            } catch (err) {
              // ignora
            }

            // Ajusta timer com o tempo restante
            this.startSessionTimer(expiryTime - now);
            return true;
          } else {
            // problema na descriptografia -> limpa
            this.clearSession();
          }
        } else {
          // expirou
          this.clearSession();
        }
      }
    } catch (error) {
      console.error('Erro ao inicializar sessão:', error);
      this.clearSession();
    }
    return false;
  }

  // Cria uma nova sessão
  createSession(userData, rememberMe = false) {
    try {
      // Gera chave da sessão
      const sessionKey = this.generateSessionKey();
      const now = new Date().getTime();
      // duração padrão do manager é 30min; quando lembrar, usa 1 dia (24h)
      const duration = rememberMe ? 24 * 60 * 60 * 1000 : this.sessionDuration;
      const expiryTime = now + duration;

      // Dados que vão para a sessão (apenas dados não sensíveis)
      const sessionData = {
        userId: userData.id,
        nome: userData.nome,
        cpf: userData.cpf,
        matricula: userData.matricula,
        admin: userData.admin,
        tipoUsuario: userData.tipoUsuario,
        supervisor: userData.supervisor,
        loginTime: now
      };

      // Criptografa os dados
      const encryptedData = this.encrypt(sessionData, sessionKey);

      // Armazena no sessionStorage (mais seguro que localStorage)
      if (rememberMe) {
        // Para "lembrar", cria também entries em localStorage para persistência entre abas/reinícios
        try {
          localStorage.setItem('session_key', sessionKey);
          localStorage.setItem('session_data', encryptedData);
          localStorage.setItem('session_expiry', expiryTime.toString());
          localStorage.setItem('remember_token', this.generateRememberToken(userData.id));
        } catch (err) {
          console.warn('Não foi possível gravar sessão no localStorage:', err);
        }
      } else {
        // garante que não permaneça no localStorage se não for lembrar
        try {
          localStorage.removeItem('session_key');
          localStorage.removeItem('session_data');
          localStorage.removeItem('session_expiry');
          localStorage.removeItem('remember_token');
        } catch (err) { }
      }

      sessionStorage.setItem('session_key', sessionKey);
      sessionStorage.setItem('session_data', encryptedData);
      sessionStorage.setItem('session_expiry', expiryTime.toString());

      // Sincroniza localStorage para compatibilidade com código existente (nome/cpf)
      try {
        localStorage.setItem('nomeUsuario', sessionData.nome || '');
        localStorage.setItem('cpf', sessionData.cpf || '');
        localStorage.setItem('matricula', sessionData.matricula || '');
        localStorage.setItem('admin', sessionData.admin || 'N');
      } catch (err) {
        console.warn('Não foi possível gravar no localStorage:', err);
      }

      this.sessionData = sessionData;
      this.startSessionTimer(duration);

      this.notifyListeners('session_created', sessionData);
      return true;
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      return false;
    }
  }

  // Obtém dados da sessão
  getSessionData() {
    if (this.isSessionValid()) {
      return { ...this.sessionData };
    }
    return null;
  }

  // Verifica se a sessão é válida
  isSessionValid() {
    if (!this.sessionData) return false;

    const sessionExpiry = sessionStorage.getItem('session_expiry');
    if (!sessionExpiry) return false;

    const now = new Date().getTime();
    const expiryTime = parseInt(sessionExpiry);

    return now < expiryTime;
  }

  // Renova a sessão (estende o tempo)
  renewSession() {
    if (!this.isSessionValid()) return false;

    try {
      const now = new Date().getTime();
      const newExpiryTime = now + this.sessionDuration;

      sessionStorage.setItem('session_expiry', newExpiryTime.toString());

      // Reinicia o timer
      this.startSessionTimer(this.sessionDuration);

      this.notifyListeners('session_renewed', this.sessionData);
      return true;
    } catch (error) {
      console.error('Erro ao renovar sessão:', error);
      return false;
    }
  }

  // Limpa a sessão
  clearSession() {
    // Para o timer
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
      this.sessionTimeout = null;
    }

    // Remove dados da sessão (sessionStorage)
    sessionStorage.removeItem('session_key');
    sessionStorage.removeItem('session_data');
    sessionStorage.removeItem('session_expiry');

    // Remove também do localStorage (importante para "lembrar-me" e logout)
    // Inclui tokens e chaves de compatibilidade usadas pelo app
    try {
      const keysToRemove = [
        'session_key',
        'session_data',
        'session_expiry',
        'remember_token',
        'nomeUsuario',
        'cpf',
        'matricula',
        'admin',
        'dadosLogin',
        'authToken',
        'auth_token',
        'token'
      ];
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (err) {
      console.warn('Não foi possível limpar localStorage completamente:', err);
    }

    const oldSessionData = this.sessionData;
    this.sessionData = null;

    this.notifyListeners('session_cleared', oldSessionData);
  }

  // Timer para gerenciar expiração da sessão
  startSessionTimer(duration) {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
    }

    // Aviso antes da expiração
    const warningTimeout = duration - this.warningTime;
    if (warningTimeout > 0) {
      setTimeout(() => {
        this.notifyListeners('session_warning', {
          timeRemaining: this.warningTime,
          message: 'Sua sessão expirará em 5 minutos. Deseja renovar?'
        });
      }, warningTimeout);
    }

    // Expiração da sessão
    this.sessionTimeout = setTimeout(() => {
      this.clearSession();
      this.notifyListeners('session_expired', {
        message: 'Sua sessão expirou. Por favor, faça login novamente.'
      });
    }, duration);
  }

  // Criptografia simples (para dados não ultra-sensíveis)
  encrypt(data, key) {
    try {
      const dataString = JSON.stringify(data);
      const encrypted = btoa(encodeURIComponent(dataString + '|' + key.substring(0, 8)));
      return encrypted;
    } catch (error) {
      console.error('Erro na criptografia:', error);
      return null;
    }
  }

  // Descriptografia
  decrypt(encryptedData, key) {
    try {
      const decoded = decodeURIComponent(atob(encryptedData));
      const [ dataString, keyCheck ] = decoded.split('|');

      if (keyCheck !== key.substring(0, 8)) {
        throw new Error('Chave inválida');
      }

      return JSON.parse(dataString);
    } catch (error) {
      console.error('Erro na descriptografia:', error);
      return null;
    }
  }

  // Gera chave da sessão
  generateSessionKey() {
    return crypto.getRandomValues(new Uint8Array(16))
      .reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '');
  }

  // Gera token para "lembrar"
  generateRememberToken(userId) {
    const timestamp = new Date().getTime();
    const random = Math.random().toString(36).substring(2);
    return btoa(`${userId}|${timestamp}|${random}`);
  }

  // Sistema de eventos para notificar componentes
  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  notifyListeners(event, data) {
    this.listeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Erro no listener:', error);
      }
    });
  }

  // Método para atividade do usuário (renovação automática)
  trackActivity() {
    if (this.isSessionValid()) {
      this.renewSession();
    }
  }
}

// Hook React para usar o SessionManager
export const useSession = () => {
  const [ sessionData, setSessionData ] = useState(null);
  const [ isLoading, setIsLoading ] = useState(true);

  useEffect(() => {
    const handleSessionEvent = (event, data) => {
      switch (event) {
        case 'session_created':
        case 'session_renewed':
          setSessionData(data);
          setIsLoading(false);
          break;
        case 'session_cleared':
        case 'session_expired':
          setSessionData(null);
          setIsLoading(false);
          // Redirecionar para login se necessário
          break;
        case 'session_warning':
          // Mostrar modal de aviso
          break;
      }
    };

    sessionManager.addListener(handleSessionEvent);

    // Verifica sessão existente
    const existingSession = sessionManager.getSessionData();
    setSessionData(existingSession);
    setIsLoading(false);

    return () => {
      sessionManager.removeListener(handleSessionEvent);
    };
  }, []);

  const login = (userData, rememberMe = false) => {
    return sessionManager.createSession(userData, rememberMe);
  };

  const logout = () => {
    sessionManager.clearSession();
  };

  const renewSession = () => {
    return sessionManager.renewSession();
  };

  return {
    sessionData,
    isLoading,
    isAuthenticated: !!sessionData,
    login,
    logout,
    renewSession
  };
};

// Instância global do SessionManager
export const sessionManager = new SessionManager();