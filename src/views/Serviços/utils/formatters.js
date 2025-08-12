// Formatting utilities for ServicosModal component

/**
 * Remove hyphens from date string
 * @param {string} date - Date string in YYYY-MM-DD format
 * @returns {string} Date string without hyphens
 */
export const formatDateForSubmission = (date) => {
  return date ? date.replace(/-/g, '') : '';
};

/**
 * Remove hyphens from CEP
 * @param {string} cep - CEP string with hyphens
 * @returns {string} CEP without hyphens
 */
export const formatCepForSubmission = (cep) => {
  return cep ? cep.replace(/-/g, '') : '';
};

/**
 * Extract code from formatted string (e.g., "12345 - Description" -> "12345")
 * @param {string} formattedString - String with code and description
 * @returns {string} Extracted code
 */
export const extractCodeFromFormatted = (formattedString) => {
  return formattedString ? formattedString.split('-')[0].trim() : '';
};

/**
 * Format municipality text
 * @param {Object} municipio - Municipality object
 * @returns {string} Formatted municipality string
 */
export const formatMunicipality = (municipio) => {
  if (!municipio) return '';
  return `${municipio.codigo.trim()} - ${municipio.descricao.trim()} (${municipio.estado.trim()})`;
};

/**
 * Format cost center option text
 * @param {Object} centroCusto - Cost center object
 * @returns {string} Formatted cost center string
 */
export const formatCostCenter = (centroCusto) => {
  if (!centroCusto) return '';
  return `${centroCusto.centroCusto?.trim()} - ${centroCusto.descricaoCCusto?.trim()}`;
};

/**
 * Format user for display in dropdown
 * @param {Object} usuario - User object
 * @returns {Object} Formatted user info
 */
export const formatUserInfo = (usuario) => {
  return {
    nome: usuario.nome?.trim() || '',
    matricula: usuario.matricula?.trim() || '',
    cpf: usuario.cpf?.trim() || '',
    displayText: usuario.nome?.trim() || '',
    detailText: `Mat: ${usuario.matricula} | CPF: ${usuario.cpf} | Tipo: ${usuario.tipoUsuario}`
  };
};

/**
 * Convert files to base64
 * @param {FileList} files - Files to convert
 * @returns {Promise<Array>} Array of base64 images
 */
export const convertFilesToBase64 = (files) => {
  const fileArray = Array.from(files);
  
  const conversionPromises = fileArray.map(file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Remove the prefix data:image/...;base64,
        const base64 = reader.result.split(',')[1];
        resolve({ base64 });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  });

  return Promise.all(conversionPromises);
};

/**
 * Format data for API submission
 * @param {Object} formData - All form data
 * @returns {Object} Formatted data for API
 */
export const formatFormDataForSubmission = (formData) => {
  const {
    numeroOs,
    unidadeConsumidora,
    status,
    data,
    hora,
    endereco,
    bairro,
    municipio,
    cep,
    latitude,
    longitude,
    dataConclusao,
    horaConclusao,
    centroCusto,
    numeroOperacional,
    usuarios,
    servicos,
    ocorrenciaSemEndereco,
    cpfInclusao,
    matInclusao
  } = formData;

  // Format users for API
  const usuariosReq = usuarios.map(u => ({
    cpf: u.cpf || '00000000000',
    matricula: u.matricula || '000000',
    lider: u.lider ? 'S' : 'N'
  }));

  // Format services for API
  const servicosReq = servicos.map(s => ({
    idServico: s.servicoSelecionado?.idServico || s.servico,
    observacao: s.observacao || '',
    quantidade: Number(s.quantidade) || 0,
    valPontos: Number(s.valorServico) || 0,
    valGrupo: Number(s.valorGrupo) || 0,
    fotos: s.fotos || []
  }));

  return {
    numeroOs: numeroOs?.trim() || '',
    unidadeConsumidora: unidadeConsumidora?.trim() || '',
    status,
    data: formatDateForSubmission(data),
    hora,
    semEndereco: ocorrenciaSemEndereco ? 'S' : 'N',
    endereco: ocorrenciaSemEndereco ? '' : endereco?.trim() || '',
    bairro: ocorrenciaSemEndereco ? '' : bairro?.trim() || '',
    codMunicipio: extractCodeFromFormatted(municipio),
    cep: ocorrenciaSemEndereco ? '' : formatCepForSubmission(cep),
    latitude: ocorrenciaSemEndereco ? '' : latitude?.trim() || '',
    longitude: ocorrenciaSemEndereco ? '' : longitude?.trim() || '',
    dataConclusao: formatDateForSubmission(dataConclusao),
    horaConclusao,
    centroCusto,
    numOperacional: extractCodeFromFormatted(numeroOperacional),
    cpfInclusao: cpfInclusao || localStorage.getItem('cpf') || '00000000000',
    matInclusao: matInclusao || localStorage.getItem('matricula') || '000000',
    usuarios: usuariosReq,
    servicos: servicosReq
  };
};