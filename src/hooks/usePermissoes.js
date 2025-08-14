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
    return rotasPermitidas.includes(rota)
  }

  const temPermissaoPost = (rota) => {
    const permissao = permissoes.find(p => p.idPath && p.idPath.trim() === rota)
    return permissao ? permissao.post === 'T' : false
  }

  const temPermissaoPut = (rota) => {
    const permissao = permissoes.find(p => p.idPath && p.idPath.trim() === rota)
    return permissao ? permissao.put === 'T' : false
  }

  const temPermissaoDelete = (rota) => {
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
