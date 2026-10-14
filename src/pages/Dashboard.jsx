import { useEffect, useRef, useState } from "react";
import ExpenseForm from "../components/ExpenseForm";
import RecurringExpenses from "../components/RecurringExpenses";
import Select from "../components/Select";
import { formatCurrency, iconesEstacao } from "../data/dashboardData";
import { supabase } from "../supabaseClient";

function Dashboard({
  userId,
  userEmail,
  userName,
  despesas,
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
  atualizarDespesa,
  temaEscuro,
  setTemaEscuro,
  resumoMensal,
  paginaAtiva,
  setPaginaAtiva,
}) {
  const [categoriaEstatisticas, setCategoriaEstatisticas] = useState("Todas");
  const [categoriaOrcamento, setCategoriaOrcamento] = useState("Todas");
  const [abaDespesas, setAbaDespesas] = useState("diarias");
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const botaoMenuMobileRef = useRef(null);
  const botaoFecharMenuRef = useRef(null);
  const [pesquisaDespesas, setPesquisaDespesas] = useState("");
  const [categoriaPesquisa, setCategoriaPesquisa] = useState("Todas");
  const [valorMinimo, setValorMinimo] = useState("");
  const [valorMaximo, setValorMaximo] = useState("");
  const [despesaEmEdicao, setDespesaEmEdicao] = useState(null);
  const [aGuardarDespesa, setAGuardarDespesa] = useState(false);
  const [erroEdicaoDespesa, setErroEdicaoDespesa] = useState("");
  const [aEnviarRecuperacao, setAEnviarRecuperacao] = useState(false);
  const [aGuardarNome, setAGuardarNome] = useState(false);
  const [aAlterarEmail, setAAlterarEmail] = useState(false);
  const [nomePerfil, setNomePerfil] = useState(userName);
  const [novoEmail, setNovoEmail] = useState("");
  const [mensagemDefinicoes, setMensagemDefinicoes] = useState({
    tipo: "",
    texto: "",
  });
  const [orcamentos, setOrcamentos] = useState({});
  const [aCarregarOrcamentos, setACarregarOrcamentos] = useState(true);
  const [aGuardarOrcamentos, setAGuardarOrcamentos] = useState(false);
  const [mensagemOrcamentos, setMensagemOrcamentos] = useState("");

  useEffect(() => {
    let ativo = true;

    const carregarOrcamentos = async () => {
      setACarregarOrcamentos(true);
      setMensagemOrcamentos("");
      setOrcamentos({});

      const { data, error } = await supabase
        .from("orcamentos")
        .select("categoria, limite")
        .eq("user_id", userId)
        .eq("ano", anoSelecionado)
        .eq("mes", mesSelecionado);

      if (!ativo) return;

      if (error) {
        setMensagemOrcamentos(`Não foi possível carregar os orçamentos: ${error.message}`);
      } else {
        setOrcamentos(
          Object.fromEntries(
            data.map((orcamento) => [
              orcamento.categoria,
              String(orcamento.limite),
            ])
          )
        );
      }

      setACarregarOrcamentos(false);
    };

    carregarOrcamentos();

    return () => {
      ativo = false;
    };
  }, [userId, anoSelecionado, mesSelecionado]);

  const terminarSessao = async () => {
    await supabase.auth.signOut();
  };

  const navegarNoMenu = (pagina) => {
    setPaginaAtiva(pagina);
    setMenuMobileAberto(false);
  };

  const navegarAbasDespesas = (event, aba) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    event.preventDefault();
    setAbaDespesas(aba);
    document
      .getElementById(aba === "diarias" ? "tab-despesas-diarias" : "tab-despesas-recorrentes")
      ?.focus();
  };

  useEffect(() => {
    if (!menuMobileAberto) return undefined;

    const botaoMenuMobile = botaoMenuMobileRef.current;
    const fecharComEscape = (event) => {
      if (event.key === "Escape") setMenuMobileAberto(false);
    };

    document.addEventListener("keydown", fecharComEscape);
    botaoFecharMenuRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", fecharComEscape);
      botaoMenuMobile?.focus();
    };
  }, [menuMobileAberto]);

  const despesasVisiveis = despesasDoPeriodo.filter((despesa) => {
    const pesquisa = pesquisaDespesas.trim().toLocaleLowerCase("pt-PT");
    const correspondePesquisa =
      !pesquisa ||
      [despesa.descricao, despesa.categoria || "Outros"]
        .some((valor) => String(valor).toLocaleLowerCase("pt-PT").includes(pesquisa));
    const correspondeCategoria =
      categoriaPesquisa === "Todas" ||
      (despesa.categoria || "Outros") === categoriaPesquisa;
    const valor = Number(despesa.valor);
    const correspondeValorMinimo =
      valorMinimo === "" || valor >= Number(valorMinimo);
    const correspondeValorMaximo =
      valorMaximo === "" || valor <= Number(valorMaximo);

    return (
      correspondePesquisa &&
      correspondeCategoria &&
      correspondeValorMinimo &&
      correspondeValorMaximo
    );
  });
  const totalDespesasVisiveis = despesasVisiveis.reduce(
    (soma, despesa) => soma + Number(despesa.valor),
    0
  );

  const iniciarEdicaoDespesa = (despesa) => {
    setErroEdicaoDespesa("");
    setDespesaEmEdicao({
      id: despesa.id,
      descricao: despesa.descricao || "",
      valor: String(despesa.valor),
      categoria: despesa.categoria || "Outros",
    });
  };

  const guardarEdicaoDespesa = async (event) => {
    event.preventDefault();
    const descricao = despesaEmEdicao.descricao.trim();
    const valor = Number(despesaEmEdicao.valor);

    if (!descricao || !Number.isFinite(valor) || valor <= 0) {
      setErroEdicaoDespesa("Indica uma descrição e um valor superior a zero.");
      return;
    }

    setAGuardarDespesa(true);
    setErroEdicaoDespesa("");

    try {
      await atualizarDespesa(despesaEmEdicao.id, {
        descricao,
        valor,
        categoria: despesaEmEdicao.categoria,
      });
      setDespesaEmEdicao(null);
    } catch (error) {
      setErroEdicaoDespesa(`Não foi possível guardar a despesa: ${error.message}`);
    } finally {
      setAGuardarDespesa(false);
    }
  };

  const exportarDespesas = (listaDespesas, nomeFicheiro) => {
    const escaparCsv = (valor) => {
      const texto = String(valor ?? "");
      const seguro = /^[\t\r=+\-@]/.test(texto) ? `'${texto}` : texto;
      return `"${seguro.replace(/"/g, '""')}"`;
    };
    const linhas = [
      ["Mês", "Descrição", "Categoria", "Valor (€)"],
      ...listaDespesas.map((despesa) => [
        new Date(despesa.created_at).toLocaleDateString("pt-PT", {
          month: "long",
          year: "numeric",
        }),
        despesa.descricao,
        despesa.categoria || "Outros",
        Number(despesa.valor).toLocaleString("pt-PT", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      ]),
    ];
    const csv = `\uFEFF${linhas
      .map((linha) => linha.map(escaparCsv).join(";"))
      .join("\r\n")}`;
    const ficheiro = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(ficheiro);
    const link = document.createElement("a");
    link.href = url;
    link.download = nomeFicheiro;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const guardarNomePerfil = async (event) => {
    event.preventDefault();
    const nome = nomePerfil.trim();

    if (!nome) {
      setMensagemDefinicoes({ tipo: "erro", texto: "Introduz um nome válido." });
      return;
    }

    setAGuardarNome(true);
    setMensagemDefinicoes({ tipo: "", texto: "" });

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { full_name: nome },
      });

      if (error) {
        setMensagemDefinicoes({
          tipo: "erro",
          texto: `Não foi possível guardar o nome: ${error.message}`,
        });
      } else if (data.user?.user_metadata?.full_name !== nome) {
        setMensagemDefinicoes({
          tipo: "erro",
          texto: "O Supabase não confirmou que o nome foi guardado. Tenta novamente.",
        });
      } else {
        setNomePerfil(nome);
        setMensagemDefinicoes({
          tipo: "sucesso",
          texto: "O nome do perfil foi atualizado.",
        });
      }
    } catch (error) {
      setMensagemDefinicoes({
        tipo: "erro",
        texto: `Não foi possível guardar o nome: ${error.message}`,
      });
    } finally {
      setAGuardarNome(false);
    }
  };

  const alterarEmail = async (event) => {
    event.preventDefault();
    const email = novoEmail.trim();

    if (!email || email.toLowerCase() === userEmail.toLowerCase()) {
      setMensagemDefinicoes({
        tipo: "erro",
        texto: "Introduz um email diferente do email atual.",
      });
      return;
    }

    setAAlterarEmail(true);
    setMensagemDefinicoes({ tipo: "", texto: "" });

    try {
      const { error } = await supabase.auth.updateUser({ email });

      if (error) {
        setMensagemDefinicoes({
          tipo: "erro",
          texto: `Não foi possível alterar o email: ${error.message}`,
        });
      } else {
        setNovoEmail("");
        setMensagemDefinicoes({
          tipo: "sucesso",
          texto:
            "Enviámos uma confirmação para concluir a alteração do email. O email da conta só muda depois da confirmação.",
        });
      }
    } catch (error) {
      setMensagemDefinicoes({
        tipo: "erro",
        texto: `Não foi possível alterar o email: ${error.message}`,
      });
    } finally {
      setAAlterarEmail(false);
    }
  };

  const enviarRecuperacaoPassword = async () => {
    setAEnviarRecuperacao(true);
    setMensagemDefinicoes({ tipo: "", texto: "" });

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: window.location.origin,
      });

      if (error) {
        setMensagemDefinicoes({
          tipo: "erro",
          texto: `Não foi possível enviar o email: ${error.message}`,
        });
      } else {
        setMensagemDefinicoes({
          tipo: "sucesso",
          texto: "Enviámos um link para redefinir a palavra-passe para o teu email.",
        });
      }
    } catch (error) {
      setMensagemDefinicoes({
        tipo: "erro",
        texto: `Não foi possível enviar o email: ${error.message}`,
      });
    } finally {
      setAEnviarRecuperacao(false);
    }
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
  const totalLimitesOrcamento = Object.values(orcamentos).reduce(
    (soma, limite) => soma + (Number(limite) > 0 ? Number(limite) : 0),
    0
  );
  const diferencaOrcamento = totalLimitesOrcamento - total;
  const guardarOrcamentos = async (event) => {
    event.preventDefault();
    setAGuardarOrcamentos(true);
    setMensagemOrcamentos("");

    try {
      const valores = Object.entries(orcamentos).filter(
        ([, limite]) => limite !== "" && Number(limite) > 0
      );
      const categoriasSemLimite = categorias
        .filter(
          (categoria) =>
            categoria.nome !== "Todas" &&
            !valores.some(([nome]) => nome === categoria.nome)
        )
        .map((categoria) => categoria.nome);

      const operacoes = [];

      if (valores.length > 0) {
        operacoes.push(
          supabase.from("orcamentos").upsert(
            valores.map(([categoria, limite]) => ({
              user_id: userId,
              ano: anoSelecionado,
              mes: mesSelecionado,
              categoria,
              limite: Number(limite),
            })),
            { onConflict: "user_id,ano,mes,categoria" }
          )
        );
      }

      if (categoriasSemLimite.length > 0) {
        operacoes.push(
          supabase
            .from("orcamentos")
            .delete()
            .eq("user_id", userId)
            .eq("ano", anoSelecionado)
            .eq("mes", mesSelecionado)
            .in("categoria", categoriasSemLimite)
        );
      }

      const resultados = await Promise.all(operacoes);
      const erro = resultados.find((resultado) => resultado.error)?.error;

      if (erro) {
        setMensagemOrcamentos(`Não foi possível guardar os orçamentos: ${erro.message}`);
      } else {
        setMensagemOrcamentos("Orçamentos guardados no Supabase.");
      }
    } catch (error) {
      setMensagemOrcamentos(`Não foi possível guardar os orçamentos: ${error.message}`);
    } finally {
      setAGuardarOrcamentos(false);
    }
  };
  const titulosPagina = {
    dashboard: "Dashboard",
    resumo: "Resumo financeiro",
    despesas: "Despesas",
    estatisticas: "Estatísticas",
    categorias: "Categorias",
    orcamentos: "Orçamentos",
    definicoes: "Definições",
  };

  const renderConteudo = () => {
    if (paginaAtiva === "definicoes") {
      return (
        <div className="settings-grid">
          <section className="dashboard-card settings-card">
            <div className="card-heading">
              <div>
                <h2>A tua conta</h2>
                <p>Informações associadas ao teu perfil.</p>
              </div>
              <span className="settings-icon" aria-hidden="true">👤</span>
            </div>

            <div className="settings-detail">
              <span>Email</span>
              <strong>{userEmail || "Email indisponível"}</strong>
            </div>
            <div className="settings-detail">
              <span>Despesas no período</span>
              <strong>{despesasDoPeriodo.length}</strong>
            </div>

            <form className="settings-form" onSubmit={guardarNomePerfil}>
              <label htmlFor="settings-profile-name">Nome do perfil</label>
              <div className="settings-form-row">
                <input
                  id="settings-profile-name"
                  type="text"
                  autoComplete="name"
                  maxLength={80}
                  value={nomePerfil}
                  onChange={(event) => setNomePerfil(event.target.value)}
                  placeholder="O teu nome"
                  required
                />
                <button
                  type="submit"
                  className="settings-button"
                  disabled={aGuardarNome}
                >
                  {aGuardarNome ? "A guardar..." : "Guardar nome"}
                </button>
              </div>
              <p className="settings-help">
                Guardado nos metadados do Supabase Auth; não precisa de uma coluna na tabela de despesas.
              </p>
            </form>

            <form className="settings-form" onSubmit={alterarEmail}>
              <label htmlFor="settings-new-email">Alterar email</label>
              <div className="settings-form-row">
                <input
                  id="settings-new-email"
                  type="email"
                  autoComplete="email"
                  value={novoEmail}
                  onChange={(event) => setNovoEmail(event.target.value)}
                  placeholder={userEmail}
                  required
                />
                <button
                  type="submit"
                  className="settings-button"
                  disabled={aAlterarEmail}
                >
                  {aAlterarEmail ? "A enviar..." : "Alterar email"}
                </button>
              </div>
              <p className="settings-help">
                A alteração só fica ativa depois de confirmares o email.
              </p>
            </form>

            <div className="settings-action">
              <div>
                <strong>Alterar palavra-passe</strong>
                <p>Envia um link seguro para o teu email.</p>
              </div>
              <button
                type="button"
                className="settings-button"
                onClick={enviarRecuperacaoPassword}
                disabled={aEnviarRecuperacao || !userEmail}
              >
                {aEnviarRecuperacao ? "A enviar..." : "Enviar link"}
              </button>
            </div>
          </section>

          <section className="dashboard-card settings-card">
            <div className="card-heading">
              <div>
                <h2>Aparência</h2>
                <p>Escolhe o tema da aplicação.</p>
              </div>
              <span className="settings-icon" aria-hidden="true">
                {temaEscuro ? "🌙" : "☀️"}
              </span>
            </div>

            <div className="settings-action">
              <div>
                <strong>{temaEscuro ? "Tema escuro" : "Tema claro"}</strong>
                <p>A preferência fica guardada neste dispositivo.</p>
              </div>
              <button
                type="button"
                className="settings-button"
                onClick={() => setTemaEscuro((valor) => !valor)}
                aria-pressed={temaEscuro}
              >
                Mudar para {temaEscuro ? "claro" : "escuro"}
              </button>
            </div>
          </section>

          <section className="dashboard-card settings-card">
            <div className="card-heading">
              <div>
                <h2>Os teus dados</h2>
                <p>Exporta uma cópia das despesas do período selecionado.</p>
              </div>
              <span className="settings-icon" aria-hidden="true">⇩</span>
            </div>

            <div className="settings-action">
              <div>
                <strong>{meses[mesSelecionado]} {anoSelecionado}</strong>
                <p>{despesasDoPeriodo.length} despesas disponíveis para exportação.</p>
              </div>
              <button
                type="button"
                className="settings-button"
                onClick={() =>
                  exportarDespesas(
                    despesasDoPeriodo,
                    `despesas-${anoSelecionado}-${String(mesSelecionado + 1).padStart(2, "0")}.csv`
                  )
                }
                disabled={despesasDoPeriodo.length === 0}
              >
                Exportar CSV
              </button>
            </div>
            <div className="settings-action">
              <div>
                <strong>Histórico completo</strong>
                <p>{despesas.length} despesas de todos os períodos.</p>
              </div>
              <button
                type="button"
                className="settings-button"
                onClick={() => exportarDespesas(despesas, "todas-as-despesas.csv")}
                disabled={despesas.length === 0}
              >
                Exportar tudo
              </button>
            </div>
          </section>

          {mensagemDefinicoes.texto && (
            <div
              className={`settings-message ${mensagemDefinicoes.tipo}`}
              role={mensagemDefinicoes.tipo === "erro" ? "alert" : "status"}
            >
              {mensagemDefinicoes.texto}
            </div>
          )}
        </div>
      );
    }

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
          <div className="expense-tabs" role="tablist" aria-label="Tipo de despesa">
            <button
              id="tab-despesas-diarias"
              type="button"
              role="tab"
              className={`expense-tab ${abaDespesas === "diarias" ? "active" : ""}`}
              aria-selected={abaDespesas === "diarias"}
              aria-controls="panel-despesas"
              tabIndex={abaDespesas === "diarias" ? 0 : -1}
              onClick={() => setAbaDespesas("diarias")}
              onKeyDown={(event) => navegarAbasDespesas(event, "recorrentes")}
            >
              <span className="expense-tab-icon" aria-hidden="true">↗</span>
              <span>Diárias</span>
            </button>
            <button
              id="tab-despesas-recorrentes"
              type="button"
              role="tab"
              className={`expense-tab ${abaDespesas === "recorrentes" ? "active" : ""}`}
              aria-selected={abaDespesas === "recorrentes"}
              aria-controls="panel-despesas"
              tabIndex={abaDespesas === "recorrentes" ? 0 : -1}
              onClick={() => setAbaDespesas("recorrentes")}
              onKeyDown={(event) => navegarAbasDespesas(event, "diarias")}
            >
              <span className="expense-tab-icon" aria-hidden="true">⟳</span>
              <span>Recorrentes</span>
            </button>
          </div>
          <div
            id="panel-despesas"
            role="tabpanel"
            aria-labelledby={abaDespesas === "diarias" ? "tab-despesas-diarias" : "tab-despesas-recorrentes"}
          >
          {abaDespesas === "diarias" && (
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
                  {despesasVisiveis.length} de {despesasDoPeriodo.length}{" "}
                  {despesasDoPeriodo.length === 1 ? "despesa" : "despesas"}
                </p>
              </div>

              <strong>{formatCurrency(totalDespesasVisiveis)}</strong>
            </div>

            <div className="expense-filters" aria-label="Filtros de despesas">
              <div className="expense-filter-search">
                <label htmlFor="pesquisa-despesas">Pesquisar</label>
                <input
                  id="pesquisa-despesas"
                  type="search"
                  value={pesquisaDespesas}
                  onChange={(event) => setPesquisaDespesas(event.target.value)}
                  placeholder="Descrição ou categoria"
                />
              </div>

              <div className="expense-filter-category">
                <label htmlFor="categoria-pesquisa">Categoria</label>
                <Select
                  id="categoria-pesquisa"
                  value={categoriaPesquisa}
                  onChange={(event) => setCategoriaPesquisa(event.target.value)}
                >
                  <option value="Todas">📋 Todas</option>
                  {categorias
                    .filter((item) => item.nome !== "Todas")
                    .map((item) => (
                      <option key={item.nome} value={item.nome}>
                        {item.icone} {item.nome}
                      </option>
                    ))}
                </Select>
              </div>

              <div className="expense-filter-amount">
                <label htmlFor="valor-minimo">Valor mín. (€)</label>
                <input
                  id="valor-minimo"
                  type="number"
                  min="0"
                  step="0.01"
                  value={valorMinimo}
                  onChange={(event) => setValorMinimo(event.target.value)}
                  placeholder="Sem mínimo"
                />
              </div>

              <div className="expense-filter-amount">
                <label htmlFor="valor-maximo">Valor máx. (€)</label>
                <input
                  id="valor-maximo"
                  type="number"
                  min="0"
                  step="0.01"
                  value={valorMaximo}
                  onChange={(event) => setValorMaximo(event.target.value)}
                  placeholder="Sem máximo"
                />
              </div>
            </div>

            <div className="expenses">
              {despesasDoPeriodo.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">📭</div>
                  <h3>Nenhuma despesa</h3>
                  <p>Não existem despesas neste período.</p>
                </div>
              ) : despesasVisiveis.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">🔎</div>
                  <h3>Sem resultados</h3>
                  <p>Não encontrámos despesas com estes filtros.</p>
                  <button
                    type="button"
                    className="clear-expense-filters"
                    onClick={() => {
                      setPesquisaDespesas("");
                      setCategoriaPesquisa("Todas");
                      setValorMinimo("");
                      setValorMaximo("");
                    }}
                  >
                    Limpar filtros
                  </button>
                </div>
              ) : (
                despesasVisiveis.map((despesa) => {
                  const categoria = categorias.find(
                    (item) => item.nome === (despesa.categoria || "Outros")
                  );

                  return (
                    despesaEmEdicao?.id === despesa.id ? (
                      <form
                        className="expense-edit-form"
                        key={despesa.id}
                        onSubmit={guardarEdicaoDespesa}
                      >
                        <div className="form-group">
                          <label htmlFor={`edit-descricao-${despesa.id}`}>
                            Descrição
                          </label>
                          <input
                            id={`edit-descricao-${despesa.id}`}
                            type="text"
                            maxLength={120}
                            value={despesaEmEdicao.descricao}
                            onChange={(event) =>
                              setDespesaEmEdicao((atual) => ({
                                ...atual,
                                descricao: event.target.value,
                              }))
                            }
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor={`edit-valor-${despesa.id}`}>Valor</label>
                          <input
                            id={`edit-valor-${despesa.id}`}
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={despesaEmEdicao.valor}
                            onChange={(event) =>
                              setDespesaEmEdicao((atual) => ({
                                ...atual,
                                valor: event.target.value,
                              }))
                            }
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor={`edit-categoria-${despesa.id}`}>
                            Categoria
                          </label>
                          <Select
                            id={`edit-categoria-${despesa.id}`}
                            value={despesaEmEdicao.categoria}
                            onChange={(event) =>
                              setDespesaEmEdicao((atual) => ({
                                ...atual,
                                categoria: event.target.value,
                              }))
                            }
                          >
                            {categorias
                              .filter((item) => item.nome !== "Todas")
                              .map((item) => (
                                <option key={item.nome} value={item.nome}>
                                  {item.icone} {item.nome}
                                </option>
                              ))}
                          </Select>
                        </div>

                        <div className="expense-edit-actions">
                          <button
                            type="submit"
                            className="expense-save-button"
                            disabled={aGuardarDespesa}
                          >
                            {aGuardarDespesa ? "A guardar..." : "Guardar"}
                          </button>
                          <button
                            type="button"
                            className="expense-cancel-button"
                            onClick={() => {
                              setDespesaEmEdicao(null);
                              setErroEdicaoDespesa("");
                            }}
                            disabled={aGuardarDespesa}
                          >
                            Cancelar
                          </button>
                        </div>
                        {erroEdicaoDespesa && (
                          <p className="expense-edit-error" role="alert">
                            {erroEdicaoDespesa}
                          </p>
                        )}
                      </form>
                    ) : (
                      <div className="expense-card" key={despesa.id}>
                        <div className="expense-icon">{categoria?.icone || "📦"}</div>

                        <div className="expense-info">
                          <h3>{despesa.descricao}</h3>
                          <p>
                            {categoria?.nome || "Outros"}
                            {" • "}
                            {new Date(despesa.created_at).toLocaleDateString("pt-PT", {
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        </div>

                        <div className="expense-value">
                          <strong>{formatCurrency(despesa.valor)}</strong>
                          <button
                            type="button"
                            className="edit-button"
                            onClick={() => iniciarEdicaoDespesa(despesa)}
                            title="Editar despesa"
                            aria-label={`Editar ${despesa.descricao}`}
                          >
                            ✎
                          </button>
                          <button
                            type="button"
                            className="delete-button"
                            onClick={() => eliminarDespesa(despesa.id)}
                            title="Eliminar despesa"
                            aria-label={`Eliminar ${despesa.descricao}`}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    )
                  );
                })
              )}
            </div>
          </section>
            </>
          )}
          {abaDespesas === "recorrentes" && (
            <RecurringExpenses userId={userId} categorias={categorias} />
          )}
          </div>
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

                <Select
                  value={anoSelecionado}
                  onChange={(event) => setAnoSelecionado(Number(event.target.value))}
                >
                  {anosDisponiveis.map((ano) => (
                    <option key={ano} value={ano}>
                      📅 {ano}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="filter">
                <label>Mês</label>

                <Select
                  value={mesSelecionado}
                  onChange={(event) => setMesSelecionado(Number(event.target.value))}
                >
                  {meses.map((mes, index) => (
                    <option key={mes} value={index}>
                      {iconesEstacao[index]} {mes}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="filter">
                <label>Categoria</label>
                <Select
                  value={categoriaEstatisticas}
                  onChange={(event) => setCategoriaEstatisticas(event.target.value)}
                >
                  <option value="Todas">📋 Todas as categorias</option>
                  {categorias
                    .filter((categoria) => categoria.nome !== "Todas")
                    .map((categoria) => (
                      <option key={categoria.nome} value={categoria.nome}>
                        {categoria.icone} {categoria.nome}
                      </option>
                    ))}
                </Select>
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

            <div className="dashboard-filters budget-period-filters">
              <div className="filter">
                <label htmlFor="budget-year">Ano</label>
                <Select
                  id="budget-year"
                  value={anoSelecionado}
                  onChange={(event) => setAnoSelecionado(Number(event.target.value))}
                >
                  {anosDisponiveis.map((ano) => (
                    <option key={ano} value={ano}>📅 {ano}</option>
                  ))}
                </Select>
              </div>

              <div className="filter">
                <label htmlFor="budget-month">Mês</label>
                <Select
                  id="budget-month"
                  value={mesSelecionado}
                  onChange={(event) => setMesSelecionado(Number(event.target.value))}
                >
                  {meses.map((mes, index) => (
                    <option key={mes} value={index}>
                      {iconesEstacao[index]} {mes}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="filter">
                <label htmlFor="budget-category-filter">Categoria</label>
                <Select
                  id="budget-category-filter"
                  value={categoriaOrcamento}
                  onChange={(event) => setCategoriaOrcamento(event.target.value)}
                >
                  <option value="Todas">📋 Todas as categorias</option>
                  {categorias
                    .filter((categoria) => categoria.nome !== "Todas")
                    .map((categoria) => (
                      <option key={categoria.nome} value={categoria.nome}>
                        {categoria.icone} {categoria.nome}
                      </option>
                    ))}
                </Select>
              </div>
            </div>
          </section>

          <section className="dashboard-card budget-summary-card" aria-labelledby="budget-summary-title">
            <div className="card-heading">
              <div>
                <h2 id="budget-summary-title">Resumo do orçamento</h2>
                <p>
                  Comparação de todos os limites definidos com as despesas de{" "}
                  {meses[mesSelecionado]} de {anoSelecionado}.
                </p>
              </div>
            </div>

            {aCarregarOrcamentos ? (
              <p className="budget-summary-loading" role="status">
                A carregar o resumo...
              </p>
            ) : (
              <div className="budget-summary-grid">
                <div className="budget-summary-item">
                  <span>Total dos limites</span>
                  <strong>{formatCurrency(totalLimitesOrcamento)}</strong>
                </div>
                <div className="budget-summary-item">
                  <span>Total gasto</span>
                  <strong>{formatCurrency(total)}</strong>
                </div>
                <div
                  className={`budget-summary-item ${
                    totalLimitesOrcamento > 0
                      ? diferencaOrcamento >= 0
                        ? "is-within-budget"
                        : "is-over-budget"
                      : ""
                  }`}
                >
                  <span>
                    {totalLimitesOrcamento > 0
                      ? diferencaOrcamento >= 0
                        ? "Ainda disponível"
                        : "Acima dos limites"
                      : "Diferença"}
                  </span>
                  <strong>
                    {totalLimitesOrcamento > 0
                      ? formatCurrency(Math.abs(diferencaOrcamento))
                      : "Define pelo menos um limite"}
                  </strong>
                </div>
              </div>
            )}
            <p className="budget-summary-note">
              O resumo considera todos os limites e todas as categorias, mesmo quando aplicas o filtro abaixo.
            </p>
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
                {aCarregarOrcamentos ? (
                  <div className="empty" role="status">
                    A carregar os orçamentos...
                  </div>
                ) : categorias
                  .filter(
                    (categoria) =>
                      categoria.nome !== "Todas" &&
                      (categoriaOrcamento === "Todas" ||
                        categoria.nome === categoriaOrcamento)
                  )
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
                              disabled={aGuardarOrcamentos}
                              onChange={(event) => {
                                setOrcamentos((atuais) => ({
                                  ...atuais,
                                  [categoria.nome]: event.target.value,
                                }));
                                setMensagemOrcamentos("");
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
                {mensagemOrcamentos ? (
                  <div
                    className={`budget-save-feedback ${
                      mensagemOrcamentos.startsWith("Não") ? "is-error" : "is-success"
                    }`}
                    aria-live="polite"
                    role={mensagemOrcamentos.startsWith("Não") ? "alert" : "status"}
                  >
                    <span aria-hidden="true">
                      {mensagemOrcamentos.startsWith("Não") ? "!" : "✓"}
                    </span>
                    {mensagemOrcamentos}
                  </div>
                ) : (
                  <p>Os valores serão guardados na tua conta Supabase.</p>
                )}
                <button
                  type="submit"
                  className="add-expense-button"
                  disabled={aCarregarOrcamentos || aGuardarOrcamentos}
                >
                  {aGuardarOrcamentos
                    ? "A guardar..."
                    : mensagemOrcamentos === "Orçamentos guardados no Supabase."
                      ? "Guardado ✓"
                      : "Guardar orçamento"}
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

              <Select
                value={anoSelecionado}
                onChange={(event) => setAnoSelecionado(Number(event.target.value))}
              >
                {anosDisponiveis.map((ano) => (
                  <option key={ano} value={ano}>
                    📅 {ano}
                  </option>
                ))}
              </Select>
            </div>

            <div className="filter">
              <label>Mês</label>

              <Select
                value={mesSelecionado}
                onChange={(event) => setMesSelecionado(Number(event.target.value))}
              >
                {meses.map((mes, index) => (
                  <option key={mes} value={index}>
                    {iconesEstacao[index]} {mes}
                  </option>
                ))}
              </Select>
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
        aria-label="Navegação principal"
      >
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon" aria-hidden="true">€</div>
            <div className="sidebar-brand-copy">
              <span>Finanças</span>
              <small className="sidebar-brand-caption">Controlo simples, todos os dias</small>
            </div>
          </div>
          <button
            ref={botaoFecharMenuRef}
            type="button"
            className="sidebar-close"
            aria-label="Fechar menu"
            onClick={() => setMenuMobileAberto(false)}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <p className="sidebar-section-label">NAVEGAÇÃO</p>
        <nav className="sidebar-nav" aria-label="Secções">
          <button
            type="button"
            className={`nav-item ${paginaAtiva === "dashboard" ? "active" : ""}`}
            aria-current={paginaAtiva === "dashboard" ? "page" : undefined}
            onClick={() => navegarNoMenu("dashboard")}
          >
            <span aria-hidden="true">⌂</span>
            Dashboard
          </button>

          <button
            type="button"
            className={`nav-item ${paginaAtiva === "resumo" ? "active" : ""}`}
            aria-current={paginaAtiva === "resumo" ? "page" : undefined}
            onClick={() => navegarNoMenu("resumo")}
          >
            <span aria-hidden="true">◫</span>
            Resumo
          </button>

          <button
            type="button"
            className={`nav-item ${paginaAtiva === "despesas" ? "active" : ""}`}
            aria-current={paginaAtiva === "despesas" ? "page" : undefined}
            onClick={() => navegarNoMenu("despesas")}
          >
            <span aria-hidden="true">€</span>
            Despesas
          </button>

          <button
            type="button"
            className={`nav-item ${paginaAtiva === "estatisticas" ? "active" : ""}`}
            aria-current={paginaAtiva === "estatisticas" ? "page" : undefined}
            onClick={() => navegarNoMenu("estatisticas")}
          >
            <span aria-hidden="true">↗</span>
            Estatísticas
          </button>

          <a
            href="#orcamentos"
            className={`nav-item ${paginaAtiva === "orcamentos" ? "active" : ""}`}
            aria-current={paginaAtiva === "orcamentos" ? "page" : undefined}
            onClick={() => setMenuMobileAberto(false)}
          >
            <span aria-hidden="true">◎</span>
            Orçamentos
          </a>

          <button
            type="button"
            className={`nav-item ${paginaAtiva === "categorias" ? "active" : ""}`}
            aria-current={paginaAtiva === "categorias" ? "page" : undefined}
            onClick={() => navegarNoMenu("categorias")}
          >
            <span aria-hidden="true">▦</span>
            Categorias
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-account">
            <span className="sidebar-account-avatar" aria-hidden="true">
              {(userName || userEmail || "U").trim().charAt(0).toLocaleUpperCase("pt-PT")}
            </span>
            <span className="sidebar-account-copy">
              <strong>{userName || "A tua conta"}</strong>
              <small>{userEmail}</small>
            </span>
          </div>
          <button
            type="button"
            className={`nav-item ${paginaAtiva === "definicoes" ? "active" : ""}`}
            onClick={() => navegarNoMenu("definicoes")}
            aria-current={paginaAtiva === "definicoes" ? "page" : undefined}
          >
            <span aria-hidden="true">⚙</span>
            Definições
          </button>

          <button
            type="button"
            className="nav-item logout-button"
            onClick={terminarSessao}
          >
            <span aria-hidden="true">↪</span>
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
              ref={botaoMenuMobileRef}
              aria-label={menuMobileAberto ? "Fechar menu" : "Abrir menu"}
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

        {paginaAtiva === "dashboard" && (
          <section className="dashboard-card dashboard-welcome">
            <p className="eyebrow">A TUA ÁREA FINANCEIRA</p>
            <h2>
              Olá{nomePerfil.trim() ? `, ${nomePerfil.trim()}` : ""}!
            </h2>
            <p>
              Aqui está o teu resumo de {meses[mesSelecionado]} de {anoSelecionado}.
            </p>
          </section>
        )}

        {renderConteudo()}
      </main>
    </div>
  );
}

export default Dashboard;