import { useState, useEffect } from 'react'
import { consultarPermissoesUsuario, obterRotasPermitidas } from '../services/permissoesService'

export const usePermissoes = () => {
  const [permissoes, setPermissoes] = useState([])
  const [rotasPermitidas, setRotasPermitidas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const carregarPermissoes = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Verificar se o usuário é admin primeiro
      const isAdmin = localStorage.getItem('admin') === 'T'
      
      if (isAdmin) {
        // Se é admin, liberar todas as rotas e permissões
        const todasAsRotas = [
          '/home', 
          '/atestados', 
          '/consulta-atestados',
          '/servicos',
          '/usuarios',
          '/treinamentos',
          '/criar-cursos',
          '/criar-questionarios',
          '/turmas',
          '/certificados'
        ]
        
        // Criar permissões mockadas para admin (todas liberadas)
        const permissoesAdmin = todasAsRotas.map(rota => ({
          cpf: localStorage.getItem('cpf') || '',
          idPath: rota,
          post: 'T',
          put: 'T',
          del: 'T'
        }))
        
        setPermissoes(permissoesAdmin)
        setRotasPermitidas(todasAsRotas)
        return
      }
      
      const cpf = localStorage.getItem('cpf')
      
      if (!cpf) {
        // Se não há CPF, só permite rotas públicas
        const rotasPublicas = ['/home', '/atestados', '/consulta-atestados']
        setRotasPermitidas(rotasPublicas)
        setPermissoes([])
        return
      }

      const response = await consultarPermissoesUsuario(cpf)
      
      if (response.status && response.data) {
        setPermissoes(response.data)
        const rotas = obterRotasPermitidas(response.data)
        setRotasPermitidas(rotas)
      } else {
        // Se a resposta não tem dados válidos, só permite rotas públicas
        const rotasPublicas = ['/home', '/atestados', '/consulta-atestados']
        setRotasPermitidas(rotasPublicas)
        setPermissoes([])
      }
    } catch (err) {
      console.error('Erro ao carregar permissões:', err)
      setError(err.message)
      // Em caso de erro, só permite rotas públicas
      const rotasPublicas = ['/home', '/atestados', '/consulta-atestados']
      setRotasPermitidas(rotasPublicas)
      setPermissoes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarPermissoes()
  }, [])

  const verificarPermissaoRota = (rota) => {
    // Se é admin, libera todas as rotas
    const isAdmin = localStorage.getItem('admin') === 'T'
    if (isAdmin) return true
    
    return rotasPermitidas.includes(rota)
  }

  const temPermissaoPost = (rota) => {
    // Se é admin, libera todas as operações
    const isAdmin = localStorage.getItem('admin') === 'T'
    if (isAdmin) return true
    
    const permissao = permissoes.find(p => p.idPath && p.idPath.trim() === rota)
    return permissao ? permissao.post === 'T' : false
  }

  const temPermissaoPut = (rota) => {
    // Se é admin, libera todas as operações
    const isAdmin = localStorage.getItem('admin') === 'T'
    if (isAdmin) return true
    
    const permissao = permissoes.find(p => p.idPath && p.idPath.trim() === rota)
    return permissao ? permissao.put === 'T' : false
  }

  const temPermissaoDelete = (rota) => {
    // Se é admin, libera todas as operações
    const isAdmin = localStorage.getItem('admin') === 'T'
    if (isAdmin) return true
    
    const permissao = permissoes.find(p => p.idPath && p.idPath.trim() === rota)
    return permissao ? permissao.del === 'T' : false
  }

  return {
    permissoes,
    rotasPermitidas,
    loading,
    error,
    verificarPermissaoRota,
    temPermissaoPost,
    temPermissaoPut,
    temPermissaoDelete,
    recarregarPermissoes: carregarPermissoes
  }
}
