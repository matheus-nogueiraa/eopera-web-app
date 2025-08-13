import React from 'react'
import {
  CCol,
  CRow,
  CForm,
  CFormLabel,
  CFormInput,
  CFormSelect,
  CButton,
  CFormFeedback,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CSpinner,
} from '@coreui/react'

const UsuariosModal = ({
  showModal,
  setShowModal,
  showDeleteModal,
  setShowDeleteModal,
  userToDelete,
  editingUser,
  loading,
  formData,
  setFormData,
  formErrors,
  handleSubmit,
  cancelDelete,
  confirmDelete,
}) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target

    let newValue = value

    // Formatação automática do CPF
    if (name === 'cpf') {
      // Remove caracteres não numéricos
      newValue = value.replace(/[^\d]/g, '')

      // Aplica formatação apenas quando necessário
      if (newValue.length >= 11) {
        newValue = newValue.substring(0, 11) // Limita a 11 dígitos
        newValue = newValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
      } else if (newValue.length >= 7) {
        newValue = newValue.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3')
      } else if (newValue.length >= 4) {
        newValue = newValue.replace(/(\d{3})(\d{1,3})/, '$1.$2')
      }
    }

    // Converter nome para maiúsculas (como na API)
    if (name === 'nome') {
      newValue = value.toUpperCase()
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }))
  }

  return (
    <>
      {/* Modal para edição e criação de usuário */}
      <CModal visible={showModal} onClose={() => setShowModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle>{editingUser ? 'Editar Usuário' : 'Adicionar Novo Usuário'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleSubmit}>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel htmlFor="matricula">Matrícula</CFormLabel>
                <CFormInput
                  id="matricula"
                  name="matricula"
                  value={formData.matricula}
                  onChange={handleInputChange}
                  invalid={!!formErrors.matricula}
                  disabled={loading}
                />
                <CFormFeedback invalid>{formErrors.matricula}</CFormFeedback>
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="tipoUsuario">Tipo de Usuário</CFormLabel>
                <CFormSelect
                  id="tipoUsuario"
                  name="tipoUsuario"
                  value={formData.tipoUsuario}
                  onChange={handleInputChange}
                  invalid={!!formErrors.tipoUsuario}
                  disabled={loading}
                >
                  <option value="">Selecione o tipo de usuário</option>
                  <option value="CLT">CLT</option>
                  <option value="PJ">PJ</option>
                </CFormSelect>
                <CFormFeedback invalid>{formErrors.tipoUsuario}</CFormFeedback>
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel htmlFor="nome">Nome</CFormLabel>
                <CFormInput
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  invalid={!!formErrors.nome}
                  disabled={loading}
                />
                <CFormFeedback invalid>{formErrors.nome}</CFormFeedback>
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="cpf">CPF</CFormLabel>
                <CFormInput
                  id="cpf"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleInputChange}
                  invalid={!!formErrors.cpf}
                  disabled={loading}
                />
                <CFormFeedback invalid>{formErrors.cpf}</CFormFeedback>
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </CButton>
          <CButton color="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <CSpinner size="sm" className="me-1" /> : null}
            {editingUser ? 'Atualizar Usuário' : 'Cadastrar Usuário'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal de confirmação de exclusão */}
      <CModal visible={showDeleteModal} onClose={cancelDelete}>
        <CModalHeader>
          <CModalTitle>Confirmar Exclusão</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>
            Tem certeza que deseja excluir o usuário <strong>{userToDelete?.nome}</strong>?
          </p>
          <p className="text-danger">Esta ação não pode ser desfeita.</p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={cancelDelete}>
            Cancelar
          </CButton>
          <CButton color="danger" onClick={confirmDelete} disabled={loading}>
            {loading ? <CSpinner size="sm" className="me-1" /> : null}
            Excluir Usuário
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default UsuariosModal
