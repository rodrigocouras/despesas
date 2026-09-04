import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./App.css";

function App() {

  const [despesas, setDespesas] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todas");
  const [session, setSession] = useState(null);
  const [mostrarRegisto, setMostrarRegisto] = useState(false);

  const hoje = new Date();

  const [mesSelecionado, setMesSelecionado] = useState(
    hoje.getMonth()
  );

  const [anoSelecionado, setAnoSelecionado] = useState(
    hoje.getFullYear()
  );

  // =========================
  // CARREGAR DESPESAS
  // =========================

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
  } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setSession(session);
    }
  );

  return () => {
    subscription.unsubscribe();
  };
}, []);

  useEffect(() => {

    const carregarDespesas = async () => {

      const { data, error } = await supabase
        .from("despesas")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(error);
        return;
      }

      setDespesas(data || []);
    };

    carregarDespesas();

  }, [refreshKey]);


  // =========================
  // ADICIONAR DESPESA
  // =========================

  const adicionarDespesa = () => {
    setRefreshKey((prev) => prev + 1);
  };


  // =========================
  // ELIMINAR DESPESA
  // =========================

  const eliminarDespesa = async (id) => {

    const confirmar = window.confirm(
      "Tens a certeza que queres eliminar esta despesa?"
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("despesas")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(
        "Erro ao eliminar despesa:",
        error
      );
      return;
    }

    setRefreshKey((prev) => prev + 1);
  };


  // =========================
  // CATEGORIAS
  // =========================

  const categorias = [
    {
      nome: "Todas",
      icone: "📋",
    },
    {
      nome: "Combustível",
      icone: "⛽",
    },
    {
      nome: "Mercado",
      icone: "🛒",
    },
    {
      nome: "Saídas",
      icone: "🎉",
    },
    {
      nome: "Jantares",
      icone: "🍽️",
    },
    {
      nome: "Outros",
      icone: "📦",
    },
  ];


  // =========================
  // MESES
  // =========================

  const meses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];


  // =========================
  // FILTRO MÊS / ANO
  // =========================

  const despesasDoPeriodo = despesas.filter(
    (d) => {

      const data = new Date(
        d.created_at
      );

      return (
        data.getMonth() === mesSelecionado &&
        data.getFullYear() === anoSelecionado
      );
    }
  );


  // =========================
  // FILTRO CATEGORIA
  // =========================

  const despesasFiltradas =
    categoriaAtiva === "Todas"
      ? despesasDoPeriodo
      : despesasDoPeriodo.filter(
          (d) =>
            (d.categoria || "Outros") ===
            categoriaAtiva
        );


  // =========================
  // TOTAL
  // =========================

  const total = despesasDoPeriodo.reduce(
    (acc, d) =>
      acc + Number(d.valor),
    0
  );


  // =========================
  // TOTAL CATEGORIA
  // =========================

  const totalCategoria =
    despesasFiltradas.reduce(
      (acc, d) =>
        acc + Number(d.valor),
      0
    );


  // =========================
  // ANOS DISPONÍVEIS
  // =========================

  const anosDisponiveis = [
    ...new Set(
      despesas.map(
        (d) =>
          new Date(
            d.created_at
          ).getFullYear()
      )
    ),
  ];

  if (
    !anosDisponiveis.includes(
      hoje.getFullYear()
    )
  ) {
    anosDisponiveis.push(
      hoje.getFullYear()
    );
  }

  anosDisponiveis.sort(
    (a, b) => b - a
  );

if (!session) {
  return mostrarRegisto ? (
    <Register
      onLogin={() => setMostrarRegisto(false)}
    />
  ) : (
    <Login
      onRegister={() => setMostrarRegisto(true)}
    />
  );
}

  return (
    <Dashboard
      despesas={despesas}
      despesasFiltradas={
        despesasFiltradas
      }
      total={total}
      totalCategoria={
        totalCategoria
      }
      categoriaAtiva={
        categoriaAtiva
      }
      setCategoriaAtiva={
        setCategoriaAtiva
      }
      categorias={categorias}
      meses={meses}
      mesSelecionado={
        mesSelecionado
      }
      setMesSelecionado={
        setMesSelecionado
      }
      anoSelecionado={
        anoSelecionado
      }
      setAnoSelecionado={
        setAnoSelecionado
      }
      anosDisponiveis={
        anosDisponiveis
      }
      adicionarDespesa={
        adicionarDespesa
      }
      eliminarDespesa={
        eliminarDespesa
      }
    />
  );
}

export default App;