import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CCard,
  CCardBody,
  CRow,
  CCol
} from '@coreui/react';
import { treinamentos } from './treinamentos';

const aulasExemplo = [
  { titulo: 'Introdução', video: 'https://www.youtube.com/embed/ysz5S6PUM-U' },
  { titulo: 'Primeiros Passos', video: 'https://www.youtube.com/embed/ScMzIvxBSi4' },
  { titulo: 'Funcionalidades Avançadas', video: 'https://www.youtube.com/embed/jNQXAC9IVRw' },
];

const TreinamentoDetalhe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const treinamento = treinamentos[parseInt(id, 10)];
  const [aulaSelecionada, setAulaSelecionada] = React.useState(0);

  if (!treinamento) return <div className="p-5">Treinamento não encontrado.</div>;

  return (
    <div className="container-fluid py-4" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      <div className="mb-3">
        <button className="btn btn-link px-0" onClick={() => navigate('/treinamentos')} style={{ fontWeight: 600, color: '#c2001a', textDecoration: 'none' }}>
          &#8592; Voltar para treinamentos
        </button>
      </div>
      <CRow>
        <CCol md={3} className="mb-4 mb-md-0">
          <CCard className="h-100">
            <CCardBody>
              <h5 className="mb-4" style={{ fontWeight: 700 }}>Aulas</h5>
              <ul className="list-group">
                {aulasExemplo.map((aula, idx) => (
                  <li
                    key={idx}
                    className={`list-group-item list-group-item-action${aulaSelecionada === idx ? ' active' : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setAulaSelecionada(idx)}
                  >
                    {aula.titulo}
                  </li>
                ))}
              </ul>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={9}>
          <CCard className="h-100">
            <CCardBody>
              <h4 style={{ fontWeight: 700 }}>{treinamento.titulo}</h4>
              <div className="d-flex justify-content-between mb-3">
                <button
                  className="btn btn-outline-primary"
                  onClick={() => setAulaSelecionada((prev) => Math.max(prev - 1, 0))}
                  disabled={aulaSelecionada === 0}
                >
                  Voltar
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => setAulaSelecionada((prev) => Math.min(prev + 1, aulasExemplo.length - 1))}
                  disabled={aulaSelecionada === aulasExemplo.length - 1}
                >
                  Próximo
                </button>
              </div>
              <div className="ratio ratio-16x9 my-4">
                <iframe
                  src={aulasExemplo[aulaSelecionada].video}
                  title={aulasExemplo[aulaSelecionada].titulo}
                  allowFullScreen
                  style={{ border: 0, width: '100%', height: '100%' }}
                />
              </div>
              <div>{aulasExemplo[aulaSelecionada].titulo}</div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  );
};

export default TreinamentoDetalhe;
