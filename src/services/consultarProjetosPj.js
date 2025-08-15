import httpRequest from '../utils/httpRequests'

export const consultarListaProjetos = {
  consultarListaProjetos: async () => {
    try {
      console.log('=== DEBUG CONSULTA PROJETOS PJ ===')
      console.log('Iniciando consulta à API...')

      const resposta = await httpRequest('/consultarListaProjetos', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
        },
      })

      console.log('Status da resposta:', resposta.status)
      console.log('Resposta OK?', resposta.ok)

      if (!resposta.ok) {
        throw new Error(`Erro HTTP: ${resposta.status} - ${resposta.statusText}`)
      }

      const dados = await resposta.json()
      console.log('Dados recebidos da API (tipo):', typeof dados)
      console.log('Dados recebidos da API (é array?):', Array.isArray(dados))
      console.log('Dados recebidos da API (conteúdo):', dados)

      // Verificar se os dados são um array ou se estão dentro de uma propriedade
      let arrayProjetos = []

      if (Array.isArray(dados)) {
        console.log('Dados são array direto')
        arrayProjetos = dados
      } else if (dados && typeof dados === 'object') {
        // Verificar se os dados estão em alguma propriedade específica
        console.log('Dados são objeto, procurando array dentro...')
        console.log('Propriedades do objeto:', Object.keys(dados))

        // Procurar por propriedades que possam conter o array
        const possiveisChaves = ['data', 'results', 'items', 'projetos', 'grupos']

        for (const chave of possiveisChaves) {
          if (dados[chave] && Array.isArray(dados[chave])) {
            console.log(`Array encontrado na propriedade: ${chave}`)
            arrayProjetos = dados[chave]
            break
          }
        }

        // Se não encontrou em propriedades conhecidas, verificar se é um objeto com propriedades numéricas
        if (arrayProjetos.length === 0) {
          const chaves = Object.keys(dados)
          if (chaves.length > 0 && chaves.every((chave) => !isNaN(chave))) {
            console.log('Convertendo objeto com chaves numéricas para array')
            arrayProjetos = Object.values(dados)
          }
        }
      }

      console.log('Array de projetos extraído:', arrayProjetos)
      console.log('Tamanho do array:', arrayProjetos.length)

      if (!Array.isArray(arrayProjetos) || arrayProjetos.length === 0) {
        console.warn('Nenhum projeto encontrado ou formato inválido')
        return []
      }

      // Verificar estrutura do primeiro item
      const primeiroItem = arrayProjetos[0]
      console.log('Primeiro item do array:', primeiroItem)
      console.log('Propriedades do primeiro item:', Object.keys(primeiroItem))

      // Processa os dados para garantir que a descrição seja limpa
      const projetosLimpos = arrayProjetos
        .map((projeto, index) => {
          if (!projeto || typeof projeto !== 'object') {
            console.warn(`Item ${index} não é um objeto válido:`, projeto)
            return null
          }

          // Tentar diferentes nomes de propriedades
          const codGrupo = projeto.codGrupo || projeto.codigo || projeto.id || projeto.cod || index
          const descricao =
            projeto.descricao || projeto.nome || projeto.title || projeto.name || 'Sem descrição'

          console.log(`Projeto ${index}:`, { codGrupo, descricao: descricao.trim() })

          return {
            codGrupo: codGrupo,
            descricao: descricao.toString().trim(),
          }
        })
        .filter((projeto) => projeto !== null) // Remover itens nulos

      console.log('Projetos processados:', projetosLimpos)
      console.log('Total de projetos válidos:', projetosLimpos.length)
      console.log('=== FIM DEBUG CONSULTA PROJETOS PJ ===')

      return projetosLimpos
    } catch (erro) {
      console.error('=== ERRO NA CONSULTA PROJETOS PJ ===')
      console.error('Erro completo:', erro)
      console.error('Stack trace:', erro.stack)
      console.error('=== FIM ERRO ===')
      throw erro
    }
  },

  // Método adicional caso precise filtrar por parâmetros específicos
  consultarProjetosPorFiltro: async (filtros = {}) => {
    try {
      const params = new URLSearchParams(filtros).toString()
      const url = `/consultarListaProjetos${params ? `?${params}` : ''}`

      const resposta = await httpRequest(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
        },
      })

      if (!resposta.ok) {
        throw new Error(`Erro HTTP: ${resposta.status} - ${resposta.statusText}`)
      }

      const dados = await resposta.json()

      // Usar a mesma lógica de processamento da função principal
      const projetosCompletos = await this.consultarListaProjetos()

      // Aplicar filtros se necessário
      return projetosCompletos
    } catch (erro) {
      console.error('Erro ao consultar projetos com filtro:', erro)
      throw erro
    }
  },

  // Método para buscar um projeto específico por código
  consultarProjetoPorCodigo: async (codGrupo) => {
    try {
      const projetos = await consultarListaProjetos.consultarListaProjetos()
      return projetos.find((projeto) => projeto.codGrupo === codGrupo) || null
    } catch (erro) {
      console.error('Erro ao consultar projeto por código:', erro)
      throw erro
    }
  },
}
