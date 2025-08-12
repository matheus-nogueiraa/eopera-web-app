// FormularioBasico component - Basic form fields

import React from 'react';
import PropTypes from 'prop-types';
import {
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormCheck,
  CRow,
  CCol
} from '@coreui/react';
import FieldError from './common/FieldError';
import Autocomplete from './common/Autocomplete';
import { useAutocomplete } from '../hooks/useAutocomplete';
import { consultarEquipes } from '../../../services/equipesService';
import { formatUserInfo } from '../utils/formatters';
import { filtrarUsuarios } from '../../../services/usuariosService';

/**
 * FormularioBasico Component - Contains basic form fields
 * @param {Object} props - Component props
 */
const FormularioBasico = ({ 
  camposComErro,
  centroCustoOpcoes,
  centroCustoSelecionado,
  loadingCentroCusto,
  ocorrenciaSemEndereco,
  onCentroCustoChange,
  onOcorrenciaSemEnderecoChange,
  todosUsuarios,
  onUsuarioSelect,
  equipesData,
  onEquipeSelect
}) => {
  // Autocomplete for numero operacional (teams)
  const numeroOperacionalAutocomplete = useAutocomplete(
    async (termo) => {
      if (!equipesData || equipesData.length === 0) return [];
      const termoLower = termo.toLowerCase().trim();
      return equipesData.filter(equipe =>
        equipe.numeroOperacional?.toLowerCase().includes(termoLower) ||
        equipe.descricao?.toLowerCase().includes(termoLower)
      ).slice(0, 20);
    },
    null,
    (equipe) => ({
      displayText: `${equipe.numeroOperacional} - ${equipe.descricao}`,
      ...equipe
    })
  );

  // Autocomplete for usuarios
  const usuarioAutocomplete = useAutocomplete(
    async (termo) => {
      return filtrarUsuarios(todosUsuarios, termo);
    },
    null,
    formatUserInfo
  );

  const handleEquipeSelect = (equipe) => {
    numeroOperacionalAutocomplete.selecionarItem(equipe);
    onEquipeSelect(equipe);
  };

  const handleUsuarioSelect = (usuario) => {
    usuarioAutocomplete.selecionarItem(usuario);
    onUsuarioSelect(usuario);
  };

  return (
    <>
      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel htmlFor="numeroOS" className="mb-1">Número OS:</CFormLabel>
          <CFormInput
            type="text"
            id="numeroOS"
            placeholder="Digite o número da OS"
            className={camposComErro.numeroOS ? 'campo-erro' : ''}
          />
          <FieldError error={camposComErro.numeroOS} />
        </CCol>
        <CCol md={6}>
          <CFormLabel htmlFor="unConsumidora" className="mb-1">UN. Consumidora:</CFormLabel>
          <CFormInput
            type="text"
            id="unConsumidora"
            placeholder="Digite a unidade consumidora"
            className={camposComErro.unConsumidora ? 'campo-erro' : ''}
          />
          <FieldError error={camposComErro.unConsumidora} />
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol md={4}>
          <CFormLabel htmlFor="status" className="mb-1">Status:</CFormLabel>
          <CFormSelect
            id="status"
            className={camposComErro.status ? 'campo-erro' : ''}
          >
            <option value="">Selecione um status</option>
            <option value="Pendente">Pendente</option>
            <option value="Em Andamento">Em Andamento</option>
            <option value="Concluído">Concluído</option>
            <option value="Cancelado">Cancelado</option>
          </CFormSelect>
          <FieldError error={camposComErro.status} />
        </CCol>
        <CCol md={4}>
          <CFormLabel htmlFor="data" className="mb-1">Data:</CFormLabel>
          <CFormInput
            type="date"
            id="data"
            className={camposComErro.data ? 'campo-erro' : ''}
          />
          <FieldError error={camposComErro.data} />
        </CCol>
        <CCol md={4}>
          <CFormLabel htmlFor="hora" className="mb-1">Hora:</CFormLabel>
          <CFormInput
            type="time"
            id="hora"
            className={camposComErro.hora ? 'campo-erro' : ''}
          />
          <FieldError error={camposComErro.hora} />
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol md={4}>
          <CFormLabel htmlFor="dataConclusao" className="mb-1">Data Conclusão:</CFormLabel>
          <CFormInput
            type="date"
            id="dataConclusao"
            className={camposComErro.dataConclusao ? 'campo-erro' : ''}
          />
          <FieldError error={camposComErro.dataConclusao} />
        </CCol>
        <CCol md={4}>
          <CFormLabel htmlFor="horaConclusao" className="mb-1">Hora Conclusão:</CFormLabel>
          <CFormInput
            type="time"
            id="horaConclusao"
            className={camposComErro.horaConclusao ? 'campo-erro' : ''}
          />
          <FieldError error={camposComErro.horaConclusao} />
        </CCol>
        <CCol md={4}>
          <CFormLabel htmlFor="numeroOperacional" className="mb-1">Número Operacional:</CFormLabel>
          <Autocomplete
            inputRef={numeroOperacionalAutocomplete.inputRef}
            value={numeroOperacionalAutocomplete.valorSelecionado}
            onChange={numeroOperacionalAutocomplete.handleInputChange}
            onKeyDown={numeroOperacionalAutocomplete.handleKeyDown}
            placeholder="Digite para buscar equipe"
            loading={numeroOperacionalAutocomplete.loading}
            options={numeroOperacionalAutocomplete.opcoes}
            dropdownVisible={numeroOperacionalAutocomplete.dropdownVisivel}
            selectedIndex={numeroOperacionalAutocomplete.selectedIndex}
            onSelectItem={handleEquipeSelect}
            className={camposComErro.numeroOperacional ? 'campo-erro' : ''}
            renderOption={(equipe) => (
              <div>
                <strong>{equipe.numeroOperacional} - {equipe.descricao}</strong>
                <div className="text-muted small">
                  Código: {equipe.codigo} | Status: {equipe.status}
                </div>
              </div>
            )}
            renderNoResults={() => 'Nenhuma equipe encontrada'}
          />
          <FieldError error={camposComErro.numeroOperacional} />
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol md={4}>
          <CFormLabel htmlFor="centroDeCustos" className="mb-1">Centro de Custos:</CFormLabel>
          <div className="position-relative">
            {loadingCentroCusto ? (
              <div className="d-flex align-items-center">
                <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                  <span className="visually-hidden">Carregando...</span>
                </div>
                <span>Carregando centros de custo...</span>
              </div>
            ) : (
              <CFormSelect
                id="centroDeCustos"
                value={centroCustoSelecionado}
                onChange={onCentroCustoChange}
                className={camposComErro.centroDeCustos ? 'campo-erro' : ''}
              >
                <option value="">Selecione um centro de custo</option>
                {centroCustoOpcoes.map((centroCusto, index) => (
                  <option key={index} value={centroCusto.centroCusto}>
                    {centroCusto.centroCusto?.trim()} - {centroCusto.descricaoCCusto?.trim()}
                  </option>
                ))}
              </CFormSelect>
            )}
            <FieldError error={camposComErro.centroDeCustos} />
          </div>
        </CCol>
        <CCol md={8}>
          <div className="d-flex align-items-center h-100">
            <CFormCheck
              id="checkOcorrenciaSemEndereco"
              label="Ocorrência sem endereço"
              checked={ocorrenciaSemEndereco}
              onChange={onOcorrenciaSemEnderecoChange}
              className="mb-0"
            />
          </div>
        </CCol>
      </CRow>
    </>
  );
};

FormularioBasico.propTypes = {
  camposComErro: PropTypes.object.isRequired,
  centroCustoOpcoes: PropTypes.array.isRequired,
  centroCustoSelecionado: PropTypes.string.isRequired,
  loadingCentroCusto: PropTypes.bool.isRequired,
  ocorrenciaSemEndereco: PropTypes.bool.isRequired,
  onCentroCustoChange: PropTypes.func.isRequired,
  onOcorrenciaSemEnderecoChange: PropTypes.func.isRequired,
  todosUsuarios: PropTypes.array,
  onUsuarioSelect: PropTypes.func,
  equipesData: PropTypes.array,
  onEquipeSelect: PropTypes.func
};

FormularioBasico.defaultProps = {
  todosUsuarios: [],
  onUsuarioSelect: () => {},
  equipesData: [],
  onEquipeSelect: () => {}
};

export default FormularioBasico;