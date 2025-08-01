import React, { useState, useEffect, useRef } from 'react';
import { CModal, CModalHeader, CModalTitle, CModalBody, CButton } from '@coreui/react';


// Exemplo de perguntas dinâmicas
const perguntas = [
  {
    id: 1,
    tipo: 'unica',
    pergunta: 'Qual a capital do Brasil?',
    alternativas: [
      'Rio de Janeiro',
      'Brasília',
      'São Paulo',
      'Salvador',
    ],
    resposta: [1], // Brasília
  },
  {
    id: 2,
    tipo: 'multipla',
    pergunta: 'Quais são linguagens de programação?',
    alternativas: [
      'HTML',
      'Python',
      'CSS',
      'JavaScript',
    ],
    resposta: [1, 3], // Python, JavaScript
  },
  {
    id: 3,
    tipo: 'unica',
    pergunta: 'React é um...',
    alternativas: [
      'Framework',
      'Biblioteca',
      'Sistema Operacional',
      'Banco de Dados',
    ],
    resposta: [1], // Biblioteca
  },
  {
    id: 4,
    tipo: 'multipla',
    pergunta: 'Quais dessas são frutas?',
    alternativas: [
      'Maçã',
      'Cenoura',
      'Banana',
      'Batata',
    ],
    resposta: [0, 2], // Maçã, Banana
  },
  // ...adicione até 10 perguntas
];

const Prova = ({ visible }) => {
  // Estado para respostas do usuário
  const [respostas, setRespostas] = useState({});
  const [enviado, setEnviado] = useState(false);
  const [confirmarEnvio, setConfirmarEnvio] = useState(false);
  const [indicePergunta, setIndicePergunta] = useState(0);
  const [iniciada, setIniciada] = useState(false);
  const [tempoRestante, setTempoRestante] = useState(50 * 60); // 50 minutos em segundos
  const timerRef = useRef(null);
  // Inicia o timer ao começar a prova
  useEffect(() => {
    if (iniciada && !enviado) {
      timerRef.current = setInterval(() => {
        setTempoRestante((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setEnviado(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [iniciada, enviado]);

  // Reseta timer ao fechar
  useEffect(() => {
    if (!visible) {
      setTempoRestante(50 * 60);
    }
  }, [visible]);

  const perguntaAtual = perguntas[indicePergunta];
  const totalPerguntas = perguntas.length;
  const ultimaPergunta = indicePergunta === totalPerguntas - 1;

  const handleChange = (id, idx, tipo) => {
    setRespostas((prev) => {
      if (tipo === 'unica') {
        return { ...prev, [id]: [idx] };
      } else {
        // multipla escolha
        const atual = prev[id] || [];
        if (atual.includes(idx)) {
          return { ...prev, [id]: atual.filter((i) => i !== idx) };
        } else {
          return { ...prev, [id]: [...atual, idx] };
        }
      }
    });
  };

  const podeAvancar = () => {
    const resp = respostas[perguntaAtual.id];
    if (!resp || resp.length === 0) return false;
    return true;
  };

  const handleAvancar = (e) => {
    e.preventDefault();
    if (!podeAvancar()) return;
    if (ultimaPergunta) {
      setConfirmarEnvio(true);
    } else {
      setIndicePergunta((prev) => prev + 1);
    }
  };

  const handleConfirmarEnvio = () => {
    setConfirmarEnvio(false);
    setEnviado(true);
    // Aqui você pode enviar as respostas para o backend ou processar como quiser
  };

  const handleCancelarEnvio = () => {
    setConfirmarEnvio(false);
  };

  const handleVoltar = () => {
    setIndicePergunta((prev) => Math.max(prev - 1, 0));
  };

  const handleFechar = () => {
    if (iniciada && !enviado) return; // Bloqueia fechar durante a prova
    setIndicePergunta(0);
    setRespostas({});
    setEnviado(false);
    setIniciada(false);
    setTempoRestante(50 * 60);
  };

  return (
    <CModal
      visible={visible}
      fullscreen
      alignment="center"
      className="modal-fullscreen-sm-down"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      backdrop={iniciada && !enviado ? 'static' : true}
      keyboard={!iniciada || enviado}
    >
      <CModalHeader className="border-0" style={{ justifyContent: 'center', background: 'transparent', position: 'relative' }}>
        <CModalTitle style={{ fontWeight: 700, fontSize: 28 }}>Prova</CModalTitle>
      </CModalHeader>
      <CModalBody
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8f9fa',
        }}
      >
        <div style={{
          width: '100%',
          maxWidth: 700,
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 2px 24px 0 rgba(0,0,0,0.10)',
          padding: 40,
          margin: '0 auto',
        }}>
          {!iniciada ? (
            <div className="text-center">
              <h4 className="mb-4" style={{ fontWeight: 700 }}>Instruções para a prova</h4>
              <p className="mb-4" style={{ fontSize: 18 }}>
                Ao iniciar a prova, você deverá responder todas as questões em sequência, sem fechar ou sair da tela.<br/>
                O tempo é limitado e não será possível pausar ou retornar após o envio.<br/>
                Leia atentamente cada questão antes de avançar.<br/>
                <span style={{ color: '#c00', fontWeight: 600 }}>Após iniciar, não será possível fechar a prova até o envio das respostas.</span>
              </p>
              <div className="d-flex justify-content-center gap-3">
                <CButton color="secondary" size="lg" onClick={handleFechar}>
                  Voltar
                </CButton>
                <CButton color="primary" size="lg" onClick={() => setIniciada(true)}>
                  Iniciar prova
                </CButton>
              </div>
            </div>
          ) : !enviado ? (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4" style={{ minHeight: 32 }}>
                <div style={{ fontWeight: 600, fontSize: 18, color: '#555' }}>
                  Tempo restante: <span style={{ color: tempoRestante < 60 ? '#c00' : '#222', fontWeight: 700 }}>
                    {String(Math.floor(tempoRestante / 60)).padStart(2, '0')}:{String(tempoRestante % 60).padStart(2, '0')}
                  </span>
                </div>
                <div style={{ fontWeight: 600, fontSize: 18, color: '#555', textAlign: 'right' }}>
                  {indicePergunta + 1} de {totalPerguntas}
                </div>
              </div>
              <form onSubmit={handleAvancar}>
                <div className="mb-4">
                  <div style={{ fontWeight: 700, marginBottom: 18, fontSize: 18, textAlign: 'center' }}>
                    {perguntaAtual.pergunta}
                  </div>
                  <div>
                    {perguntaAtual.alternativas.map((alt, i) => (
                      <div key={i} className="form-check mb-2" style={{ fontSize: 16 }}>
                        <input
                          className="form-check-input"
                          type={perguntaAtual.tipo === 'unica' ? 'radio' : 'checkbox'}
                          name={`pergunta_${perguntaAtual.id}`}
                          id={`pergunta_${perguntaAtual.id}_alt_${i}`}
                          checked={respostas[perguntaAtual.id]?.includes(i) || false}
                          onChange={() => handleChange(perguntaAtual.id, i, perguntaAtual.tipo)}
                          style={{ cursor: 'pointer' }}
                        />
                        <label className="form-check-label ms-2" htmlFor={`pergunta_${perguntaAtual.id}_alt_${i}`} style={{ cursor: 'pointer' }}>
                          {alt}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="d-flex justify-content-between mt-4">
                  <CButton color="secondary" type="button" onClick={handleFechar()} disabled={indicePergunta === 0}>
                    Voltar
                  </CButton>
                  <CButton color="primary" type="submit" disabled={!podeAvancar()}>
                    {ultimaPergunta ? 'Enviar respostas' : 'Próxima'}
                  </CButton>
                </div>
              </form>
            </>
          ) : (
            <>
              {/* Cálculo de acertos */}
              {(() => {
                let acertos = 0;
                const total = perguntas.length;
                const resultadoQuestoes = perguntas.map((q) => {
                  const userResp = (respostas[q.id] || []).sort();
                  const correta = (q.resposta || []).sort();
                  const acertou = userResp.length === correta.length && userResp.every((v, i) => v === correta[i]);
                  if (acertou) acertos++;
                  return { ...q, acertou, userResp };
                });
                const percentual = Math.round((acertos / total) * 100);
                return (
                  <>
                    <div className={`alert mt-3 text-center ${percentual >= 70 ? 'alert-success' : 'alert-danger'}`} style={{ fontSize: 18, borderRadius: 12 }}>
                      {percentual >= 70
                        ? `Parabéns! Você acertou ${percentual}% da prova e pode emitir o certificado.`
                        : `Você acertou ${percentual}% da prova. Para emitir o certificado é necessário pelo menos 70%.`}
                    </div>
                    <div className="mt-4">
                      <h5 className="mb-3" style={{ fontWeight: 700 }}>Suas respostas:</h5>
                      <ol>
                        {resultadoQuestoes.map((q, idx) => (
                          <li key={q.id} className="mb-3">
                            <div style={{ fontWeight: 600 }}>
                              {q.pergunta}
                              {q.acertou ? (
                                <span style={{ color: '#28a745', fontWeight: 700, marginLeft: 8 }}>[Acertou]</span>
                              ) : (
                                <span style={{ color: '#c00', fontWeight: 700, marginLeft: 8 }}>[Errou]</span>
                              )}
                            </div>
                            <div style={{ fontSize: 15 }}>
                              <span style={{ fontWeight: 500 }}>Sua resposta:</span>
                              <ul style={{ listStyle: 'none', paddingLeft: 0, marginBottom: 0 }}>
                                {q.userResp.length > 0 ? q.userResp.map((altIdx) => (
                                  <li key={altIdx} style={{ color: q.acertou ? '#28a745' : '#c00', fontWeight: 500 }}>
                                    {q.alternativas[altIdx]}
                                  </li>
                                )) : <li style={{ color: '#c00' }}>Não respondeu</li>}
                              </ul>
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                    {percentual >= 70 && (
                      <div style={{
                        position: 'fixed',
                        right: 32,
                        bottom: 32,
                        zIndex: 9999,
                      }}>
                        <CButton color="success" size="lg" style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)' }}>
                          Emitir certificado
                        </CButton>
                      </div>
                    )} {
                      <CButton color="secondary" className="mt-4" onClick={handleVoltar}>
                        Voltar para o início
                      </CButton>
                    }
                  </>
                );
              })()}
            </>
          )}
      {/* Modal de confirmação de envio */}
      {confirmarEnvio && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.3)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, maxWidth: 350, boxShadow: '0 2px 16px 0 rgba(0,0,0,0.15)' }}>
            <h5 className="mb-3" style={{ fontWeight: 700 }}>Confirmar envio</h5>
            <p className="mb-4">Deseja realmente enviar suas respostas? Após o envio não será possível alterar.</p>
            <div className="d-flex justify-content-end gap-2">
              <CButton color="secondary" onClick={handleCancelarEnvio}>Cancelar</CButton>
              <CButton color="primary" onClick={handleConfirmarEnvio}>Enviar</CButton>
            </div>
          </div>
        </div>
      )}
        </div>
      </CModalBody>
    </CModal>
  );
};

export default Prova;
