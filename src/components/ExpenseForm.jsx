
import { useState } from "react";
import { categorias, iconesEstacao, meses } from "../data/dashboardData";
import { supabase } from "../supabaseClient";
import { guardarDespesa } from "../utils/expenses";

const obterPeriodoLocal = () => {
  const hoje = new Date();
  return {
    mes: String(hoje.getMonth()),
    ano: String(hoje.getFullYear()),
  };
};

function ExpenseForm({ onAddExpense }) {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [periodoDespesa, setPeriodoDespesa] = useState(obterPeriodoLocal);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !descricao.trim() ||
      !valor ||
      !categoria ||
      periodoDespesa.mes === "" ||
      periodoDespesa.ano === ""
    ) {
      alert("Preenche todos os campos");
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert(userError?.message || "Não foi possível identificar a tua conta.");
      return;
    }

    const mes = Number(periodoDespesa.mes);
    const ano = Number(periodoDespesa.ano);
    const dataComHoraLocal = new Date(ano, mes, 1, 12);
    if (
      Number.isNaN(dataComHoraLocal.getTime()) ||
      dataComHoraLocal.getDate() !== 1 ||
      dataComHoraLocal.getMonth() !== mes ||
      dataComHoraLocal.getFullYear() !== ano
    ) {
      alert("Seleciona um mês válido.");
      return;
    }

    const novaDespesa = {
      descricao: descricao.trim(),
      valor: parseFloat(valor),
      categoria,
      user_id: user.id,
      created_at: dataComHoraLocal.toISOString(),
    };

    try {
      await guardarDespesa(supabase, novaDespesa, onAddExpense);
    } catch (error) {
      console.error("Erro ao guardar despesa:", error);
      alert(`Erro ao guardar despesa: ${error.message}`);
      return;
    }

    setDescricao("");
    setValor("");
    setCategoria("");
    setPeriodoDespesa(obterPeriodoLocal());
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
          onChange={(e) => setDescricao(e.target.value)}
          maxLength={120}
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
            onChange={(e) => setValor(e.target.value)}
            required
          />
          <span>€</span>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="nova-despesa-categoria">Categoria</label>
        <select
          id="nova-despesa-categoria"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          required
        >
          <option value="">Selecionar categoria</option>
          {categorias
            .filter((item) => item.nome !== "Todas")
            .map((item) => (
              <option key={item.nome} value={item.nome}>
                {item.icone} {item.nome}
              </option>
            ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="nova-despesa-mes">Mês</label>
        <select
          id="nova-despesa-mes"
          value={periodoDespesa.mes}
          onChange={(e) =>
            setPeriodoDespesa((periodo) => ({
              ...periodo,
              mes: e.target.value,
            }))
          }
          required
        >
          {meses.map((mes, index) => (
            <option key={mes} value={index}>
              {iconesEstacao[index]} {mes}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="nova-despesa-ano">Ano</label>
        <select
          id="nova-despesa-ano"
          value={periodoDespesa.ano}
          onChange={(e) =>
            setPeriodoDespesa((periodo) => ({
              ...periodo,
              ano: e.target.value,
            }))
          }
          required
        >
          {Array.from(
            { length: 12 },
            (_, index) => new Date().getFullYear() + 1 - index
          ).map((ano) => (
            <option key={ano} value={ano}>
              {ano}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="form-button">
        <span>+</span>
        Adicionar
      </button>
    </form>
  );
}

export default ExpenseForm;
