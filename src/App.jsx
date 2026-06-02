import "./App.css";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function App() {
  const [dados, setDados] = useState({ listaCompleta: [], alunosCriticos: [] });
  const [clientes, setClientes] = useState(null);
  const [catraca, setCatraca] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [paginaGeral, setPaginaGeral] = useState(1);
  const [paginaCriticos, setPaginaCriticos] = useState(1);

  const tratarResposta = (data) => {
    if (Array.isArray(data)) {
      setDados({
        listaCompleta: data,
        alunosCriticos: data.filter(p => p.probabilidade >= 0.6)
      });
    } else {
      setDados({
        listaCompleta: data.listaCompleta || [],
        alunosCriticos: data.alunosCriticos || []
      });
    }
    setPaginaGeral(1);
    setPaginaCriticos(1);
  };

  const handleBuscaChange = (e) => {
    setBusca(e.target.value);
    setPaginaGeral(1);
    setPaginaCriticos(1);
  };

  const filtrarPorNome = (lista) => {
    return lista.filter(aluno =>
      aluno.nome.toLowerCase().includes(busca.toLowerCase())
    );
  };

  const alunosGeraisFiltrados = filtrarPorNome(dados.listaCompleta).sort((a, b) => b.probabilidade - a.probabilidade);
  const alunosCriticosFiltrados = filtrarPorNome(dados.alunosCriticos).sort((a, b) => b.probabilidade - a.probabilidade);

  const itensPorPagina = 10;

  const totalPaginasGeral = Math.ceil(alunosGeraisFiltrados.length / itensPorPagina);
  const alunosGeraisPaginados = alunosGeraisFiltrados.slice(
    (paginaGeral - 1) * itensPorPagina,
    paginaGeral * itensPorPagina
  );

  const totalPaginasCriticos = Math.ceil(alunosCriticosFiltrados.length / itensPorPagina);
  const alunosCriticosPaginados = alunosCriticosFiltrados.slice(
    (paginaCriticos - 1) * itensPorPagina,
    paginaCriticos * itensPorPagina
  );

  const totalAlto = alunosGeraisFiltrados.filter(p => p.probabilidade >= 0.7).length;
  const totalMedio = alunosGeraisFiltrados.filter(p => p.probabilidade >= 0.4 && p.probabilidade < 0.7).length;
  const totalBaixo = alunosGeraisFiltrados.filter(p => p.probabilidade < 0.4).length;

  const chartData = {
    labels: ["Alto Risco", "Risco Médio", "Fidelizado"],
    datasets: [{
      data: [totalAlto, totalMedio, totalBaixo],
      backgroundColor: ["#ef4444", "#f59e0b", "#10b981"],
      borderRadius: 6,
      barThickness: 40,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: "#f1f5f9" } }
    }
  };

  useEffect(() => {
    // Tenta carregar da API (proxy), se falhar usa o JSON local
    fetch("/api/dados")
      .then(res => res.json())
      .then(data => tratarResposta(data))
      .catch(() => {
        fetch("/dados.json")
          .then(res => res.json())
          .then(data => tratarResposta(data))
          .catch(() => setErro("Erro ao conectar com o servidor."));
      });
  }, []);

  const enviarArquivo = async () => {
    if (!clientes || !catraca) return;
    const formData = new FormData();
    formData.append("clientes", clientes);
    formData.append("catraca", catraca);
    try {
      setLoading(true);
      setErro("");
      const response = await fetch("https://api-powergym.onrender.com/upload", { method: "POST", body: formData });

      if (!response.ok) {
        let errMsg = "Falha no upload.";
        try {
          const errorData = await response.json();
          errMsg = errorData.error || errMsg;
        } catch (parseError) {
          // ignore JSON parsing errors
        }
        setErro(errMsg);
        return;
      }

      const data = await response.json();
      tratarResposta(data);
    } catch (e) {
      setErro("Falha no upload.");
    } finally {
      setLoading(false);
    }
  };

  const renderPagination = (paginaAtual, totalPaginas, setPagina) => {
    if (totalPaginas <= 1) return null;

    // Sliding window of max 5 pages
    let startPage = Math.max(1, paginaAtual - 2);
    let endPage = Math.min(totalPaginas, startPage + 4);

    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="pagination">
        <button
          className="pagination-btn"
          disabled={paginaAtual === 1}
          onClick={() => setPagina(paginaAtual - 1)}
        >
          &laquo;
        </button>
        {pages.map((p) => (
          <button
            key={p}
            className={`pagination-btn ${paginaAtual === p ? "active" : ""}`}
            onClick={() => setPagina(p)}
          >
            {p}
          </button>
        ))}
        <button
          className="pagination-btn"
          disabled={paginaAtual === totalPaginas}
          onClick={() => setPagina(paginaAtual + 1)}
        >
          &raquo;
        </button>
      </div>
    );
  };

  return (
    <div className="container">
      <header>
        <h1>PowerGrip</h1>
        <p>Monitoramento Preditivo de Evasão</p>
      </header>

      <section className="upload-section">
        <div className="upload-controls">
          <input
            type="file"
            id="fileInputClientes"
            accept=".csv, .xlsx, .xls"
            style={{ display: "none" }}
            onChange={(e) => setClientes(e.target.files[0] || null)}
          />
          <label htmlFor="fileInputClientes" className="btn-escolher">
            {clientes ? clientes.name : "Base de Clientes"}
          </label>

          <input
            type="file"
            id="fileInputCatraca"
            accept=".csv, .xlsx, .xls"
            style={{ display: "none" }}
            onChange={(e) => setCatraca(e.target.files[0] || null)}
          />
          <label htmlFor="fileInputCatraca" className="btn-escolher">
            {catraca ? catraca.name : "Planilha da Catraca"}
          </label>

          <button
            className="btn-enviar"
            onClick={enviarArquivo}
            disabled={loading || !clientes || !catraca}
          >
            {loading ? "Analisando..." : "Analisar Dados"}
          </button>
        </div>
        {erro && <p style={{ color: 'red', marginTop: '10px' }}>{erro}</p>}
      </section>

      <div className="cards-grid">
        <div className="card card-alto"><span className="label">Alto Risco</span><p className="value">{totalAlto}</p></div>
        <div className="card card-medio"><span className="label">Médio Risco</span><p className="value">{totalMedio}</p></div>
        <div className="card card-baixo"><span className="label">Seguros</span><p className="value">{totalBaixo}</p></div>
      </div>

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Buscar aluno por nome..."
          value={busca}
          onChange={handleBuscaChange}
        />
      </div>

      <div className="dashboard-content">
        <div className="side-panel">
          <div className="criticos-box">
            <h3 className="section-title">Alunos em Risco</h3>
            <div className="criticos-list">
              {alunosCriticosPaginados.length > 0 ? (
                alunosCriticosPaginados.map((aluno, i) => (
                  <div key={i} className="critico-item">
                    <span className="aluno-nome-critico">{aluno.nome}</span>
                    <span className="aluno-perc-critico">{(aluno.probabilidade * 100).toFixed(1)}%</span>
                  </div>
                ))
              ) : (
                <p style={{ color: '#a3aed0', fontSize: '14px' }}>Sem alertas críticos.</p>
              )}
            </div>
            {renderPagination(paginaCriticos, totalPaginasCriticos, setPaginaCriticos)}
          </div>

          <div className="chart-box">
            <h3 className="section-title">Distribuição Visual</h3>
            <div style={{ height: "250px" }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="main-panel">
          <h3 className="section-title">Lista Geral de Alunos</h3>
          <table className="modern-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Probabilidade</th>
                <th>Status</th>
                <th style={{ textAlign: "center" }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {alunosGeraisPaginados.map((p, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 700 }}>{p.nome}</td>
                  <td>{(p.probabilidade * 100).toFixed(1)}%</td>
                  <td>
                    <span className={`status-pill ${p.probabilidade >= 0.7 ? "alto" : p.probabilidade >= 0.4 ? "medio" : "baixo"}`}>
                      {p.probabilidade >= 0.7 ? "Crítico" : p.probabilidade >= 0.4 ? "Atenção" : "Estável"}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button className="btn-contato" onClick={() => window.open(`https://wa.me/55?text=Olá ${p.nome}!`)}>
                      Contato
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {renderPagination(paginaGeral, totalPaginasGeral, setPaginaGeral)}
        </div>
      </div>
    </div>
  );
}

export default App;
