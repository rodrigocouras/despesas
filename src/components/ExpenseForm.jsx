import { useState } from "react";
import Select from "./Select";
import { categorias } from "../data/dashboardData";
import { supabase } from "../supabaseClient";
import { guardarDespesa } from "../utils/expenses";

const LIMITE_CATEGORIAS_RECENTES = 3;

const obterDataLocal = () => {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
};

const chaveCategoriasRecentes = (userId) =>
  `despesas:categorias-recentes:${userId}`;

const obterCategoriasRecentes = (userId) => {
  try {
    const guardadas = JSON.parse(
      window.localStorage.getItem(chaveCategoriasRecentes(userId)) || "[]",
    );
    const categoriasValidas = new Set(
      categorias.filter((item) => item.nome !== "Todas").map((item) => item.nome),
    );

    return Array.isArray(guardadas)
      ? guardadas
          .filter((categoria) => categoriasValidas.has(categoria))
          .slice(0, LIMITE_CATEGORIAS_RECENTES)
      : [];
  } catch {
    return [];
  }
};

function ExpenseForm({ userId, onAddExpense }) {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState(
    () => obterCategoriasRecentes(userId)[0] || "",
  );
  const [dataDespesa, setDataDespesa] = useState(obterDataLocal);
  const [categoriasRecentes, setCategoriasRecentes] = useState(
    () => obterCategoriasRecentes(userId),
  );
  const [aGuardar, setAGuardar] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });

  const selecionarCategoria = (nomeCategoria) => {
    setCategoria(nomeCategoria);
    setMensagem({ tipo: "", texto: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMensagem({ tipo: "", texto: "" });

    const descricaoLimpa = descricao.trim();
    const valorNumerico = Number(valor);
    const dataComHoraLocal = new Date(`${dataDespesa}T12:00:00`);
    const [ano, mes, dia] = dataDespesa.split("-").map(Number);
    if (
      !descricaoLimpa ||
      !Number.isFinite(valorNumerico) ||
      valorNumerico <= 0 ||
      !dataDespesa ||
      Number.isNaN(dataComHoraLocal.getTime()) ||
      dataComHoraLocal.getFullYear() !== ano ||
      dataComHoraLocal.getMonth() !== mes - 1 ||
      dataComHoraLocal.getDate() !== dia ||
      !categorias.some((item) => item.nome === categoria)
    ) {
      setMensagem({
        tipo: "erro",
        texto: "Confirma a descrição, o valor, a categoria e uma data válida.",
      });
      return;
    }

    setAGuardar(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(userError?.message || "Não foi possível identificar a tua conta.");
      }

      const novaDespesa = {
        descricao: descricaoLimpa,
        valor: valorNumerico,
        categoria,
        user_id: user.id,
        created_at: dataComHoraLocal.toISOString(),
      };

      await guardarDespesa(supabase, novaDespesa, onAddExpense);

      const atualizadas = [
        categoria,
        ...categoriasRecentes.filter((item) => item !== categoria),
      ].slice(0, LIMITE_CATEGORIAS_RECENTES);
      setCategoriasRecentes(atualizadas);
      try {
        window.localStorage.setItem(
          chaveCategoriasRecentes(userId),
          JSON.stringify(atualizadas),
        );
      } catch {
        // The recent-category shortcuts remain available for this session.
      }

      setDescricao("");
      setValor("");
      setDataDespesa(obterDataLocal());
      setMensagem({ tipo: "sucesso", texto: "Despesa guardada." });
    } catch (error) {
      console.error("Erro ao guardar despesa:", error);
      setMensagem({
        tipo: "erro",
        texto: `Não foi possível guardar a despesa: ${error.message}`,
      });
    } finally {
      setAGuardar(false);
    }
  };

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="nova-despesa-descricao">Descrição</label>
        <input
          id="nova-despesa-descricao"
          type="text"
          placeholder="Ex.: Supermercado"
          value={descricao}
          onChange={(event) => {
            setDescricao(event.target.value);
            setMensagem({ tipo: "", texto: "" });
          }}
          maxLength={120}
          disabled={aGuardar}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="nova-despesa-valor">Valor</label>
        <div className="input-with-symbol">
          <input
            id="nova-despesa-valor"
            type="number"
            placeholder="0,00"
            step="0.01"
            min="0.01"
            value={valor}
            onChange={(event) => {
              setValor(event.target.value);
              setMensagem({ tipo: "", texto: "" });
            }}
            disabled={aGuardar}
            required
          />
          <span>€</span>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="nova-despesa-categoria">Categoria</label>
        <Select
          id="nova-despesa-categoria"
          value={categoria}
          onChange={(event) => selecionarCategoria(event.target.value)}
          disabled={aGuardar}
          required
        >
          <option value="">📂 Selecionar categoria</option>
          {categorias
            .filter((item) => item.nome !== "Todas")
            .map((item) => (
              <option key={item.nome} value={item.nome}>
                {item.icone} {item.nome}
              </option>
            ))}
        </Select>
      </div>

      <div className="form-group">
        <label htmlFor="nova-despesa-data">Data</label>
        <input
          id="nova-despesa-data"
          type="date"
          value={dataDespesa}
          onChange={(event) => {
            setDataDespesa(event.target.value);
            setMensagem({ tipo: "", texto: "" });
          }}
          disabled={aGuardar}
          required
        />
      </div>

      <button type="submit" className="form-button" disabled={aGuardar}>
        <span>+</span>
        {aGuardar ? "A guardar..." : "Adicionar"}
      </button>

      {categoriasRecentes.length > 0 && (
        <div className="expense-recent-categories" aria-label="Categorias recentes">
          <span>Usadas recentemente</span>
          {categoriasRecentes.map((nomeCategoria) => {
            const categoriaRecente = categorias.find(
              (item) => item.nome === nomeCategoria,
            );
            return (
              <button
                key={nomeCategoria}
                type="button"
                className={`expense-recent-category ${
                  categoria === nomeCategoria ? "is-selected" : ""
                }`}
                aria-pressed={categoria === nomeCategoria}
                disabled={aGuardar}
                onClick={() => selecionarCategoria(nomeCategoria)}
              >
                {categoriaRecente?.icone} {nomeCategoria}
              </button>
            );
          })}
        </div>
      )}

      {mensagem.texto && (
        <p
          className={`expense-form-feedback is-${mensagem.tipo}`}
          role={mensagem.tipo === "erro" ? "alert" : "status"}
        >
          {mensagem.texto}
        </p>
      )}
    </form>
  );
}

export default ExpenseForm;
