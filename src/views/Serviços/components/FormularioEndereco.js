// FormularioEndereco component - Address form fields

import React from 'react';
import PropTypes from 'prop-types';
import {
  CFormInput,
  CFormLabel,
  CRow,
  CCol
} from '@coreui/react';
import FieldError from './common/FieldError';
import Autocomplete from './common/Autocomplete';
import { useAutocomplete } from '../hooks/useAutocomplete';
import { formatMunicipality } from '../utils/formatters';
import httpRequest from '../../../utils/httpRequests';

/**
 * FormularioEndereco Component - Contains address form fields
 * @param {Object} props - Component props
 */
const FormularioEndereco = ({ 
  camposComErro,
  ocorrenciaSemEndereco,
  todosMunicipios,
  onMunicipioSelect
}) => {
  // Autocomplete for municipios
  const municipioAutocomplete = useAutocomplete(
    async (termo) => {
      if (todosMunicipios.length === 0) {
        // Load municipalities if not loaded yet
        try {
          const resp = await httpRequest('/consultarMunicipiosIBGE', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`
            },
          });
          const json = await resp.json();
          const municipios = json.status && Array.isArray(json.data) ? json.data : [];
          
          // Filter after loading
          const termoLower = termo.toLowerCase().trim();
          return municipios.filter(m =>
            m.codigo?.toLowerCase().includes(termoLower) ||
            m.descricao?.toLowerCase().includes(termoLower)
          ).slice(0, 20);
        } catch (e) {
          return [];
        }
      } else {
        // Filter locally
        const termoLower = termo.toLowerCase().trim();
        return todosMunicipios.filter(m =>
          m.codigo?.toLowerCase().includes(termoLower) ||
          m.descricao?.toLowerCase().includes(termoLower)
        ).slice(0, 20);
      }
    },
    null,
    formatMunicipality
  );

  const handleMunicipioSelect = (municipio) => {
    municipioAutocomplete.selecionarItem(municipio);
    onMunicipioSelect(municipio);
    
    // Update the DOM input directly
    const municipioInput = document.getElementById('municipio');
    if (municipioInput) {
      municipioInput.value = formatMunicipality(municipio);
    }
  };

  if (ocorrenciaSemEndereco) {
    return (
      <CRow className="mb-3">
        <CCol md={12}>
          <CFormLabel htmlFor="municipio" className="mb-1">Município:</CFormLabel>
          <Autocomplete
            inputRef={municipioAutocomplete.inputRef}
            value={municipioAutocomplete.valorSelecionado}
            onChange={municipioAutocomplete.handleInputChange}
            onKeyDown={municipioAutocomplete.handleKeyDown}
            placeholder="Digite para buscar município"
            loading={municipioAutocomplete.loading}
            options={municipioAutocomplete.opcoes}
            dropdownVisible={municipioAutocomplete.dropdownVisivel}
            selectedIndex={municipioAutocomplete.selectedIndex}
            onSelectItem={handleMunicipioSelect}
            className={camposComErro.municipio ? 'campo-erro' : ''}
            id="municipio"
            renderOption={(municipio) => (
              <div>
                <strong>{municipio.codigo} - {municipio.descricao}</strong>
                <div className="text-muted small">
                  Estado: {municipio.estado}
                </div>
              </div>
            )}
            renderNoResults={() => 'Nenhum município encontrado'}
          />
          <FieldError error={camposComErro.municipio} />
        </CCol>
      </CRow>
    );
  }

  return (
    <>
      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel htmlFor="endereco" className="mb-1">Endereço:</CFormLabel>
          <CFormInput
            type="text"
            id="endereco"
            placeholder="Digite o endereço"
            className={camposComErro.endereco ? 'campo-erro' : ''}
          />
          <FieldError error={camposComErro.endereco} />
        </CCol>
        <CCol md={6}>
          <CFormLabel htmlFor="bairro" className="mb-1">Bairro:</CFormLabel>
          <CFormInput
            type="text"
            id="bairro"
            placeholder="Digite o bairro"
            className={camposComErro.bairro ? 'campo-erro' : ''}
          />
          <FieldError error={camposComErro.bairro} />
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol md={4}>
          <CFormLabel htmlFor="municipio" className="mb-1">Município:</CFormLabel>
          <Autocomplete
            inputRef={municipioAutocomplete.inputRef}
            value={municipioAutocomplete.valorSelecionado}
            onChange={municipioAutocomplete.handleInputChange}
            onKeyDown={municipioAutocomplete.handleKeyDown}
            placeholder="Digite para buscar município"
            loading={municipioAutocomplete.loading}
            options={municipioAutocomplete.opcoes}
            dropdownVisible={municipioAutocomplete.dropdownVisivel}
            selectedIndex={municipioAutocomplete.selectedIndex}
            onSelectItem={handleMunicipioSelect}
            className={camposComErro.municipio ? 'campo-erro' : ''}
            id="municipio"
            renderOption={(municipio) => (
              <div>
                <strong>{municipio.codigo} - {municipio.descricao}</strong>
                <div className="text-muted small">
                  Estado: {municipio.estado}
                </div>
              </div>
            )}
            renderNoResults={() => 'Nenhum município encontrado'}
          />
          <FieldError error={camposComErro.municipio} />
        </CCol>
        <CCol md={2}>
          <CFormLabel htmlFor="cep" className="mb-1">CEP:</CFormLabel>
          <CFormInput
            type="text"
            id="cep"
            placeholder="00000-000"
            className={camposComErro.cep ? 'campo-erro' : ''}
          />
          <FieldError error={camposComErro.cep} />
        </CCol>
        <CCol md={3}>
          <CFormLabel htmlFor="latitude" className="mb-1">Latitude:</CFormLabel>
          <CFormInput
            type="text"
            id="latitude"
            placeholder="Ex: -23.5505"
            className={camposComErro.latitude ? 'campo-erro' : ''}
          />
          <FieldError error={camposComErro.latitude} />
        </CCol>
        <CCol md={3}>
          <CFormLabel htmlFor="longitude" className="mb-1">Longitude:</CFormLabel>
          <CFormInput
            type="text"
            id="longitude"
            placeholder="Ex: -46.6333"
            className={camposComErro.longitude ? 'campo-erro' : ''}
          />
          <FieldError error={camposComErro.longitude} />
        </CCol>
      </CRow>
    </>
  );
};

FormularioEndereco.propTypes = {
  camposComErro: PropTypes.object.isRequired,
  ocorrenciaSemEndereco: PropTypes.bool.isRequired,
  todosMunicipios: PropTypes.array,
  onMunicipioSelect: PropTypes.func
};

FormularioEndereco.defaultProps = {
  todosMunicipios: [],
  onMunicipioSelect: () => {}
};

export default FormularioEndereco;