import httpRequest from '../utils/httpRequests'

export const consultarPermissoesUsuario = async (cpf) => {
  try {
    const response = await httpRequest(`/consultaPermissoesUsuario?cpf=${cpf}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`
      },
    })

    if (response.ok) {
      const data = await response.json()
      return data
    } else {
      throw new Error(`Erro ${response.status}: ${response.statusText}`)
    }
  } catch (error) {
    console.error('Erro ao consultar permissões do usuário:', error)
    throw error
  }
}

// Função para verificar se o usuário tem permissão para uma rota específica
export const verificarPermissaoRota = (permissoes, rota) => {
  if (!permissoes || !Array.isArray(permissoes)) {
    return false
  }

  // Rotas públicas que não precisam de verificação
  const rotasPublicas = ['/home', '/atestados', '/consulta-atestados']
  
  if (rotasPublicas.includes(rota)) {
    return true
  }

  // Verificar se existe a permissão para a rota específica
  return permissoes.some(permissao => {
    const idPathLimpo = permissao.idPath ? permissao.idPath.trim() : ''
    return idPathLimpo === rota
  })
}

// Função para obter todas as rotas permitidas para o usuário
export const obterRotasPermitidas = (permissoes) => {
  if (!permissoes || !Array.isArray(permissoes)) {
    return []
  }

  // Rotas públicas sempre permitidas
  const rotasPublicas = ['/home', '/atestados', '/consulta-atestados']
  
  // Rotas específicas com permissão
  const rotasComPermissao = permissoes.map(permissao => {
    return permissao.idPath ? permissao.idPath.trim() : ''
  }).filter(rota => rota !== '')

  return [...rotasPublicas, ...rotasComPermissao]
}
