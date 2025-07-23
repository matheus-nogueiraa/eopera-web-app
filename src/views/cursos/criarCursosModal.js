import React from 'react'
import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormLabel,
  CForm,
  CFormInput,
  CCol,
  CFormTextarea,
  CRow,
  CFormSelect,
  CFormCheck
} from '@coreui/react'

const CriarConteudoModal = ({ visible, onClose, onSave }) => {
  return (
    <CModal visible={visible} onClose={onClose} size="lg">
      <CModalHeader onClose={onClose}>
        <CModalTitle>Novo Conteúdo</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CRow className="mb-3">
          <CCol md={12}>
            <CFormLabel htmlFor="Nome">Nome</CFormLabel>
            <CFormInput type="text" id="nome" placeholder="Digite o título" />
          </CCol>
        </CRow>
        <CRow className="mb-3">
          <CCol md={12}>
            <CFormLabel htmlFor="Descrição">Descrição</CFormLabel>
            <CFormTextarea type="text" id="descricao" placeholder="Digite a descrição" />
          </CCol>
        </CRow>
        <CRow className="mb-3">
          <CCol md={6}>
            <CFormLabel htmlFor="Descrição">Url do vídeo</CFormLabel>
            <CFormInput type="text" id="url" placeholder="Digite a url do vídeo" />
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="Descrição">Categoria</CFormLabel>
            <CFormSelect id="categoria" placeholder="Digite a categoria">
              <option value="">Selecione uma categoria</option>
              <option value="categoria1">Categoria 1</option>
              <option value="categoria2">Categoria 2</option>
              <option value="categoria3">Categoria 3</option>
            </CFormSelect>
          </CCol>
          <CCol md={2}>
            <>&nbsp;</>
            <CFormCheck id="flexCheckDefault" label="Ativo?" checked={true} />
          </CCol>
        </CRow>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>
          Cancelar
        </CButton>
        <CButton color="primary" onClick={onSave}>
          Salvar
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default CriarConteudoModal
