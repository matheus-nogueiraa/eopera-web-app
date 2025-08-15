import httpRequest from '../utils/httpRequests'
import { getGruposCentralizados } from './campoGruposCentralizados'

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
        Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
      },
    })

    const result = await response.json()

    if (response.ok && result.status && Array.isArray(result.data)) {
      return result.data
    } else {
      console.warn('Resposta inesperada da API de usuários:', result)
      return []
    }
  } catch (error) {
    console.error('Erro ao consultar usuários:', error)
    throw error
  }
}

/**
 * Consulta usuários e enriquece com dados dos grupos centralizados
 * @returns {Promise<Array>} Lista de usuários com dados de grupo
 */
export async function consultarUsuariosComGrupos() {
  try {
    console.log('Iniciando consulta de usuários com grupos...')

    // Buscar usuários e grupos em paralelo
    const [usuarios, grupos] = await Promise.all([
      consultarUsuariosEoperaX(),
      getGruposCentralizados(),
    ])

    console.log('Usuários encontrados:', usuarios.length)
    console.log('Grupos encontrados:', grupos.length)

    if (!Array.isArray(usuarios) || !Array.isArray(grupos)) {
      console.warn('Dados inválidos recebidos das APIs')
      return usuarios || []
    }

    // Criar um mapa de grupos para busca rápida por código
    const gruposMap = new Map()
    grupos.forEach((grupo) => {
      if (grupo.codGrupo) {
        gruposMap.set(grupo.codGrupo.toString(), grupo.descricao?.trim() || '')
      }
    })

    console.log('Mapa de grupos criado com', gruposMap.size, 'entradas')

    // Enriquecer usuários com dados do grupo
    const usuariosComGrupos = usuarios.map((usuario) => {
      let grupoDescricao = ''

      // Tentar encontrar o grupo usando diferentes campos do usuário
      if (usuario.matricula) {
        // Primeiro tentar com matrícula direta
        grupoDescricao = gruposMap.get(usuario.matricula.toString()) || ''

        // Se não encontrou, tentar com grupoCentralizador se existir
        if (!grupoDescricao && usuario.grupoCentralizador) {
          const codGrupo = usuario.grupoCentralizador.split(' - ')[0]
          grupoDescricao = gruposMap.get(codGrupo) || ''
        }
      }

      // Se ainda não encontrou e tem grupoCentralizador, extrair código
      if (!grupoDescricao && usuario.grupoCentralizador) {
        const codGrupo = usuario.grupoCentralizador.split(' - ')[0]
        grupoDescricao = gruposMap.get(codGrupo) || ''
      }

      return {
        ...usuario,
        grupo: grupoDescricao || usuario.grupo || 'Não definido',
      }
    })

    console.log('Usuários processados com grupos:', usuariosComGrupos.length)

    // Log de alguns exemplos para debug
    const exemplos = usuariosComGrupos.slice(0, 3)
    console.log('Exemplos de usuários com grupos:', exemplos)

    return usuariosComGrupos
  } catch (error) {
    console.error('Erro ao consultar usuários com grupos:', error)
    // Em caso de erro, retornar usuários sem enriquecimento
    try {
      return await consultarUsuariosEoperaX()
    } catch (fallbackError) {
      console.error('Erro no fallback:', fallbackError)
      return []
    }
  }
}

/**
 * Filtra usuários por termo de busca (nome, matrícula ou CPF)
 * @param {Array} usuarios - Lista de usuários
 * @param {string} termo - Termo de busca
 * @returns {Array} Usuários filtrados
 */
export function filtrarUsuarios(usuarios, termo) {
  if (!termo || termo.length < 2) return []

  const termoLower = termo.toLowerCase().trim()

  return usuarios
    .filter((usuario) => {
      const nome = usuario.nome?.toLowerCase() || ''
      const matricula = usuario.matricula?.toLowerCase() || ''
      const cpf = usuario.cpf?.toLowerCase() || ''
      const grupo = usuario.grupo?.toLowerCase() || ''

      return (
        nome.includes(termoLower) ||
        matricula.includes(termoLower) ||
        cpf.includes(termoLower) ||
        grupo.includes(termoLower)
      )
    })
    .slice(0, 20) // Limitar a 20 resultados
}
