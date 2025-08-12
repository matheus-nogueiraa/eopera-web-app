// Reusable Autocomplete component

import React from 'react';
import PropTypes from 'prop-types';
import {
  CFormInput,
  CListGroup,
  CListGroupItem
} from '@coreui/react';

/**
 * Reusable Autocomplete Component
 * @param {Object} props - Component props
 */
const Autocomplete = ({
  value,
  onChange,
  onKeyDown,
  placeholder,
  loading,
  options,
  dropdownVisible,
  selectedIndex,
  onSelectItem,
  renderOption,
  renderNoResults,
  className,
  disabled,
  autoComplete = "off",
  inputRef,
  ...inputProps
}) => {
  return (
    <div className="position-relative">
      <CFormInput
        ref={inputRef}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={className}
        disabled={disabled}
        {...inputProps}
      />
      
      {loading && dropdownVisible && (
        <div 
          className="position-absolute" 
          style={{ right: '5px', top: '50%', transform: 'translateY(-50%)' }}
        >
          <div 
            className="spinner-border spinner-border-sm text-primary" 
            role="status" 
            style={{ width: '12px', height: '12px' }}
          >
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      )}

      {dropdownVisible && options.length > 0 && (
        <div
          className="position-absolute w-100 bg-white border border-top-0 shadow-sm"
          style={{
            zIndex: 1050,
            maxHeight: '200px',
            overflowY: 'auto',
            top: '100%'
          }}
        >
          <CListGroup flush>
            {options.map((option, idx) => (
              <CListGroupItem
                key={idx}
                className={`cursor-pointer py-2 px-3 ${selectedIndex === idx ? 'bg-light' : ''}`}
                style={{
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  backgroundColor: selectedIndex === idx ? '#f8f9fa' : 'white',
                  fontSize: '0.875rem'
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelectItem(option);
                }}
                onMouseEnter={(e) => {
                  if (selectedIndex !== idx) {
                    e.target.style.backgroundColor = '#f8f9fa';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedIndex !== idx) {
                    e.target.style.backgroundColor = 'white';
                  }
                }}
              >
                {renderOption ? renderOption(option, idx) : (
                  <div>
                    {typeof option === 'string' ? option : option.nome || option.descricao || 'Item'}
                  </div>
                )}
              </CListGroupItem>
            ))}
          </CListGroup>
        </div>
      )}

      {dropdownVisible && options.length === 0 && !loading && value.length >= 2 && (
        <div
          className="position-absolute w-100 bg-white border border-top-0 shadow-sm"
          style={{
            zIndex: 1050,
            top: '100%'
          }}
        >
          <div className="p-2 text-muted text-center" style={{ fontSize: '0.8rem' }}>
            {renderNoResults ? renderNoResults() : 'Nenhum resultado encontrado'}
          </div>
        </div>
      )}
    </div>
  );
};

Autocomplete.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func,
  placeholder: PropTypes.string,
  loading: PropTypes.bool,
  options: PropTypes.array,
  dropdownVisible: PropTypes.bool,
  selectedIndex: PropTypes.number,
  onSelectItem: PropTypes.func.isRequired,
  renderOption: PropTypes.func,
  renderNoResults: PropTypes.func,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  autoComplete: PropTypes.string,
  inputRef: PropTypes.object
};

Autocomplete.defaultProps = {
  onKeyDown: () => {},
  placeholder: '',
  loading: false,
  options: [],
  dropdownVisible: false,
  selectedIndex: -1,
  renderOption: null,
  renderNoResults: null,
  className: '',
  disabled: false,
  autoComplete: 'off',
  inputRef: null
};

export default Autocomplete;