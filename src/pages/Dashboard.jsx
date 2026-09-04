import ExpenseForm from "../components/ExpenseForm";

function Dashboard({

  despesasFiltradas,
  total,
  totalCategoria,
  categoriaAtiva,
  setCategoriaAtiva,
  categorias,
  meses,
  mesSelecionado,
  setMesSelecionado,
  anoSelecionado,
  setAnoSelecionado,
  anosDisponiveis,
  adicionarDespesa,
  eliminarDespesa,
}) {
  // Média diária
  const mediaDiaria =
    despesasFiltradas.length > 0
      ? totalCategoria /
        new Date(
          anoSelecionado,
          mesSelecionado + 1,
          0
        ).getDate()
      : 0;

  // Gastos por categoria
  const gastosPorCategoria = {};

  despesasFiltradas.forEach((despesa) => {
    const categoria = despesa.categoria || "Outros";

    gastosPorCategoria[categoria] =
      (gastosPorCategoria[categoria] || 0) +
      Number(despesa.valor);
  });

  // Categoria com maior gasto
  const categoriaPrincipal =
    Object.entries(gastosPorCategoria).sort(
      (a, b) => b[1] - a[1]
    )[0];

  return (
    <div className="dashboard-layout">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="logo">
          <div className="logo-icon">€</div>
          <span>Finanças</span>
        </div>

        <nav className="sidebar-nav">

          <a href="#dashboard" className="nav-item active">
            <span>⌂</span>
            Dashboard
          </a>

          <a href="#despesas" className="nav-item">
            <span>€</span>
            Despesas
          </a>

          <a href="#estatisticas" className="nav-item">
            <span>↗</span>
            Estatísticas
          </a>

          <a href="#categorias" className="nav-item">
            <span>▦</span>
            Categorias
          </a>

        </nav>

        <div className="sidebar-bottom">

          <a href="#definicoes" className="nav-item">
            <span>⚙</span>
            Definições
          </a>

        </div>

      </aside>

      {/* CONTEÚDO */}
      <main className="dashboard">

        {/* HEADER */}
        <header className="dashboard-header">

          <div>
            <p className="eyebrow">
              GESTÃO FINANCEIRA
            </p>

            <h1>
              Dashboard
            </h1>

            <p className="subtitle">
              Acompanha e organiza os teus gastos.
            </p>
          </div>

          <div className="header-actions">

            <button
              className="add-expense-button"
              onClick={() =>
                document
                  .getElementById("expense-form")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              + Adicionar despesa
            </button>

          </div>

        </header>

        {/* ESTATÍSTICAS */}
        <section className="stats-grid">

          <div className="stat-card">

            <div className="stat-header">
              <span>Total gasto</span>
              <div className="stat-icon">€</div>
            </div>

            <strong>
              {Number(total).toFixed(2)} €
            </strong>

            <small>
              {meses[mesSelecionado]} {anoSelecionado}
            </small>

          </div>

          <div className="stat-card">

            <div className="stat-header">
              <span>Despesas</span>
              <div className="stat-icon">↗</div>
            </div>

            <strong>
              {despesasFiltradas.length}
            </strong>

            <small>
              neste período
            </small>

          </div>

          <div className="stat-card">

            <div className="stat-header">
              <span>Média diária</span>
              <div className="stat-icon">◷</div>
            </div>

            <strong>
              {mediaDiaria.toFixed(2)} €
            </strong>

            <small>
              por dia
            </small>

          </div>

          <div className="stat-card">

            <div className="stat-header">
              <span>Maior categoria</span>
              <div className="stat-icon">⌁</div>
            </div>

            <strong className="category-stat">
              {categoriaPrincipal
                ? categoriaPrincipal[0]
                : "—"}
            </strong>

            <small>
              {categoriaPrincipal
                ? `${categoriaPrincipal[1].toFixed(2)} €`
                : "Sem despesas"}
            </small>

          </div>

        </section>

        {/* FILTROS */}
        <section className="dashboard-card filters-card">

          <div className="filters-title">

            <div>
              <h2>Período</h2>

              <p>
                Escolhe o período que queres consultar.
              </p>
            </div>

          </div>

          <div className="dashboard-filters">

            <div className="filter">

              <label>Ano</label>

              <select
                value={anoSelecionado}
                onChange={(e) =>
                  setAnoSelecionado(
                    Number(e.target.value)
                  )
                }
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
                onChange={(e) =>
                  setMesSelecionado(
                    Number(e.target.value)
                  )
                }
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

        {/* CATEGORIAS */}
        <section
          className="dashboard-card"
          id="categorias"
        >

          <div className="card-heading">

            <div>
              <h2>Categorias</h2>

              <p>
                Filtra as tuas despesas por categoria.
              </p>
            </div>

            <strong>
              {Number(totalCategoria).toFixed(2)} €
            </strong>

          </div>

          <div className="categories">

            {categorias.map((categoria) => (

              <button
                key={categoria.nome}
                className={
                  categoriaAtiva === categoria.nome
                    ? "category active"
                    : "category"
                }
                onClick={() =>
                  setCategoriaAtiva(
                    categoria.nome
                  )
                }
              >

                <span>
                  {categoria.icone}
                </span>

                {categoria.nome}

              </button>

            ))}

          </div>

        </section>

        {/* DISTRIBUIÇÃO */}
        <section className="dashboard-card">

          <div className="card-heading">

            <div>
              <h2>Distribuição por categoria</h2>

              <p>
                Onde estás a gastar mais.
              </p>
            </div>

          </div>

          <div className="category-bars">

            {Object.entries(gastosPorCategoria)
              .sort((a, b) => b[1] - a[1])
              .map(([categoria, valor]) => {

                const percentagem =
                  totalCategoria > 0
                    ? (valor / totalCategoria) * 100
                    : 0;

                const categoriaInfo =
                  categorias.find(
                    (c) => c.nome === categoria
                  );

                return (
                  <div
                    className="category-bar-item"
                    key={categoria}
                  >

                    <div className="bar-info">

                      <span>
                        {categoriaInfo?.icone || "📦"}{" "}
                        {categoria}
                      </span>

                      <strong>
                        {valor.toFixed(2)} €
                      </strong>

                    </div>

                    <div className="bar">

                      <div
                        className="bar-fill"
                        style={{
                          width: `${percentagem}%`,
                        }}
                      />

                    </div>

                    <small>
                      {percentagem.toFixed(0)}%
                    </small>

                  </div>
                );
              })}

            {Object.keys(gastosPorCategoria).length === 0 && (
              <div className="empty">
                Ainda não existem despesas neste período.
              </div>
            )}

          </div>

        </section>

        {/* FORMULÁRIO */}
        <section
          className="dashboard-card expense-form-section"
          id="expense-form"
        >

          <div className="card-heading">

            <div>
              <h2>Adicionar despesa</h2>

              <p>
                Regista uma nova despesa.
              </p>
            </div>

          </div>

          <ExpenseForm
            onAddExpense={adicionarDespesa}
          />

        </section>

        {/* DESPESAS */}
        <section
          className="dashboard-card"
          id="despesas"
        >

          <div className="card-heading">

            <div>

              <h2>
                {categoriaAtiva === "Todas"
                  ? "Despesas recentes"
                  : categoriaAtiva}
              </h2>

              <p>
                {despesasFiltradas.length}{" "}
                {despesasFiltradas.length === 1
                  ? "despesa"
                  : "despesas"}
              </p>

            </div>

            <strong>
              {Number(totalCategoria).toFixed(2)} €
            </strong>

          </div>

          <div className="expenses">

            {despesasFiltradas.length === 0 ? (

              <div className="empty">

                <div className="empty-icon">
                  📭
                </div>

                <h3>
                  Nenhuma despesa
                </h3>

                <p>
                  Não existem despesas neste período.
                </p>

              </div>

            ) : (

              despesasFiltradas.map((d) => {

                const categoria =
                  categorias.find(
                    (c) =>
                      c.nome ===
                      (d.categoria || "Outros")
                  );

                return (
                  <div
                    className="expense-card"
                    key={d.id}
                  >

                    <div className="expense-icon">
                      {categoria?.icone || "📦"}
                    </div>

                    <div className="expense-info">

                      <h3>
                        {d.descricao}
                      </h3>

                      <p>
                        {categoria?.nome || "Outros"}
                        {" • "}
                        {new Date(
                          d.created_at
                        ).toLocaleDateString(
                          "pt-PT"
                        )}
                      </p>

                    </div>

                    <div className="expense-value">

                      <strong>
                        {Number(d.valor).toFixed(2)} €
                      </strong>

                      <button
                        className="delete-button"
                        onClick={() =>
                          eliminarDespesa(d.id)
                        }
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

      </main>

    </div>
  );
}

export default Dashboard;