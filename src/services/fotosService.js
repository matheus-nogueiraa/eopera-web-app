// Serviço centralizado para gerenciar fotos de serviços

import httpRequest from "../utils/httpRequests";

const fotosService = {
  /**
   * Consulta fotos de um serviço específico de uma ocorrência
   * @param {string} idOcorrencia - ID da ocorrência
   * @param {string} itemServico - Item do serviço (ex: "005")
   * @returns {Promise<Array>} Lista de fotos
   */
  consultarFotosServicoOcorrencia: async (idOcorrencia, itemServico) => {
    try {      
      const response = await httpRequest(
        `/getFotosServicoOcorrencia?idOcorrencia=${idOcorrencia}&itemServico=${itemServico}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na resposta da API:', response.status, errorText);
        throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();      
      // Verificar a estrutura da resposta
      if (data.status && data.data) {
        return data.data || [];
      } else {
        console.warn('Estrutura de resposta inesperada:', data);
        return data.dados || data || [];
      }
    } catch (error) {
      console.error('Erro ao consultar fotos do serviço:', error);
      throw new Error(`Falha ao carregar fotos: ${error.message}`);
    }
  },

  /**
   * Converte arquivo para base64
   * @param {File} file - Arquivo da imagem
   * @returns {Promise<string>} String base64 da imagem
   */
  converterParaBase64: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Remover o prefixo data:image/...;base64,
        const base64 = reader.result.split(',')[ 1 ];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  /**
   * Valida se o arquivo é uma imagem válida
   * @param {File} file - Arquivo a ser validado
   * @returns {boolean} True se for uma imagem válida
   */
  validarImagem: (file) => {
    const tiposPermitidos = [ 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp' ];
    const tamanhoMaximo = 10 * 1024 * 1024; // 10MB

    if (!tiposPermitidos.includes(file.type)) {
      throw new Error('Tipo de arquivo não permitido. Use apenas JPEG, PNG, GIF ou WebP.');
    }

    if (file.size > tamanhoMaximo) {
      throw new Error('Arquivo muito grande. O tamanho máximo é 10MB.');
    }

    return true;
  },

  /**
   * Processa múltiplos arquivos de imagem
   * @param {FileList} files - Lista de arquivos
   * @returns {Promise<Array>} Array com objetos contendo base64 e metadados
   */
  processarMultiplasImagens: async (files) => {
    const arquivosArray = Array.from(files);
    const promessasConversao = [];

    for (const file of arquivosArray) {
      try {
        fotosService.validarImagem(file);
        promessasConversao.push(
          fotosService.converterParaBase64(file).then(base64 => ({
            base64,
            nome: file.name,
            tamanho: file.size,
            tipo: file.type,
            id: Math.random().toString(36).substr(2, 9) // ID temporário
          }))
        );
      } catch (error) {
        throw new Error(`Erro no arquivo ${file.name}: ${error.message}`);
      }
    }

    return Promise.all(promessasConversao);
  }
};

export default fotosService;
