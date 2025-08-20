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
        Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
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

/**
 * Verifica se um CPF já está cadastrado no sistema
 * @param {string} cpf - O CPF a ser verificado (pode conter formatação)
 * @returns {Promise<boolean>} true se o CPF já existe, false caso contrário
 */
export async function verificarCpfExistente(cpf) {
  try {
    // Limpar formatação do CPF
    const cpfLimpo = cpf.replace(/[^\d]/g, '')

    // Buscar todos os usuários
    const usuarios = await consultarUsuariosEoperaX()

    // Verificar se algum usuário já possui este CPF
    const cpfExiste = usuarios.some((usuario) => {
      const cpfUsuario = usuario.cpf ? usuario.cpf.replace(/[^\d]/g, '') : ''
      return cpfUsuario === cpfLimpo
    })

    return cpfExiste
  } catch (error) {
    console.error('Erro ao verificar CPF existente:', error)
    // Em caso de erro na verificação, assumir que não existe para não bloquear o cadastro
    return false
  }
}
