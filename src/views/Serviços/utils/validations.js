// Validation utilities for ServicosModal component

import { REQUIRED_FIELDS, CONDITIONAL_REQUIRED_FIELDS } from './constants';

/**
 * Get field value from DOM element
 * @param {string} fieldId - The ID of the field
 * @returns {string} Field value
 */
export const getFieldValue = (fieldId) => {
  const element = document.getElementById(fieldId);
  return element ? element.value.trim() : '';
};

/**
 * Validate required fields
 * @param {boolean} ocorrenciaSemEndereco - Whether occurrence is without address
 * @param {string} centroCustoSelecionado - Selected cost center
 * @returns {Object} Validation errors
 */
export const validateRequiredFields = (ocorrenciaSemEndereco, centroCustoSelecionado) => {
  const erros = {};

  // Validate OS number or consumer unit (at least one required)
  const numeroOs = getFieldValue('numeroOS');
  const unConsumidora = getFieldValue('unConsumidora');
  
  if (!numeroOs && !unConsumidora) {
    erros.numeroOS = 'Preencha pelo menos um dos campos: Número OS ou UN. Consumidora';
    erros.unConsumidora = 'Preencha pelo menos um dos campos: Número OS ou UN. Consumidora';
  }

  // Validate always required fields
  REQUIRED_FIELDS.forEach(field => {
    const value = getFieldValue(field);
    if (!value) {
      erros[field] = 'Este campo é obrigatório';
    }
  });

  // Validate cost center
  if (!centroCustoSelecionado) {
    erros.centroDeCustos = 'Este campo é obrigatório';
  }

  // Validate conditional fields (only required if not occurrence without address)
  if (!ocorrenciaSemEndereco) {
    CONDITIONAL_REQUIRED_FIELDS.forEach(field => {
      const value = getFieldValue(field);
      if (!value) {
        erros[field] = 'Este campo é obrigatório';
      }
    });
  }

  return erros;
};

/**
 * Validate users data
 * @param {Array} usuarios - Array of users
 * @returns {Object} Validation errors
 */
export const validateUsers = (usuarios) => {
  const erros = {};

  // Check if at least one user is added
  if (usuarios.length === 0) {
    erros.usuarios = 'Pelo menos um usuário deve ser adicionado';
  }

  // Check if at least one user is marked as leader
  const temLider = usuarios.some(u => u.lider);
  if (usuarios.length > 0 && !temLider) {
    erros.lider = 'Pelo menos um usuário deve ser marcado como líder';
  }

  return erros;
};

/**
 * Validate services data
 * @param {Array} servicos - Array of services
 * @returns {Object} Validation errors
 */
export const validateServices = (servicos) => {
  const erros = {};

  // Check if at least one service is added
  if (servicos.length === 0) {
    erros.servicos = 'Pelo menos um serviço deve ser adicionado';
  }

  return erros;
};

/**
 * Main validation function
 * @param {Object} formData - Form data including state variables
 * @returns {Object} All validation errors
 */
export const validateForm = ({ usuarios, servicos, ocorrenciaSemEndereco, centroCustoSelecionado }) => {
  const fieldErrors = validateRequiredFields(ocorrenciaSemEndereco, centroCustoSelecionado);
  const userErrors = validateUsers(usuarios);
  const serviceErrors = validateServices(servicos);

  return {
    ...fieldErrors,
    ...userErrors,
    ...serviceErrors
  };
};

/**
 * Check if validation has errors
 * @param {Object} errors - Validation errors object
 * @returns {boolean} True if has errors
 */
export const hasValidationErrors = (errors) => {
  return Object.keys(errors).length > 0;
};