import httpRequest from '../utils/httpRequests'

/**
 * Consulta um funcionário CLT pelo CPF
 * @param {string} cpf - O CPF do funcionário (deve ser válido)
 * @returns {Promise<Object[]>} Os dados do funcionário ou array vazio se não encontrado
 * @throws {Error} Erro de rede ou validação
 */
export async function editarFuncionario(cpf) {
  // Validação básica do CPF
  if (!cpf || typeof cpf !== 'string') {
    throw new Error('CPF é obrigatório e deve ser uma string')
  }

  // Remove formatação do CPF (pontos e traços)
  const cpfLimpo = cpf.replace(/[.-]/g, '')

  if (cpfLimpo.length !== 11) {
    throw new Error('CPF deve conter 11 dígitos')
  }

  try {
    const response = await httpRequest(`/getDadosUsuario?cpf=${cpfLimpo}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
      },
    })

    const result = await response.json()

    if (response.ok && result.status && Array.isArray(result.data)) {
      return result.data
    } else {
      console.warn('Nenhum funcionário encontrado para o CPF:', cpfLimpo)
      return []
    }
  } catch (error) {
    console.error('Erro ao consultar funcionário pelo CPF:', error)
    throw new Error(`Falha na consulta do funcionário: ${error.message}`)
  }
}
