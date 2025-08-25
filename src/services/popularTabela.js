import httpRequest from '../utils/httpRequests'

// Cache para evitar múltiplas requisições desnecessárias
let usuariosCache = null
let cacheTimestamp = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos em milissegundos

/**
 * Consulta todos os usuários do EoperaX com cache
 * @param {boolean} forceRefresh - Força atualização do cache
 * @returns {Promise<Object[]>} Array com os dados dos usuários
 * @throws {Error} Erro de rede ou validação
 */
export async function consultarUsuariosEoperaX(forceRefresh = false) {
  try {
    // Verificar se o cache é válido
    const now = Date.now()
    const cacheValid = usuariosCache && 
                      cacheTimestamp && 
                      (now - cacheTimestamp) < CACHE_DURATION &&
                      !forceRefresh

    if (cacheValid) {
      console.log('Usando dados do cache para usuários')
      return usuariosCache
    }

    console.log('Buscando usuários da API...')
    const response = await httpRequest(`/consultarUsuariosEoperaX`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
      },
    })

    const result = await response.json()

    if (response.ok && result.status && Array.isArray(result.data)) {
      // Atualizar cache
      usuariosCache = result.data
      cacheTimestamp = now
      console.log(`Cache atualizado com ${result.data.length} usuários`)
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
 * Limpa o cache de usuários
 */
export function limparCacheUsuarios() {
  usuariosCache = null
  cacheTimestamp = null
  console.log('Cache de usuários limpo')
}

/**
 * Filtra usuários com base em um termo de pesquisa
 * @param {Array} usuarios - Array de usuários para filtrar
 * @param {string} termo - Termo de pesquisa
 * @returns {Array} Array de usuários filtrados
 */
export function filtrarUsuarios(usuarios, termo) {
  if (!termo || !Array.isArray(usuarios)) {
    return usuarios
  }

  const termoLower = termo.toLowerCase().trim()
  const termoNumerico = termo.replace(/[^\d]/g, '') // Remove tudo que não é número

  return usuarios.filter((usuario) => {
    // 1. Busca por nome (prioridade alta)
    const nomeMatch = usuario.nome && usuario.nome.toLowerCase().includes(termoLower)

    // 2. Busca por CPF (removendo formatação)
    const cpfLimpo = usuario.cpf ? usuario.cpf.replace(/[^\d]/g, '') : ''
    const cpfMatch = termoNumerico && cpfLimpo.includes(termoNumerico)

    // 3. Busca por matrícula
    const matriculaMatch =
      usuario.matricula && usuario.matricula.toString().toLowerCase().includes(termoLower)

    // 4. Busca por grupo centralizador
    const grupoMatch =
      usuario.grupoCentralizador &&
      usuario.grupoCentralizador.toLowerCase().includes(termoLower)

    // 5. Busca por tipo de usuário - melhorada para PJ/CLT
    const tipoMatch =
      usuario.tipoUsuario &&
      // Busca por "PJ" quando tipoUsuario é "P"
      ((termoLower.includes('pj') && usuario.tipoUsuario === 'P') ||
        // Busca por "CLT" quando tipoUsuario é "C"
        (termoLower.includes('clt') && usuario.tipoUsuario === 'C') ||
        // Busca pela letra original também
        usuario.tipoUsuario.toLowerCase().includes(termoLower))

    // 6. Busca por celular
    const celularLimpo = usuario.celular ? usuario.celular.replace(/[^\d]/g, '') : ''
    const celularMatch = termoNumerico && celularLimpo.includes(termoNumerico)

    // 7. Busca por projeto PJ (se aplicável)
    const projetoMatch =
      usuario.projetoPj && usuario.projetoPj.toLowerCase().includes(termoLower)

    return (
      nomeMatch ||
      cpfMatch ||
      matriculaMatch ||
      grupoMatch ||
      tipoMatch ||
      celularMatch ||
      projetoMatch
    )
  })
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

    // Buscar todos os usuários (usando cache)
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
