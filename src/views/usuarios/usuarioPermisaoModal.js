import React from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CForm,
  CFormCheck,
  CRow,
  CCol,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableDataCell,
  CTableHeaderCell,
  CFormSwitch,
  CFormInput,
  CInputGroup,
  CAlert,
  CSpinner
} from '@coreui/react'
import { useState, useEffect } from 'react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilTrash, cilMagnifyingGlass } from '@coreui/icons'
import httpRequest from '../../utils/httpRequests'
import './usuarioPermisaoModal.css'

const UsuarioPermissaoModal = ({
  showModal,
  setShowModal,
  editingUser,
}) => {
  // Estado para as permissões existentes do usuário
  const [permissoesExistentes, setPermissoesExistentes] = useState([])
  // Estado para as rotas disponíveis (para busca)
  const [rotasDisponiveis, setRotasDisponiveis] = useState([])
  const [rotasFiltradas, setRotasFiltradas] = useState([])
  const [termoBusca, setTermoBusca] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingRotas, setLoadingRotas] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [saving, setSaving] = useState(false)
  // Estados para controlar mudanças pendentes
  const [permissoesAdicionadas, setPermissoesAdicionadas] = useState([])
  const [permissoesParaRemover, setPermissoesParaRemover] = useState([])
  const [permissoesModificadas, setPermissoesModificadas] = useState(new Set())


  // Buscar permissões existentes do usuário
  const buscarPermissoesUsuario = async (cpf) => {
    setLoading(true)
    setError('')
    try {
      const response = await httpRequest(`/consultaPermissoesUsuario?cpf=${cpf}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.status) {
          // Converter os dados da API para formato utilizável
          const permissoesFormatadas = data.data.map(permissao => ({
            cpf: permissao.cpf,
            idPath: permissao.idPath.trim(),
            criar: permissao.post === 'T',
            atualizar: permissao.put === 'T',
            deletar: permissao.del === 'T'
          }))
          setPermissoesExistentes(permissoesFormatadas)
        } else {
          setError('Erro ao buscar permissões: ' + (data.message || 'Erro desconhecido'))
        }
      } else {
        setError('Erro na requisição: ' + response.status)
      }
    } catch (err) {
      setError('Erro ao conectar com a API: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Buscar rotas disponíveis para adicionar novas permissões
  const buscarRotasDisponiveis = async () => {
    setLoadingRotas(true)
    try {
      const response = await httpRequest('/consultaRotasCadastradas', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.status) {
          const rotasLimpas = data.data.map(rota => ({
            idPath: rota.idPath.trim(),
            descricao: rota.descricao.trim()
          }))
          setRotasDisponiveis(rotasLimpas)
        }
      }
    } catch (err) {
      console.error('Erro ao buscar rotas disponíveis:', err)
    } finally {
      setLoadingRotas(false)
    }
  }

  // Filtrar rotas disponíveis baseado no termo de busca
  const filtrarRotas = (termo) => {
    setTermoBusca(termo)
    if (!termo.trim()) {
      setRotasFiltradas([])
    } else {
      // Filtrar apenas rotas que o usuário ainda não possui
      const rotasJaPossui = permissoesExistentes.map(p => p.idPath)
      const filtradas = rotasDisponiveis.filter(rota => 
        !rotasJaPossui.includes(rota.idPath) &&
        (rota.descricao.toLowerCase().includes(termo.toLowerCase()) ||
         rota.idPath.toLowerCase().includes(termo.toLowerCase()))
      )
      setRotasFiltradas(filtradas)
    }
  }

  // Inicializar dados quando o modal abrir
  useEffect(() => {
    if (showModal && editingUser?.cpf) {
      buscarPermissoesUsuario(editingUser.cpf)
      buscarRotasDisponiveis()
    }
  }, [showModal, editingUser])

  // Atualizar filtro quando permissões existentes mudarem
  useEffect(() => {
    if (termoBusca) {
      filtrarRotas(termoBusca)
    }
  }, [permissoesExistentes, rotasDisponiveis])

  const handlePermissaoChange = (idPath, acao, valor) => {
    setPermissoesExistentes(prev => 
      prev.map(permissao => 
        permissao.idPath === idPath 
          ? { ...permissao, [acao]: valor }
          : permissao
      )
    )
    
    // Marcar como modificada se não for uma permissão nova
    const permissao = permissoesExistentes.find(p => p.idPath === idPath)
    if (permissao && !permissao.isNew) {
      setPermissoesModificadas(prev => new Set([...prev, idPath]))
    }
  }

  const adicionarNovaPermissao = (rota) => {
    if (!editingUser?.cpf) {
      setError('CPF do usuário não encontrado')
      return
    }

    // Adicionar à lista de permissões pendentes
    const novaPermissao = {
      cpf: editingUser.cpf,
      idPath: rota.idPath,
      criar: false,
      atualizar: false,
      deletar: false,
      isNew: true // Marcar como nova permissão
    }
    
    setPermissoesExistentes(prev => [...prev, novaPermissao])
    setPermissoesAdicionadas(prev => [...prev, novaPermissao])
    setTermoBusca('')
    setRotasFiltradas([])
    setSuccessMessage('Permissão adicionada à lista. Clique em "Salvar Permissões" para confirmar.')
  }

  const handleClose = () => {
    setShowModal(false)
    setTermoBusca('')
    setError('')
    setSuccessMessage('')
    setPermissoesExistentes([])
    setRotasDisponiveis([])
    setRotasFiltradas([])
    setPermissoesAdicionadas([])
    setPermissoesParaRemover([])
    setPermissoesModificadas(new Set())
  }

  const handleSave = async () => {
    if (!editingUser?.cpf) {
      setError('CPF do usuário não encontrado')
      return
    }

    // Verificar se há mudanças pendentes
    const temMudancasPendentes = permissoesAdicionadas.length > 0 || 
                                permissoesParaRemover.length > 0 ||
                                permissoesModificadas.size > 0

    if (!temMudancasPendentes) {
      setSuccessMessage('Nenhuma mudança pendente para salvar.')
      return
    }

    setSaving(true)
    setError('')
    setSuccessMessage('')

    try {
      // 1. Primeiro, remover permissões marcadas para exclusão
      if (permissoesParaRemover.length > 0) {
        for (const permissao of permissoesParaRemover) {
          const payload = {
            cpf: editingUser.cpf,
            idPath: permissao.idPath
          }

          const response = await httpRequest('/deleteAcessosUser', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`
            },
            body: JSON.stringify(payload)
          })

          if (!response.ok) {
            throw new Error(`Erro ao remover permissão ${permissao.idPath}: ${response.status}`)
          }
        }
      }

      // 2. Salvar/atualizar todas as permissões existentes
      const permissoesParaSalvar = permissoesExistentes.filter(p => !permissoesParaRemover.includes(p))
      
      for (const permissao of permissoesParaSalvar) {
        const payload = {
          cpf: editingUser.cpf,
          idPath: permissao.idPath,
          post: permissao.criar,
          put: permissao.atualizar,
          delete: permissao.deletar
        }

        const response = await httpRequest('/postAcessosUser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`
          },
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          throw new Error(`Erro ao salvar permissão para ${permissao.idPath}: ${response.status}`)
        }
      }

      setSuccessMessage('Permissões atualizadas com sucesso!')
      
      // Limpar estados de mudanças pendentes
      setPermissoesAdicionadas([])
      setPermissoesParaRemover([])
      setPermissoesModificadas(new Set())
      
      // Recarregar dados atualizados
      setTimeout(() => {
        buscarPermissoesUsuario(editingUser.cpf)
        setSuccessMessage('')
      }, 2000)
      
    } catch (err) {
      setError('Erro ao salvar permissões: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const marcarParaRemocao = (permissao) => {
    // Adicionar à lista de remoção pendente
    setPermissoesParaRemover(prev => [...prev, permissao])
    
    // Remover da lista visual
    setPermissoesExistentes(prev => 
      prev.filter(p => p.idPath !== permissao.idPath)
    )
    
    // Se era uma permissão recém-adicionada, também remover da lista de adicionadas
    if (permissao.isNew) {
      setPermissoesAdicionadas(prev => 
        prev.filter(p => p.idPath !== permissao.idPath)
      )
    }
    
    setSuccessMessage('Permissão marcada para remoção. Clique em "Salvar Permissões" para confirmar.')
  }

  return (
    <>
      {/* Modal para edição de permissões de usuário */}
      <CModal visible={showModal} onClose={handleClose} size="lg">
        <CModalHeader>
          <CModalTitle>
            Gerenciar Permissões - {editingUser ? editingUser.nome : ''}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {error && (
            <CAlert color="danger" className="mb-3" dismissible onClose={() => setError('')}>
              {error}
            </CAlert>
          )}
          
          {successMessage && (
            <CAlert color="success" className="mb-3" dismissible onClose={() => setSuccessMessage('')}>
              {successMessage}
            </CAlert>
          )}
          
          <CRow className="mb-3">
            <CCol md={12}>
              <CInputGroup>
                <CFormInput
                  placeholder="Pesquise para adicionar nova permissão"
                  value={termoBusca}
                  onChange={(e) => filtrarRotas(e.target.value)}
                  disabled={loadingRotas}
                />
              </CInputGroup>
              {/* Lista de rotas filtradas para adicionar */}
              {rotasFiltradas.length > 0 && (
                <div className="mt-2 permissoes-search-results">
                  {rotasFiltradas.map((rota) => (
                    <div key={rota.idPath} className="d-flex justify-content-between align-items-center search-item">
                      <div>
                        <strong>{rota.descricao.charAt(0).toUpperCase() + rota.descricao.slice(1)}</strong>
                        <br />
                        <small className="text-muted">{rota.idPath}</small>
                      </div>
                      <CButton
                        color="success"
                        size="sm"
                        onClick={() => adicionarNovaPermissao(rota)}
                        disabled={saving}
                      >
                        <CIcon icon={cilPlus} className="me-1" />
                        Adicionar
                      </CButton>
                    </div>
                  ))}
                </div>
              )}
            </CCol>
          </CRow>
          
          <hr />
          
          <h6>Permissões Atuais</h6>
          
          {loading ? (
            <div className="text-center p-4">
              <CSpinner color="primary" />
              <p className="mt-2">Carregando permissões...</p>
            </div>
          ) : (
            <CTable hover responsive className="permissoes-table">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">Tela</CTableHeaderCell>
                  <CTableHeaderCell scope="col" className="text-center">Criar</CTableHeaderCell>
                  <CTableHeaderCell scope="col" className="text-center">Atualizar</CTableHeaderCell>
                  <CTableHeaderCell scope="col" className="text-center">Deletar</CTableHeaderCell>
                  <CTableHeaderCell scope="col" className="text-center">Ações</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {permissoesExistentes.map((permissao) => {
                  // Encontrar a descrição da rota
                  const rotaInfo = rotasDisponiveis.find(r => r.idPath === permissao.idPath)
                  const descricao = rotaInfo ? rotaInfo.descricao : permissao.idPath
                  
                  return (
                    <CTableRow key={permissao.idPath} className={permissao.isNew ? 'table-success' : ''}>
                      <CTableDataCell>
                        <div className="d-flex align-items-center">
                          <div>
                            <strong>{descricao.charAt(0).toUpperCase() + descricao.slice(1)}</strong>
                            <br />
                            <small className="text-muted">{permissao.idPath}</small>
                          </div>
                          {permissao.isNew && (
                            <span className="badge badge-nova-permissao ms-2">Nova</span>
                          )}
                        </div>
                      </CTableDataCell>
                      <CTableDataCell className="text-center align-middle">
                        <div className="d-flex justify-content-center">
                          <CFormSwitch
                            id={`criar-${permissao.idPath}`}
                            checked={permissao.criar}
                            onChange={(e) => handlePermissaoChange(permissao.idPath, 'criar', e.target.checked)}
                          />
                        </div>
                      </CTableDataCell>
                      <CTableDataCell className="text-center align-middle">
                        <div className="d-flex justify-content-center">
                          <CFormSwitch
                            id={`atualizar-${permissao.idPath}`}
                            checked={permissao.atualizar}
                            onChange={(e) => handlePermissaoChange(permissao.idPath, 'atualizar', e.target.checked)}
                          />
                        </div>
                      </CTableDataCell>
                      <CTableDataCell className="text-center align-middle">
                        <div className="d-flex justify-content-center">
                          <CFormSwitch
                            id={`deletar-${permissao.idPath}`}
                            checked={permissao.deletar}
                            onChange={(e) => handlePermissaoChange(permissao.idPath, 'deletar', e.target.checked)}
                          />
                        </div>
                      </CTableDataCell>
                      <CTableDataCell className="text-center align-middle">
                        <CButton
                          color="danger"
                          variant="ghost"
                          size="sm"
                          onClick={() => marcarParaRemocao(permissao)}
                          title="Remover esta permissão"
                        >
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  )
                })}
                {permissoesExistentes.length === 0 && !loading && (
                  <CTableRow>
                    <CTableDataCell colSpan={5} className="text-center text-muted">
                      Este usuário não possui permissões cadastradas
                    </CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={handleClose} disabled={saving}>
            Cancelar
          </CButton>
          <CButton 
            color="primary" 
            onClick={handleSave} 
            disabled={saving || loading}
          >
            {saving ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Salvando...
              </>
            ) : (
              <>
                Salvar Permissões
                {(permissoesAdicionadas.length > 0 || permissoesParaRemover.length > 0 || permissoesModificadas.size > 0) && (
                  <span className="badge bg-light text-dark ms-2">
                    {permissoesAdicionadas.length + permissoesParaRemover.length + permissoesModificadas.size} pendente(s)
                  </span>
                )}
              </>
            )}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default UsuarioPermissaoModal

