import { useEffect, useMemo, useState } from "react";
import { categorias, meses } from "./data/dashboardData";
import { supabase } from "./supabaseClient";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import "./App.css";

const paginasDisponiveis = [
  "dashboard",
  "resumo",
  "despesas",
  "estatisticas",
  "categorias",
  "orcamentos",
  "definicoes",
];

const obterPaginaDoEndereco = () => {
  const pagina = window.location.hash.slice(1);
  return paginasDisponiveis.includes(pagina) ? pagina : "dashboard";
};

const obterTemaGuardado = () => {
  try {
    return window.localStorage.getItem("despesas:tema-escuro") === "true";
  } catch {
    return false;
  }
};

function App() {
  const hoje = new Date();

  const [despesas, setDespesas] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todas");
  const [session, setSession] = useState(null);
  const [mostrarRegisto, setMostrarRegisto] = useState(false);
  const [aRedefinirPassword, setARedefinirPassword] = useState(false);
  const [temaEscuro, setTemaEscuro] = useState(obterTemaGuardado);
  const [paginaAtiva, setPaginaAtiva] = useState(obterPaginaDoEndereco);
  const [mesSelecionado, setMesSelecionado] = useState(hoje.getMonth());
  const [anoSelecionado, setAnoSelecionado] = useState(hoje.getFullYear());

  useEffect(() => {
    const obterSessao = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);
    };

    obterSessao();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (event === "PASSWORD_RECOVERY") {
        setARedefinirPassword(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const atualizarPagina = () => {
      setPaginaAtiva(obterPaginaDoEndereco());
    };

    window.addEventListener("hashchange", atualizarPagina);
    return () => window.removeEventListener("hashchange", atualizarPagina);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("despesas:tema-escuro", String(temaEscuro));
    } catch {
      // The selected theme remains active for this session if storage is unavailable.
    }
  }, [temaEscuro]);

  const navegarParaPagina = (pagina) => {
    if (!paginasDisponiveis.includes(pagina)) return;

    setPaginaAtiva(pagina);

    if (window.location.hash !== `#${pagina}`) {
      window.location.hash = pagina;
    }
  };

  useEffect(() => {
    if (!session) return;

    const carregarDespesas = async () => {
      const { data, error } = await supabase
        .from("despesas")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao carregar despesas:", error);
        return;
      }

      setDespesas(data || []);
    };

    carregarDespesas();
  }, [session, refreshKey]);

  const adicionarDespesa = (despesa) => {
    const dataDespesa = new Date(despesa.created_at);
    setMesSelecionado(dataDespesa.getMonth());
    setAnoSelecionado(dataDespesa.getFullYear());
    setRefreshKey((prev) => prev + 1);
  };

  const eliminarDespesa = async (id) => {
    const confirmar = window.confirm(
      "Tens a certeza que queres eliminar esta despesa?"
    );

    if (!confirmar) return;

    const { error } = await supabase.from("despesas").delete().eq("id", id);

    if (error) {
      console.error("Erro ao eliminar despesa:", error);
      window.alert(`Não foi possível eliminar a despesa: ${error.message}`);
      return;
    }

    setRefreshKey((prev) => prev + 1);
  };

  const atualizarDespesa = async (id, alteracoes) => {
    const { data, error } = await supabase
      .from("despesas")
      .update(alteracoes)
      .eq("id", id)
      .eq("user_id", session.user.id)
      .select("id")
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      throw new Error("Despesa não encontrada ou sem permissão para a editar.");
    }

    setRefreshKey((prev) => prev + 1);
  };

  const despesasDoPeriodo = useMemo(
    () =>
      despesas.filter((despesa) => {
        const data = new Date(despesa.created_at);

        return (
          data.getMonth() === mesSelecionado &&
          data.getFullYear() === anoSelecionado
        );
      }),
    [despesas, mesSelecionado, anoSelecionado]
  );

  const despesasFiltradas = useMemo(
    () =>
      categoriaAtiva === "Todas"
        ? despesasDoPeriodo
        : despesasDoPeriodo.filter(
            (despesa) => (despesa.categoria || "Outros") === categoriaAtiva
          ),
    [categoriaAtiva, despesasDoPeriodo]
  );

  const total = useMemo(
    () =>
      despesasDoPeriodo.reduce(
        (acumulador, despesa) => acumulador + Number(despesa.valor),
        0
      ),
    [despesasDoPeriodo]
  );

  const totalCategoria = useMemo(
    () =>
      despesasFiltradas.reduce(
        (acumulador, despesa) => acumulador + Number(despesa.valor),
        0
      ),
    [despesasFiltradas]
  );

  const resumoMensal = useMemo(() => {
    const mesesResumo = [];
    const maxMeses = 6;

    for (let indice = maxMeses - 1; indice >= 0; indice -= 1) {
      const data = new Date(anoSelecionado, mesSelecionado - indice, 1);
      const mes = data.getMonth();
      const ano = data.getFullYear();

      const totalMes = despesas.reduce((acumulador, despesa) => {
        const dataDespesa = new Date(despesa.created_at);

        if (dataDespesa.getMonth() === mes && dataDespesa.getFullYear() === ano) {
          return acumulador + Number(despesa.valor);
        }

        return acumulador;
      }, 0);

      mesesResumo.push({
        label: meses[mes].slice(0, 3),
        total: totalMes,
      });
    }

    return mesesResumo;
  }, [anoSelecionado, despesas, mesSelecionado]);

  const anosDisponiveis = [
    ...new Set(
      despesas.map((despesa) => new Date(despesa.created_at).getFullYear())
    ),
  ];

  if (!anosDisponiveis.includes(hoje.getFullYear())) {
    anosDisponiveis.push(hoje.getFullYear());
  }

  anosDisponiveis.sort((a, b) => b - a);

  if (aRedefinirPassword) {
    return (
      <ResetPassword
        onComplete={() => setARedefinirPassword(false)}
        onBack={() => setARedefinirPassword(false)}
      />
    );
  }

  if (!session) {
    return mostrarRegisto ? (
      <Register onLogin={() => setMostrarRegisto(false)} />
    ) : (
      <Login onRegister={() => setMostrarRegisto(true)} />
    );
  }

  return (
    <Dashboard
      userId={session.user.id}
      userEmail={session.user.email || ""}
      userName={session.user.user_metadata?.full_name || ""}
      despesas={despesas}
      despesasFiltradas={despesasFiltradas}
      despesasDoPeriodo={despesasDoPeriodo}
      total={total}
      totalCategoria={totalCategoria}
      categoriaAtiva={categoriaAtiva}
      setCategoriaAtiva={setCategoriaAtiva}
      categorias={categorias}
      meses={meses}
      mesSelecionado={mesSelecionado}
      setMesSelecionado={setMesSelecionado}
      anoSelecionado={anoSelecionado}
      setAnoSelecionado={setAnoSelecionado}
      anosDisponiveis={anosDisponiveis}
      adicionarDespesa={adicionarDespesa}
      eliminarDespesa={eliminarDespesa}
      atualizarDespesa={atualizarDespesa}
      temaEscuro={temaEscuro}
      setTemaEscuro={setTemaEscuro}
      resumoMensal={resumoMensal}
      paginaAtiva={paginaAtiva}
      setPaginaAtiva={navegarParaPagina}
    />
  );
}

export default App;