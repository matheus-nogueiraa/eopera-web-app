/**
 * Utilidade para debounce de função
 * Evita múltiplas chamadas consecutivas, executando apenas a última chamada após o tempo especificado
 * 
 * @param {Function} func - A função a ser executada após o debounce
 * @param {number} wait - Tempo de espera em milissegundos
 * @param {boolean} immediate - Se true, executa a função imediatamente na primeira chamada
 * @returns {Function} - Função com debounce aplicado
 */
export function debounce(func, wait = 300, immediate = false) {
  let timeout;
  
  const debouncedFunction = function() {
    const context = this;
    const args = arguments;
    
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    
    const callNow = immediate && !timeout;
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func.apply(context, args);
  };
  
  // Adiciona método para cancelar o debounce se necessário
  debouncedFunction.cancel = function() {
    clearTimeout(timeout);
    timeout = null;
  };
  
  return debouncedFunction;
}

export default debounce;
