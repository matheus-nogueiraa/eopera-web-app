import React, { createContext, useContext } from 'react'
import { usePermissoes } from '../hooks/usePermissoes'

const PermissoesContext = createContext()

export const PermissoesProvider = ({ children }) => {
  const permissoesData = usePermissoes()
  
  return (
    <PermissoesContext.Provider value={permissoesData}>
      {children}
    </PermissoesContext.Provider>
  )
}

export const usePermissoesContext = () => {
  const context = useContext(PermissoesContext)
  if (!context) {
    throw new Error('usePermissoesContext deve ser usado dentro de um PermissoesProvider')
  }
  return context
}

// Hook personalizado para verificar permissões específicas
export const usePermissaoRota = (rota) => {
  const { verificarPermissaoRota } = usePermissoesContext()
  return verificarPermissaoRota(rota)
}

// Hook para verificar permissões CRUD
export const usePermissoesCRUD = (rota) => {
  const { temPermissaoPost, temPermissaoPut, temPermissaoDelete } = usePermissoesContext()
  
  return {
    podeAdicionar: temPermissaoPost(rota),
    podeEditar: temPermissaoPut(rota),
    podeDeletar: temPermissaoDelete(rota)
  }
}
