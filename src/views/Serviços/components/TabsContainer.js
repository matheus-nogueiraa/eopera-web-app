// TabsContainer component - Manages the main content tabs

import React from 'react';
import PropTypes from 'prop-types';
import FormularioBasico from './FormularioBasico';
import FormularioEndereco from './FormularioEndereco';
import FormularioAcoes from './FormularioAcoes';

/**
 * TabsContainer Component - Container for all form sections
 * @param {Object} props - Component props
 */
const TabsContainer = ({ 
  // Modal state props
  camposComErro,
  
  // Form state props
  usuarios,
  servicos,
  isLider,
  ocorrenciaSemEndereco,
  centroCustoOpcoes,
  centroCustoSelecionado,
  loadingCentroCusto,
  
  // Data props
  todosUsuarios,
  todosServicos,
  todosMunicipios,
  equipesData,
  
  // Event handlers
  onCentroCustoChange,
  onOcorrenciaSemEnderecoChange,
  onMunicipioSelect,
  onEquipeSelect,
  onUsuarioSelect,
  onAdicionarUsuario,
  onRemoverUsuario,
  onAdicionarServico,
  onRemoverServico,
  onAtualizarServico,
  onImageUpload,
  onRemoverFoto,
  onLiderChange,
  setUsuarioSelecionado,
  setUsuarioInfo
}) => {
  return (
    <div>
      {/* Basic Form Section */}
      <FormularioBasico
        camposComErro={camposComErro}
        centroCustoOpcoes={centroCustoOpcoes}
        centroCustoSelecionado={centroCustoSelecionado}
        loadingCentroCusto={loadingCentroCusto}
        ocorrenciaSemEndereco={ocorrenciaSemEndereco}
        onCentroCustoChange={onCentroCustoChange}
        onOcorrenciaSemEnderecoChange={onOcorrenciaSemEnderecoChange}
        todosUsuarios={todosUsuarios}
        onUsuarioSelect={onUsuarioSelect}
        equipesData={equipesData}
        onEquipeSelect={onEquipeSelect}
      />

      {/* Address Form Section */}
      <FormularioEndereco
        camposComErro={camposComErro}
        ocorrenciaSemEndereco={ocorrenciaSemEndereco}
        todosMunicipios={todosMunicipios}
        onMunicipioSelect={onMunicipioSelect}
      />

      {/* Actions Form Section */}
      <FormularioAcoes
        camposComErro={camposComErro}
        usuarios={usuarios}
        servicos={servicos}
        isLider={isLider}
        todosUsuarios={todosUsuarios}
        todosServicos={todosServicos}
        onAdicionarUsuario={onAdicionarUsuario}
        onRemoverUsuario={onRemoverUsuario}
        onAdicionarServico={onAdicionarServico}
        onRemoverServico={onRemoverServico}
        onAtualizarServico={onAtualizarServico}
        onImageUpload={onImageUpload}
        onRemoverFoto={onRemoverFoto}
        onLiderChange={onLiderChange}
        setUsuarioSelecionado={setUsuarioSelecionado}
        setUsuarioInfo={setUsuarioInfo}
      />
    </div>
  );
};

TabsContainer.propTypes = {
  // Modal state props
  camposComErro: PropTypes.object.isRequired,
  
  // Form state props
  usuarios: PropTypes.array.isRequired,
  servicos: PropTypes.array.isRequired,
  isLider: PropTypes.bool.isRequired,
  ocorrenciaSemEndereco: PropTypes.bool.isRequired,
  centroCustoOpcoes: PropTypes.array.isRequired,
  centroCustoSelecionado: PropTypes.string.isRequired,
  loadingCentroCusto: PropTypes.bool.isRequired,
  
  // Data props
  todosUsuarios: PropTypes.array,
  todosServicos: PropTypes.array,
  todosMunicipios: PropTypes.array,
  equipesData: PropTypes.array,
  
  // Event handlers
  onCentroCustoChange: PropTypes.func.isRequired,
  onOcorrenciaSemEnderecoChange: PropTypes.func.isRequired,
  onMunicipioSelect: PropTypes.func,
  onEquipeSelect: PropTypes.func,
  onUsuarioSelect: PropTypes.func,
  onAdicionarUsuario: PropTypes.func.isRequired,
  onRemoverUsuario: PropTypes.func.isRequired,
  onAdicionarServico: PropTypes.func.isRequired,
  onRemoverServico: PropTypes.func.isRequired,
  onAtualizarServico: PropTypes.func.isRequired,
  onImageUpload: PropTypes.func.isRequired,
  onRemoverFoto: PropTypes.func.isRequired,
  onLiderChange: PropTypes.func.isRequired,
  setUsuarioSelecionado: PropTypes.func.isRequired,
  setUsuarioInfo: PropTypes.func.isRequired
};

TabsContainer.defaultProps = {
  todosUsuarios: [],
  todosServicos: [],
  todosMunicipios: [],
  equipesData: [],
  onMunicipioSelect: () => {},
  onEquipeSelect: () => {},
  onUsuarioSelect: () => {}
};

export default TabsContainer;