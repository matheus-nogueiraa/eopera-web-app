// Custom hook for autocomplete functionality

import { useState, useRef, useCallback } from 'react';
import { DEBOUNCE_DELAY, MIN_SEARCH_LENGTH, MAX_DROPDOWN_ITEMS } from '../utils/constants';

/**
 * Custom hook for autocomplete functionality
 * @param {Function} searchFunction - Function to search items
 * @param {Function} loadAllFunction - Function to load all items (optional)
 * @param {Function} formatFunction - Function to format selected item (optional)
 * @returns {Object} Autocomplete state and functions
 */
export const useAutocomplete = (searchFunction, loadAllFunction = null, formatFunction = null) => {
  // States
  const [opcoes, setOpcoes] = useState([]);
  const [todosItens, setTodosItens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dropdownVisivel, setDropdownVisivel] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [valorSelecionado, setValorSelecionado] = useState('');
  const [itemInfo, setItemInfo] = useState({});

  // Refs
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  /**
   * Load all items once
   */
  const carregarTodosItens = useCallback(async () => {
    if (todosItens.length > 0 || !loadAllFunction) return;
    
    setLoading(true);
    try {
      const dados = await loadAllFunction();
      setTodosItens(dados || []);
    } catch (error) {
      console.error('Erro ao carregar todos os itens:', error);
      setTodosItens([]);
    } finally {
      setLoading(false);
    }
  }, [todosItens.length, loadAllFunction]);

  /**
   * Filter items locally
   */
  const filtrarItens = useCallback((termo) => {
    if (!termo || termo.length < MIN_SEARCH_LENGTH) return [];
    
    const termoLower = termo.toLowerCase().trim();
    return todosItens.filter(item => {
      // This should be customized based on the item structure
      if (typeof item === 'string') {
        return item.toLowerCase().includes(termoLower);
      }
      
      // For objects, check common properties
      return Object.values(item).some(value => 
        value && value.toString().toLowerCase().includes(termoLower)
      );
    }).slice(0, MAX_DROPDOWN_ITEMS);
  }, [todosItens]);

  /**
   * Search items
   */
  const buscarItens = useCallback(async (termo) => {
    if (!termo || termo.length < MIN_SEARCH_LENGTH) {
      setOpcoes([]);
      setDropdownVisivel(false);
      return;
    }

    // If loadAllFunction is provided, use local filtering
    if (loadAllFunction) {
      if (todosItens.length === 0) {
        await carregarTodosItens();
      }
      const filtrados = filtrarItens(termo);
      setOpcoes(filtrados);
      setDropdownVisivel(true);
      setSelectedIndex(-1);
      return;
    }

    // Otherwise, use the search function
    setLoading(true);
    try {
      const resultados = await searchFunction(termo);
      setOpcoes(resultados || []);
      setDropdownVisivel(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
      setOpcoes([]);
    } finally {
      setLoading(false);
    }
  }, [searchFunction, loadAllFunction, todosItens.length, carregarTodosItens, filtrarItens]);

  /**
   * Handle input change with debounce
   */
  const handleInputChange = useCallback((event) => {
    const valor = event.target.value;
    setValorSelecionado(valor);
    
    if (!valor) {
      setOpcoes([]);
      setDropdownVisivel(false);
      setItemInfo({});
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      buscarItens(valor);
    }, DEBOUNCE_DELAY);
  }, [buscarItens]);

  /**
   * Select an item
   */
  const selecionarItem = useCallback((item) => {
    let valorFormatado = item;
    let infoItem = {};

    if (formatFunction) {
      const resultado = formatFunction(item);
      valorFormatado = resultado.displayText || item;
      infoItem = resultado;
    } else if (typeof item === 'object') {
      // Default formatting for objects
      valorFormatado = item.nome || item.descricao || item.codigo || JSON.stringify(item);
      infoItem = item;
    }

    setValorSelecionado(valorFormatado);
    setItemInfo(infoItem);
    setDropdownVisivel(false);
    setOpcoes([]);
  }, [formatFunction]);

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback((event) => {
    if (!dropdownVisivel || opcoes.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, opcoes.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0) {
          selecionarItem(opcoes[selectedIndex]);
        }
        break;
      case 'Escape':
        setDropdownVisivel(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  }, [dropdownVisivel, opcoes, selectedIndex, selecionarItem]);

  /**
   * Clear all states
   */
  const limpar = useCallback(() => {
    setOpcoes([]);
    setDropdownVisivel(false);
    setSelectedIndex(-1);
    setValorSelecionado('');
    setItemInfo({});
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  return {
    // States
    opcoes,
    todosItens,
    loading,
    dropdownVisivel,
    selectedIndex,
    valorSelecionado,
    itemInfo,

    // Refs
    inputRef,

    // Functions
    carregarTodosItens,
    buscarItens,
    handleInputChange,
    selecionarItem,
    handleKeyDown,
    limpar,
    setValorSelecionado,
    setItemInfo,
    setDropdownVisivel,
    setSelectedIndex
  };
};