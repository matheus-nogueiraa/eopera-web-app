import React from 'react'
import classNames from 'classnames'

import {
  CAvatar,
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CProgress,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cibCcAmex,
  cibCcApplePay,
  cibCcMastercard,
  cibCcPaypal,
  cibCcStripe,
  cibCcVisa,
  cibGoogle,
  cibFacebook,
  cibLinkedin,
  cifBr,
  cifEs,
  cifFr,
  cifIn,
  cifPl,
  cifUs,
  cibTwitter,
  cilCloudDownload,
  cilPeople,
  cilUser,
  cilUserFemale,
} from '@coreui/icons'

import avatar1 from 'src/assets/images/avatars/1.jpg'
import avatar2 from 'src/assets/images/avatars/2.jpg'
import avatar3 from 'src/assets/images/avatars/3.jpg'
import avatar4 from 'src/assets/images/avatars/4.jpg'
import avatar5 from 'src/assets/images/avatars/5.jpg'
import avatar6 from 'src/assets/images/avatars/6.jpg'


import WidgetsBrand from '../widgets/WidgetsBrand'
import WidgetsDropdown from '../widgets/WidgetsDropdown'
import MainChart from './MainChart'

// Exemplo de dados de ranking (substitua por dados reais do backend se necessário)
const rankingCursos = [
  { nome: 'João Silva', cursos: 12 },
  { nome: 'Maria Souza', cursos: 10 },
  { nome: 'Carlos Lima', cursos: 8 },
  { nome: 'Ana Paula', cursos: 7 },
  { nome: 'Lucas Rocha', cursos: 6 },
];

const Dashboard = () => {

  return (
    <>
      {/* Ranking de cursos assistidos */}
      <CCard className="mb-4">
        <CCardHeader style={{ fontWeight: 700, fontSize: 20 }}>Ranking de Cursos Assistidos</CCardHeader>
        <CCardBody>
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>Posição</th>
                  <th>Nome</th>
                  <th className="text-center">Cursos assistidos</th>
                </tr>
              </thead>
              <tbody>
                {rankingCursos.map((user, idx) => (
                  <tr key={user.nome} style={
                    idx === 0 ? { background: '#ffe082', fontWeight: 700 } :
                    idx === 1 ? { background: '#e0e0e0', fontWeight: 600 } :
                    idx === 2 ? { background: '#ffd180', fontWeight: 600 } :
                    {}
                  }>
                    <td style={{ fontSize: 22, textAlign: 'center' }}>
                      {idx === 0 && <span role="img" aria-label="ouro">🥇</span>}
                      {idx === 1 && <span role="img" aria-label="prata">🥈</span>}
                      {idx === 2 && <span role="img" aria-label="bronze">🥉</span>}
                      {idx > 2 && idx + 1}
                    </td>
                    <td>{user.nome}</td>
                    <td className="text-center" style={{ fontWeight: 700 }}>{user.cursos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CCardBody>
      </CCard>
    </>
  )
}

export default Dashboard
