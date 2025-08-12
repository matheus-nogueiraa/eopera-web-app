// Custom hook for modal state management

import { useState } from 'react';
import { AUTO_HIDE_SUCCESS_ALERT, AUTO_HIDE_ERROR_ALERT } from '../utils/constants';

/**
 * Custom hook to manage modal state and alerts
 * @param {Function} showAlertParent - Parent component alert function
 * @returns {Object} Modal state and functions
 */
export const useModalState = (showAlertParent) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [camposComErro, setCamposComErro] = useState({});

  // Alert states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertColor, setAlertColor] = useState('success');

  // Confirmation modal states
  const [modalConfirmacaoVisible, setModalConfirmacaoVisible] = useState(false);
  const [novoCentroCustoTemp, setNovoCentroCustoTemp] = useState('');
  const [selectElementTemp, setSelectElementTemp] = useState(null);

  /**
   * Clear error for specific field
   * @param {string} campo - Field name
   */
  const limparErroCampo = (campo) => {
    setCamposComErro(prev => {
      const novoErros = { ...prev };
      delete novoErros[campo];
      return novoErros;
    });
  };

  /**
   * Show alert with auto-hide
   * @param {string} message - Alert message
   * @param {string} color - Alert color (success, danger, warning, info)
   */
  const mostrarAlert = (message, color = 'success') => {
    setAlertMessage(message);
    setAlertColor(color);
    setAlertVisible(true);

    // Auto-hide after time based on type
    const timeoutDuration = color === 'danger' ? AUTO_HIDE_ERROR_ALERT : AUTO_HIDE_SUCCESS_ALERT;
    setTimeout(() => {
      setAlertVisible(false);
    }, timeoutDuration);

    // Also show in parent component if function is provided
    if (showAlertParent) {
      showAlertParent(message, color);
    }
  };

  /**
   * Reset all modal states
   */
  const resetModalState = () => {
    setIsSubmitting(false);
    setCamposComErro({});
    setAlertVisible(false);
    setAlertMessage('');
    setAlertColor('success');
    setModalConfirmacaoVisible(false);
    setNovoCentroCustoTemp('');
    setSelectElementTemp(null);
  };

  return {
    // States
    isSubmitting,
    camposComErro,
    alertVisible,
    alertMessage,
    alertColor,
    modalConfirmacaoVisible,
    novoCentroCustoTemp,
    selectElementTemp,

    // Setters
    setIsSubmitting,
    setCamposComErro,
    setAlertVisible,
    setModalConfirmacaoVisible,
    setNovoCentroCustoTemp,
    setSelectElementTemp,

    // Functions
    limparErroCampo,
    mostrarAlert,
    resetModalState
  };
};