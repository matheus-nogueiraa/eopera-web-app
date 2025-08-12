// Constants for ServicosModal component

export const DEBOUNCE_DELAY = 300;
export const MIN_SEARCH_LENGTH = 2;
export const MAX_DROPDOWN_ITEMS = 20;
export const AUTO_HIDE_SUCCESS_ALERT = 4000;
export const AUTO_HIDE_ERROR_ALERT = 8000;
export const HIDE_FIELD_ERROR_DELAY = 5000;

export const STATUS_OPTIONS = [
  { value: '', label: 'Selecione um status' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'em_andamento', label: 'Em Andamento' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'cancelado', label: 'Cancelado' }
];

export const REQUIRED_FIELDS = [
  'status',
  'data',
  'hora',
  'dataConclusao',
  'horaConclusao',
  'numeroOperacional',
  'municipio'
];

export const CONDITIONAL_REQUIRED_FIELDS = [
  'endereco',
  'bairro'
];

export const CSS_STYLES = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .alert-danger {
    border-left: 4px solid #dc3545 !important;
  }
  
  .alert-danger .alert-content {
    line-height: 1.6;
  }
  
  .alert-danger ul {
    margin: 0;
    padding-left: 1rem;
  }
  
  .campo-erro {
    border-color: #dc3545 !important;
    box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
  }
  
  .texto-erro {
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 0.25rem;
    margin-bottom: 0;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  
  .fade-in-error {
    animation: fadeIn 0.3s ease-in-out;
  }
`;