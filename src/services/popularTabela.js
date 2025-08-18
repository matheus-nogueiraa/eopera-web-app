import httpRequest from '../utils/httpRequests'

/**
 * Consulta todos os usuários do EoperaX
 * @returns {Promise<Object[]>} Array com os dados dos usuários
 * @throws {Error} Erro de rede ou validação
 */
export async function consultarUsuariosEoperaX() {
  try {
    const response = await httpRequest(`/consultarUsuariosEoperaX`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
      },
    })

    const result = await response.json()

    if (response.ok && result.status && Array.isArray(result.data)) {
      return result.data
    } else {
      console.warn('Nenhum funcionário encontrado')
      return []
    }
  } catch (error) {
    console.error('Erro ao consultar funcionários do EoperaX:', error)
    throw new Error(`Falha na consulta dos funcionários: ${error.message}`)
  }
}
