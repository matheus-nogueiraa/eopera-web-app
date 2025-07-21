import React, { useState } from 'react';
import {
  CCol,
  CRow,
  CButton,
} from '@coreui/react'
import CIcon from '@coreui/icons-react';
import { cilPlus } from '@coreui/icons'
import CriarConteudoModal from './criarCursosModal';
import CriarConteudoTabela from './criarCursosTabela';

const criarConteudos = () => {
  const [ showModal, setShowModal ] = useState(false);
  const [ search, setSearch ] = useState('');

  return (
    <div className="container-fluid">
      <div className="d-sm-flex align-items-center justify-content-between">
        <h1 className="h3 mb-0 text-gray-800">Criar Conteúdos</h1>
      </div>
      <CRow className="mt-4 align-items-center">
          <CCol lg={6} className="d-flex align-items-center gap-2" style={{ width: '100%' }}>
            <CButton color="primary" style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }} onClick={() => setShowModal(true)}>
              <CIcon icon={cilPlus} className="text-white" /> Criar Curso
            </CButton>
            <input
              type="text"
              className="form-control"
              style={{ flex: 1, minWidth: 0 }}
              placeholder="Buscar questionário..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <CriarConteudoModal
              visible={showModal}
              onClose={() => setShowModal(false)}
              onSave={() => {
                setShowModal(false);
              }}
            />
          </CCol>
        </CRow>
        <CriarConteudoTabela />
    </div>
  );
};

export default criarConteudos;
