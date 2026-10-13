import { useState } from "react";
import ExpenseForm from "../components/ExpenseForm";
import { formatCurrency } from "../data/dashboardData";
import { supabase } from "../supabaseClient";

const carregarOrcamentos = (chave) => {
  try {
    const guardados = window.localStorage.getItem(chave);
    const valores = guardados ? JSON.parse(guardados) : {};
    return valores && typeof valores === "object" && !Array.isArray(valores)
      ? valores
      : {};
  } catch {
    return {};
  }
};

function Dashboard({
  userId,
  categorias,
  despesasFiltradas,
  despesasDoPeriodo,
  total,
  totalCategoria,
  categoriaAtiva,
  setCategoriaAtiva,
  meses,
  mesSelecionado,
  setMesSelecionado,
  anoSelecionado,
  setAnoSelecionado,
  anosDisponiveis,
  adicionarDespesa,
  eliminarDespesa,
  temaEscuro,
  setTemaEscuro,
  resumoMensal,
  paginaAtiva,
  setPaginaAtiva,
}) {
  const [categoriaEstatisticas, setCategoriaEstatisticas] = useState("Todas");
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const chaveOrcamentos = `orcamentos:${userId}:${anoSelecionado}-${mesSelecionado + 1}`;
  const [orcamentosEditados, setOrcamentosEditados] = useState(() => ({
    chave: chaveOrcamentos,
    valores: carregarOrcamentos(chaveOrcamentos),
  }));
  const [estadoOrcamentos, setEstadoOrcamentos] = useState({ chave: "", texto: "" });
  const orcamentos = orcamentosEditados.chave === chaveOrcamentos
    ? orcamentosEditados.valores
    : carregarOrcamentos(chaveOrcamentos);
  const mensagemOrcamentos = estadoOrcamentos.chave === chaveOrcamentos
    ? estadoOrcamentos.texto
    : "";

  const terminarSessao = async () => {
    await supabase.auth.signOut();
  };

  const navegarNoMenu = (pagina) => {
    setPaginaAtiva(pagina);
    setMenuMobileAberto(false);
  };

  const mediaDiaria =
    despesasFiltradas.length > 0
      ? totalCategoria / new Date(anoSelecionado, mesSelecionado + 1, 0).getDate()
      : 0;

  const gastosPorCategoria = {};

  despesasFiltradas.forEach((despesa) => {
    const categoria = despesa.categoria || "Outros";

    gastosPorCategoria[categoria] =
      (gastosPorCategoria[categoria] || 0) + Number(despesa.valor);
  });

  const despesasEstatisticas = categoriaEstatisticas === "Todas"
    ? despesasDoPeriodo
    : despesasDoPeriodo.filter(
        (despesa) => (despesa.categoria || "Outros") === categoriaEstatisticas
      );
  const gastosEstatisticasPorCategoria = {};

  despesasEstatisticas.forEach((despesa) => {
    const categoria = despesa.categoria || "Outros";
    gastosEstatisticasPorCategoria[categoria] =
      (gastosEstatisticasPorCategoria[categoria] || 0) + Number(despesa.valor);
  });

  const categoriaPrincipal = Object.entries(gastosPorCategoria).sort(
    (a, b) => b[1] - a[1]
  )[0];

  const maiorGastoMensal = Math.max(...resumoMensal.map((item) => item.total), 0);
  const mesAtualResumo = resumoMensal[resumoMensal.length - 1];
  const mesAnteriorResumo = resumoMensal[resumoMensal.length - 2];
  const variacaoMensal = mesAnteriorResumo?.total > 0
    ? ((mesAtualResumo.total - mesAnteriorResumo.total) / mesAnteriorResumo.total) * 100
    : null;
  const textoVariacao = variacaoMensal === null
    ? mesAtualResumo?.total > 0 ? "Sem registo anterior" : "0%"
    : `${variacaoMensal > 0 ? "+" : ""}${variacaoMensal.toLocaleString("pt-PT", { maximumFractionDigits: 1 })}%`;
  const classeVariacao = variacaoMensal > 0
    ? "is-negative"
    : variacaoMensal < 0 ? "is-positive" : "is-neutral";
  const dataMesAnterior = new Date(anoSelecionado, mesSelecionado - 1, 1);
  const mediaPorDespesa = despesasDoPeriodo.length > 0
    ? total / despesasDoPeriodo.length
    : 0;
  const gastosDoPeriodoPorCategoria = {};

  despesasDoPeriodo.forEach((despesa) => {
    const categoria = despesa.categoria || "Outros";
    gastosDoPeriodoPorCategoria[categoria] =
      (gastosDoPeriodoPorCategoria[categoria] || 0) + Number(despesa.valor);
  });

  const categoriaPrincipalResumo = Object.entries(gastosDoPeriodoPorCategoria).sort(
    (a, b) => b[1] - a[1]
  )[0];
  const guardarOrcamentos = (event) => {
    event.preventDefault();

    try {
      window.localStorage.setItem(chaveOrcamentos, JSON.stringify(orcamentos));
      setEstadoOrcamentos({ chave: chaveOrcamentos, texto: "Orçamentos guardados." });
    } catch {
      setEstadoOrcamentos({
        chave: chaveOrcamentos,
        texto: "Não foi possível guardar os orçamentos neste browser.",
      });
    }
  };
  const titulosPagina = {
    dashboard: "Dashboard",
    resumo: "Resumo financeiro",
    despesas: "Despesas",
    estatisticas: "Estatísticas",
    categorias: "Categorias",
    orcamentos: "Orçamentos",
  };

  const renderConteudo = () => {
    if (paginaAtiva === "resumo") {
      return (
        <>
          <section className="stats-grid summary-metrics" aria-label="Indicadores do período">
            <div className="stat-card">
              <div className="stat-header">
                <span>Total no mês</span>
                <div className="stat-icon">€</div>
              </div>
              <strong>{formatCurrency(total)}</strong>
              <small>{meses[mesSelecionado]} {anoSelecionado}</small>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span>Despesas</span>
                <div className="stat-icon">↗</div>
              </div>
              <strong>{despesasDoPeriodo.length}</strong>
              <small>registadas neste mês</small>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span>Média por despesa</span>
                <div className="stat-icon">Ø</div>
              </div>
              <strong>{formatCurrency(mediaPorDespesa)}</strong>
              <small>valor médio registado</small>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span>Variação mensal</span>
                <div className="stat-icon">%</div>
              </div>
              <strong className={`summary-change ${classeVariacao}`}>{textoVariacao}</strong>
              <small>vs. {meses[dataMesAnterior.getMonth()]} {dataMesAnterior.getFullYear()}</small>
            </div>
          </section>

          <section className="dashboard-card summary-card" id="resumo">
            <div className="card-heading">
              <div>
                <h2>Evolução dos gastos</h2>
                <p>Comparação dos últimos seis meses.</p>
              </div>
            </div>

            <div className="summary-grid">
              <div className="summary-highlight">
                <span>Maior categoria</span>
                <strong>
                  {categoriaPrincipalResumo ? categoriaPrincipalResumo[0] : "Sem dados"}
                </strong>
                <small>
                  {categoriaPrincipalResumo
                    ? `${formatCurrency(categoriaPrincipalResumo[1])} · ${total > 0 ? ((categoriaPrincipalResumo[1] / total) * 100).toFixed(0) : 0}% dos gastos`
                    : "Ainda não há despesas"}
                </small>
              </div>

              <div className="summary-trend">
                {resumoMensal.map((item) => (
                  <div key={`${item.label}-${item.total}`} className="trend-item">
                    <span>{item.label}</span>
                    <div className="trend-bar">
                      <div
                        className={`trend-fill ${item.total === 0 ? "is-empty" : ""}`}
                        style={{
                          height: `${maiorGastoMensal > 0 ? (item.total / maiorGastoMensal) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <strong>{formatCurrency(item.total)}</strong>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      );
    }

    if (paginaAtiva === "despesas") {
      return (
        <>
          <section className="dashboard-card expense-form-section" id="expense-form">
            <div className="card-heading">
              <div>
                <h2>Adicionar despesa</h2>
                <p>Regista uma nova despesa.</p>
              </div>
            </div>

            <ExpenseForm onAddExpense={adicionarDespesa} />
          </section>

          <section className="dashboard-card" id="despesas">
            <div className="card-heading">
              <div>
                <h2>Despesas recentes</h2>
                <p>
                  {despesasDoPeriodo.length}{" "}
                  {despesasDoPeriodo.length === 1 ? "despesa" : "despesas"}
                </p>
              </div>

              <strong>{formatCurrency(total)}</strong>
            </div>

            <div className="expenses">
              {despesasDoPeriodo.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">📭</div>
                  <h3>Nenhuma despesa</h3>
                  <p>Não existem despesas neste período.</p>
                </div>
              ) : (
                despesasDoPeriodo.map((despesa) => {
                  const categoria = categorias.find(
                    (item) => item.nome === (despesa.categoria || "Outros")
                  );

                  return (
                    <div className="expense-card" key={despesa.id}>
                      <div className="expense-icon">{categoria?.icone || "📦"}</div>

                      <div className="expense-info">
                        <h3>{despesa.descricao}</h3>
                        <p>
                          {categoria?.nome || "Outros"}
                          {" • "}
                          {new Date(despesa.created_at).toLocaleDateString("pt-PT")}
                        </p>
                      </div>

                      <div className="expense-value">
                        <strong>{formatCurrency(despesa.valor)}</strong>

                        <button
                          className="delete-button"
                          onClick={() => eliminarDespesa(despesa.id)}
                          title="Eliminar despesa"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </>
      );
    }

    if (paginaAtiva === "categorias") {
      return (
        <>
          <section className="dashboard-card" id="categorias">
            <div className="card-heading">
              <div>
                <h2>Categorias</h2>
                <p>Filtra as tuas despesas por categoria.</p>
              </div>

              <strong>{formatCurrency(totalCategoria)}</strong>
            </div>

            <div className="categories">
              {categorias.map((categoria) => (
                <button
                  key={categoria.nome}
                  className={
                    categoriaAtiva === categoria.nome ? "category active" : "category"
                  }
                  onClick={() => setCategoriaAtiva(categoria.nome)}
                >
                  <span>{categoria.icone}</span>
                  {categoria.nome}
                </button>
              ))}
            </div>
          </section>

          <section className="dashboard-card">
            <div className="card-heading">
              <div>
                <h2>Distribuição por categoria</h2>
                <p>Onde estás a gastar mais.</p>
              </div>
            </div>

            <div className="category-bars">
              {Object.entries(gastosPorCategoria)
                .sort((a, b) => b[1] - a[1])
                .map(([categoria, valor]) => {
                  const percentagem =
                    totalCategoria > 0 ? (valor / totalCategoria) * 100 : 0;

                  const categoriaInfo = categorias.find((item) => item.nome === categoria);

                  return (
                    <div className="category-bar-item" key={categoria}>
                      <div className="bar-info">
                        <span>
                          {categoriaInfo?.icone || "📦"} {categoria}
                        </span>

                        <strong>{formatCurrency(valor)}</strong>
                      </div>

                      <div className="bar">
                        <div
                          className="bar-fill"
                          style={{ width: `${percentagem}%` }}
                        />
                      </div>

                      <small>{percentagem.toFixed(0)}%</small>
                    </div>
                  );
                })}

              {Object.keys(gastosPorCategoria).length === 0 && (
                <div className="empty">Ainda não existem despesas neste período.</div>
              )}
            </div>
          </section>
        </>
      );
    }

    if (paginaAtiva === "estatisticas") {
      return (
        <>
          <section className="dashboard-card filters-card">
            <div className="filters-title">
              <div>
                <h2>Período</h2>
                <p>Escolhe o período que queres consultar.</p>
              </div>
            </div>

            <div className="dashboard-filters statistics-filters">
              <div className="filter">
                <label>Ano</label>

                <select
                  value={anoSelecionado}
                  onChange={(event) => setAnoSelecionado(Number(event.target.value))}
                >
                  {anosDisponiveis.map((ano) => (
                    <option key={ano} value={ano}>
                      {ano}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter">
                <label>Mês</label>

                <select
                  value={mesSelecionado}
                  onChange={(event) => setMesSelecionado(Number(event.target.value))}
                >
                  {meses.map((mes, index) => (
                    <option key={mes} value={index}>
                      {mes}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter">
                <label>Categoria</label>
                <select
                  value={categoriaEstatisticas}
                  onChange={(event) => setCategoriaEstatisticas(event.target.value)}
                >
                  <option value="Todas">Todas as categorias</option>
                  {categorias
                    .filter((categoria) => categoria.nome !== "Todas")
                    .map((categoria) => (
                      <option key={categoria.nome} value={categoria.nome}>
                        {categoria.nome}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </section>

          <section className="dashboard-card">
            <div className="card-heading">
              <div>
                <h2>Distribuição por categoria</h2>
                <p>
                  {categoriaEstatisticas === "Todas"
                    ? "Onde estás a gastar mais."
                    : `Peso de ${categoriaEstatisticas} no total do período.`}
                </p>
              </div>
            </div>

            <div className="category-bars">
              {Object.entries(gastosEstatisticasPorCategoria)
                .sort((a, b) => b[1] - a[1])
                .map(([categoria, valor]) => {
                  const percentagem = total > 0 ? (valor / total) * 100 : 0;

                  const categoriaInfo = categorias.find((item) => item.nome === categoria);

                  return (
                    <div className="category-bar-item" key={categoria}>
                      <div className="bar-info">
                        <span>
                          {categoriaInfo?.icone || "📦"} {categoria}
                        </span>

                        <strong>{formatCurrency(valor)}</strong>
                      </div>

                      <div className="bar">
                        <div
                          className="bar-fill"
                          style={{ width: `${percentagem}%` }}
                        />
                      </div>

                      <small>{percentagem.toFixed(0)}%</small>
                    </div>
                  );
                })}

              {Object.keys(gastosEstatisticasPorCategoria).length === 0 && (
                <div className="empty">
                  {categoriaEstatisticas === "Todas"
                    ? "Ainda não existem despesas neste período."
                    : `Não existem despesas em ${categoriaEstatisticas} neste período.`}
                </div>
              )}
            </div>
          </section>
        </>
      );
    }

    if (paginaAtiva === "orcamentos") {
      return (
        <>
          <section className="dashboard-card filters-card">
            <div className="filters-title">
              <div>
                <h2>Período do orçamento</h2>
                <p>Define limites para {meses[mesSelecionado]} de {anoSelecionado}.</p>
              </div>
            </div>

            <div className="dashboard-filters">
              <div className="filter">
                <label htmlFor="budget-year">Ano</label>
                <select
                  id="budget-year"
                  value={anoSelecionado}
                  onChange={(event) => setAnoSelecionado(Number(event.target.value))}
                >
                  {anosDisponiveis.map((ano) => (
                    <option key={ano} value={ano}>{ano}</option>
                  ))}
                </select>
              </div>

              <div className="filter">
                <label htmlFor="budget-month">Mês</label>
                <select
                  id="budget-month"
                  value={mesSelecionado}
                  onChange={(event) => setMesSelecionado(Number(event.target.value))}
                >
                  {meses.map((mes, index) => (
                    <option key={mes} value={index}>{mes}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="dashboard-card budget-card">
            <div className="card-heading">
              <div>
                <h2>Limites por categoria</h2>
                <p>Define quanto pretendes gastar em cada categoria.</p>
              </div>
            </div>

            <form className="budget-form" onSubmit={guardarOrcamentos}>
              <div className="budget-list">
                {categorias
                  .filter((categoria) => categoria.nome !== "Todas")
                  .map((categoria) => {
                    const gasto = gastosDoPeriodoPorCategoria[categoria.nome] || 0;
                    const limite = Number(orcamentos[categoria.nome]) || 0;
                    const percentagem = limite > 0 ? (gasto / limite) * 100 : 0;
                    const acimaDoLimite = limite > 0 && gasto > limite;
                    const idCampo = `budget-${categoria.nome}`;

                    return (
                      <div
                        className={`budget-row ${acimaDoLimite ? "is-over-budget" : ""}`}
                        key={categoria.nome}
                      >
                        <div className="budget-category">
                          <div className="budget-category-heading">
                            <span className="budget-category-name">
                              <span>{categoria.icone}</span>
                              {categoria.nome}
                            </span>
                            <strong>
                              {formatCurrency(gasto)}
                              <small> / {limite > 0 ? formatCurrency(limite) : "Sem limite"}</small>
                            </strong>
                          </div>
                          <div
                            className="budget-progress"
                            role="progressbar"
                            aria-label={`Gasto em ${categoria.nome}`}
                            aria-valuenow={Math.min(Math.round(percentagem), 100)}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          >
                            <div
                              className="budget-progress-fill"
                              style={{ width: `${Math.min(percentagem, 100)}%` }}
                            />
                          </div>
                          {acimaDoLimite && (
                            <small className="budget-warning">
                              Ultrapassaste o limite em {formatCurrency(gasto - limite)}.
                            </small>
                          )}
                        </div>

                        <div className="budget-input">
                          <label htmlFor={idCampo}>Limite mensal</label>
                          <div className="budget-input-control">
                            <input
                              id={idCampo}
                              type="number"
                              min="0"
                              step="0.01"
                              inputMode="decimal"
                              placeholder="0,00"
                              value={orcamentos[categoria.nome] ?? ""}
                              onChange={(event) => {
                                setOrcamentosEditados({
                                  chave: chaveOrcamentos,
                                  valores: {
                                    ...orcamentos,
                                    [categoria.nome]: event.target.value,
                                  },
                                });
                                setEstadoOrcamentos({ chave: chaveOrcamentos, texto: "" });
                              }}
                            />
                            <span>€</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="budget-actions">
                <p aria-live="polite">
                  {mensagemOrcamentos || "Os valores ficam guardados neste dispositivo."}
                </p>
                <button type="submit" className="add-expense-button">
                  Guardar orçamento
                </button>
              </div>
            </form>
          </section>
        </>
      );
    }

    return (
      <>
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <span>Total gasto</span>
              <div className="stat-icon">€</div>
            </div>

            <strong>{formatCurrency(total)}</strong>
            <small>
              {meses[mesSelecionado]} {anoSelecionado}
            </small>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>Despesas</span>
              <div className="stat-icon">↗</div>
            </div>

            <strong>{despesasFiltradas.length}</strong>
            <small>neste período</small>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>Média diária</span>
              <div className="stat-icon">◷</div>
            </div>

            <strong>{formatCurrency(mediaDiaria)}</strong>
            <small>por dia</small>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>Maior categoria</span>
              <div className="stat-icon">⌁</div>
            </div>

            <strong className="category-stat">
              {categoriaPrincipal ? categoriaPrincipal[0] : "—"}
            </strong>
            <small>
              {categoriaPrincipal
                ? formatCurrency(categoriaPrincipal[1])
                : "Sem despesas"}
            </small>
          </div>
        </section>

        <section className="dashboard-card filters-card">
          <div className="filters-title">
            <div>
              <h2>Período</h2>
              <p>Escolhe o período que queres consultar.</p>
            </div>
          </div>

          <div className="dashboard-filters">
            <div className="filter">
              <label>Ano</label>

              <select
                value={anoSelecionado}
                onChange={(event) => setAnoSelecionado(Number(event.target.value))}
              >
                {anosDisponiveis.map((ano) => (
                  <option key={ano} value={ano}>
                    {ano}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter">
              <label>Mês</label>

              <select
                value={mesSelecionado}
                onChange={(event) => setMesSelecionado(Number(event.target.value))}
              >
                {meses.map((mes, index) => (
                  <option key={mes} value={index}>
                    {mes}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>
      </>
    );
  };

  return (
    <div className={`dashboard-layout ${temaEscuro ? "theme-dark" : "theme-light"}`}>
      {menuMobileAberto && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Fechar menu"
          onClick={() => setMenuMobileAberto(false)}
        />
      )}

      <aside
        className={`sidebar ${menuMobileAberto ? "mobile-open" : ""}`}
        id="primary-menu"
      >
        <div className="logo">
          <div className="logo-icon">€</div>
          <span>Finanças</span>
        </div>

        <nav className="sidebar-nav">
          <button
            type="button"
            className={`nav-item ${paginaAtiva === "dashboard" ? "active" : ""}`}
            onClick={() => navegarNoMenu("dashboard")}
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            type="button"
            className={`nav-item ${paginaAtiva === "resumo" ? "active" : ""}`}
            onClick={() => navegarNoMenu("resumo")}
          >
            <span>◫</span>
            Resumo
          </button>

          <button
            type="button"
            className={`nav-item ${paginaAtiva === "despesas" ? "active" : ""}`}
            onClick={() => navegarNoMenu("despesas")}
          >
            <span>€</span>
            Despesas
          </button>

          <button
            type="button"
            className={`nav-item ${paginaAtiva === "estatisticas" ? "active" : ""}`}
            onClick={() => navegarNoMenu("estatisticas")}
          >
            <span>↗</span>
            Estatísticas
          </button>

          <a
            href="#orcamentos"
            className={`nav-item ${paginaAtiva === "orcamentos" ? "active" : ""}`}
            aria-current={paginaAtiva === "orcamentos" ? "page" : undefined}
            onClick={() => setMenuMobileAberto(false)}
          >
            <span>◎</span>
            Orçamentos
          </a>

          <button
            type="button"
            className={`nav-item ${paginaAtiva === "categorias" ? "active" : ""}`}
            onClick={() => navegarNoMenu("categorias")}
          >
            <span>▦</span>
            Categorias
          </button>
        </nav>

        <div className="sidebar-bottom">
          <a href="#definicoes" className="nav-item">
            <span>⚙</span>
            Definições
          </a>

          <button
            type="button"
            className="nav-item logout-button"
            onClick={terminarSessao}
          >
            <span>↪</span>
            Terminar sessão
          </button>
        </div>
      </aside>

      <main className="dashboard">
        <header className="dashboard-header">
          <div className="dashboard-heading">
            <button
              type="button"
              className="mobile-menu-toggle"
              aria-label="Abrir menu"
              aria-controls="primary-menu"
              aria-expanded={menuMobileAberto}
              onClick={() => setMenuMobileAberto((aberto) => !aberto)}
            >
              <span aria-hidden="true">☰</span>
            </button>
            <div>
              <p className="eyebrow">GESTÃO FINANCEIRA</p>
              <h1>{titulosPagina[paginaAtiva] || "Dashboard"}</h1>
              <p className="subtitle">Acompanha e organiza os teus gastos.</p>
            </div>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="theme-toggle"
              onClick={() => setTemaEscuro((valor) => !valor)}
            >
              <span>{temaEscuro ? "☀️" : "🌙"}</span>
              {temaEscuro ? "Claro" : "Escuro"}
            </button>

            {paginaAtiva !== "despesas" && (
              <button
                className="add-expense-button"
                onClick={() => {
                  setPaginaAtiva("despesas");
                  window.setTimeout(() => {
                    document.getElementById("expense-form")?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }, 50);
                }}
              >
                + Adicionar despesa
              </button>
            )}
          </div>
        </header>

        {renderConteudo()}
      </main>
    </div>
  );
}

export default Dashboard;