import React from 'react'
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilBell,
  cilCreditCard,
  cilCommentSquare,
  cilEnvelopeOpen,
  cilFile,
  cilLockLocked,
  cilSettings,
  cilTask,
  cilUser,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'

// Avatar dinâmico, não precisa importar imagem

const AppHeaderDropdown = () => {
  const nomeUsuario = localStorage.getItem('nomeUsuario') || '';
  const primeiraLetra = nomeUsuario.charAt(0).toUpperCase();
  const navigate = window.location ? null : undefined;
  const handleLogout = () => {
  localStorage.removeItem('nomeUsuario'); // Limpa nome do usuário
  window.location.href = '/login';
}

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0 d-flex align-items-center gap-2" caret={false}>
        {nomeUsuario && (
          <span
            style={{
              color: '#212529',
              fontWeight: '500',
              fontSize: 16,
              maxWidth: 180,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'inline-block',
              verticalAlign: 'middle',
            }}
            title={nomeUsuario}
          >
            {nomeUsuario}
          </span>
        )}
        <CAvatar size="md" style={{
          backgroundColor: '#90171B',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: 22,
          marginRight: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: '40px',
          height: 38,
          width: 38,
        }}>
          {primeiraLetra || <CIcon icon={cilUser} />}
        </CAvatar>
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownItem onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <CIcon icon={cilLockLocked} className="me-2" />
          Sair
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
