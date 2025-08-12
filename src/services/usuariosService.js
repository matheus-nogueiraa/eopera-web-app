import httpRequest from '../utils/httpRequests';

/**
 * Service para consultar usuários do sistema Eopera-X
 */

/**
 * Consulta todos os usuários do sistema
 * @returns {Promise<Array>} Lista de usuários
 */
export async function consultarUsuariosEoperaX() {
  try {
    const response = await httpRequest('/consultarUsuariosEoperaX', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`
      }
    });

    const result = await response.json();

    if (response.ok && result.status && Array.isArray(result.data)) {
      return result.data;
    } else {
      console.warn('Resposta inesperada da API de usuários:', result);
      return [];
    }
  } catch (error) {
    console.error('Erro ao consultar usuários:', error);
    throw error;
  }
}

/**
 * Filtra usuários por termo de busca (nome, matrícula ou CPF)
 * @param {Array} usuarios - Lista de usuários
 * @param {string} termo - Termo de busca
 * @returns {Array} Usuários filtrados
 */
export function filtrarUsuarios(usuarios, termo) {
  if (!termo || termo.length < 2) return [];
  
  const termoLower = termo.toLowerCase().trim();
  
  return usuarios.filter(usuario => {
    const nome = usuario.nome?.toLowerCase() || '';
    const matricula = usuario.matricula?.toLowerCase() || '';
    const cpf = usuario.cpf?.toLowerCase() || '';
    
    return nome.includes(termoLower) || 
           matricula.includes(termoLower) || 
           cpf.includes(termoLower);
  }).slice(0, 20); // Limitar a 20 resultados
}
