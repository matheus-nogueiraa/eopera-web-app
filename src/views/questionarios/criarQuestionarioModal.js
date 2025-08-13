import React from 'react'
import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormLabel,
  CFormInput,
  CCol,
  CRow,
  CFormSelect,
  CCollapse,
  CCard,
  CCardBody,
  CFormCheck,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilChevronBottom, cilChevronTop, cilTrash } from '@coreui/icons'

const CriarQuestionarioModal = ({ visible, onClose, onSave }) => {
  const [ showConfirm, setShowConfirm ] = React.useState(false)
  // Múltiplas perguntas
  const [ perguntas, setPerguntas ] = React.useState([
    {
      id: Date.now(),
      aberta: true,
      texto: '',
      tipo: 'unica',
      respostas: [
        { id: Date.now() + 1, texto: '', correta: false }
      ]
    }
  ])

  // Adiciona nova pergunta e fecha todas as outras (acordeão)
  const handleAdicionarPergunta = () => {
    setPerguntas(prev => [
      ...prev.map(p => ({ ...p, aberta: false })),
      {
        id: Date.now() + Math.floor(Math.random() * 10000),
        aberta: true,
        texto: '',
        tipo: 'unica',
        respostas: [
          { id: Date.now() + Math.floor(Math.random() * 10000), texto: '', correta: false }
        ]
      }
    ])
  }

  // Remove pergunta
  const handleRemoverPergunta = (id) => {
    setPerguntas(perguntas.filter(p => p.id !== id))
  }

  // Alterna collapse da pergunta, fechando todas as outras (acordeão)
  const handleTogglePergunta = (id) => {
    setPerguntas(perguntas.map(p => ({ ...p, aberta: p.id === id ? !p.aberta : false })))
  }

  // Atualiza texto da pergunta
  const handlePerguntaChange = (id, value) => {
    setPerguntas(perguntas.map(p => p.id === id ? { ...p, texto: value } : p))
  }

  // Atualiza tipo da pergunta
  const handleTipoChange = (id, value) => {
    setPerguntas(perguntas.map(p => p.id === id ? { ...p, tipo: value, respostas: p.respostas.map(r => ({ ...r, correta: false })) } : p))
  }

  // Atualiza texto de uma resposta
  const handleRespostaChange = (perguntaId, respostaId, value) => {
    setPerguntas(perguntas.map(p =>
      p.id === perguntaId
        ? { ...p, respostas: p.respostas.map(r => r.id === respostaId ? { ...r, texto: value } : r) }
        : p
    ))
  }

  // Adiciona nova resposta
  const handleAdicionarResposta = (perguntaId) => {
    setPerguntas(perguntas.map(p =>
      p.id === perguntaId
        ? { ...p, respostas: [ ...p.respostas, { id: Date.now() + Math.floor(Math.random() * 10000), texto: '', correta: false } ] }
        : p
    ))
  }

  // Remove resposta
  const handleRemoverResposta = (perguntaId, respostaId) => {
    setPerguntas(perguntas.map(p =>
      p.id === perguntaId
        ? { ...p, respostas: p.respostas.filter(r => r.id !== respostaId) }
        : p
    ))
  }

  // Define resposta(s) correta(s)
  const handleCorretaChange = (perguntaId, respostaId, checked) => {
    setPerguntas(perguntas.map(p => {
      if (p.id !== perguntaId) return p
      if (p.tipo === 'unica') {
        return {
          ...p,
          respostas: p.respostas.map(r => ({ ...r, correta: r.id === respostaId ? checked : false }))
        }
      } else {
        return {
          ...p,
          respostas: p.respostas.map(r => r.id === respostaId ? { ...r, correta: checked } : r)
        }
      }
    }))
  }
  const handleRequestClose = () => {
    setShowConfirm(true)
  }

  const handleConfirmCancel = () => {
    setShowConfirm(false)
    onClose()
  }

  const handleCancelClose = () => {
    setShowConfirm(false)
  }

  // Função para salvar e logar o formulário
  const handleSave = () => {
    if (onSave) onSave(perguntas)
  }
  return (
    <>
      <CModal visible={visible} size="lg" backdrop="static" closeOnBackdrop={false} closeOnEscape={false}>
        <CModalHeader closeButton={false}>
          <CModalTitle>Novo Questionário</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow className="mb-3">
            <CCol md={12}>
              <CFormLabel htmlFor="Nome">Descrição do Questionário</CFormLabel>
              <CFormInput type="text" id="nome" placeholder="Digite a descrição" />
            </CCol>
            <CCol md={12} className="mt-3">
              <CFormLabel htmlFor="Nome">Selecione o Curso</CFormLabel>
              <CFormSelect>
                <option value="">Selecione o Curso</option>
                <option value="react">React</option>
                <option value="vue">Vue</option>
                <option value="angular">Angular</option>
              </CFormSelect>
            </CCol>
            <hr className="mt-4"></hr>
          </CRow>
          {perguntas.map((pergunta, idx) => (
            <CRow className="mb-2" key={pergunta.id}>
              <CCol md={12}>
                <CCard className="mb-1">
                  <div className="d-flex justify-content-between align-items-center px-3 py-2" style={{ cursor: 'pointer' }} onClick={() => handleTogglePergunta(pergunta.id)}>
                    <span className="fw-bold">Pergunta {idx + 1}</span>
                    <div>
                      <CButton color="danger" size="sm" className="me-2" onClick={e => { e.stopPropagation(); handleRemoverPergunta(pergunta.id) }} disabled={perguntas.length <= 1}>
                        <CIcon icon={cilTrash} />
                      </CButton>
                      <CIcon icon={pergunta.aberta ? cilChevronTop : cilChevronBottom} size="lg" />
                    </div>
                  </div>
                  <CCollapse visible={pergunta.aberta}>
                    <CCardBody>
                      <CFormLabel>Pergunta</CFormLabel>
                      <CFormInput
                        type="text"
                        value={pergunta.texto}
                        onChange={e => handlePerguntaChange(pergunta.id, e.target.value)}
                        placeholder="Digite a pergunta"
                      />
                      <CFormLabel className="mt-3">Tipo</CFormLabel>
                      <CFormSelect
                        value={pergunta.tipo}
                        onChange={e => handleTipoChange(pergunta.id, e.target.value)}
                      >
                        <option value="unica">Única escolha</option>
                        <option value="multipla">Múltipla escolha</option>
                      </CFormSelect>
                      <CFormLabel className="mt-3">Respostas</CFormLabel>
                      {pergunta.respostas.map((resposta, rIdx) => (
                        <div key={resposta.id} className="d-flex align-items-center mb-2">
                          {pergunta.tipo === 'unica' ? (
                            <input
                              type="radio"
                              name={`resposta-correta-${pergunta.id}`}
                              checked={resposta.correta}
                              onChange={e => handleCorretaChange(pergunta.id, resposta.id, e.target.checked)}
                              className="form-check-input me-2"
                            />
                          ) : (
                            <input
                              type="checkbox"
                              checked={resposta.correta}
                              onChange={e => handleCorretaChange(pergunta.id, resposta.id, e.target.checked)}
                              className="form-check-input me-2"
                            />
                          )}
                          <CFormInput
                            type="text"
                            value={resposta.texto}
                            onChange={e => handleRespostaChange(pergunta.id, resposta.id, e.target.value)}
                            placeholder={`Resposta ${rIdx + 1}`}
                            className="me-2"
                          />
                          <CButton color="danger" size="sm" onClick={() => handleRemoverResposta(pergunta.id, resposta.id)} disabled={pergunta.respostas.length <= 1}>
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </div>
                      ))}
                      <CButton color="success" size="sm" className="mt-2" onClick={() => handleAdicionarResposta(pergunta.id)}>
                        <CIcon icon={cilPlus} /> Adicionar Resposta
                      </CButton>
                    </CCardBody>
                  </CCollapse>
                </CCard>
              </CCol>
            </CRow>
          ))}
          <CRow className="mb-3">
            <CCol md={12}>
              <CButton color="primary" className="w-100" onClick={handleAdicionarPergunta}>
                <CIcon icon={cilPlus} className="text-white" /> Adicionar Pergunta
              </CButton>
            </CCol>
          </CRow>
          <div className="d-flex justify-content-end mt-3">
            <CFormCheck id="flexCheckDefault" label="Ativo?" checked={true} />
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={handleRequestClose}>
            Cancelar
          </CButton>
          <CButton color="primary" className="w-20" onClick={handleSave}>
            Salvar
          </CButton>
        </CModalFooter>
      </CModal>
      <CModal visible={showConfirm} onClose={handleCancelClose} size="sm" alignment="center">
        <CModalHeader onClose={handleCancelClose}>
          <CModalTitle>Confirmar Cancelamento</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Tem certeza que deseja cancelar? Todas as informações não salvas serão perdidas.
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={handleCancelClose}>
            Não
          </CButton>
          <CButton color="danger" onClick={handleConfirmCancel}>
            Sim, cancelar
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default CriarQuestionarioModal
