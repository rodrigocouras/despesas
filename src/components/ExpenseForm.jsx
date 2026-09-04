import { useState } from "react";
import { supabase } from "../supabaseClient";

function ExpenseForm({ onAddExpense }) {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!descricao || !valor || !categoria) {
      alert("Preenche todos os campos");
      return;
    }

    const novaDespesa = {
      descricao,
      valor: parseFloat(valor),
      categoria,
    };

    const { data, error } = await supabase
      .from("despesas")
      .insert([novaDespesa])
      .select();

    if (error) {
      console.error("Erro:", error);
      alert("Erro ao guardar despesa");
      return;
    }

    onAddExpense(data[0]);

    setDescricao("");
    setValor("");
    setCategoria("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Adicionar Despesa</h2>

      <input
        type="text"
        placeholder="Descrição"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
      />

      <input
        type="number"
        placeholder="Valor"
        step="0.01"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
      />

      <select
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
      >
        <option value="">Seleciona uma categoria</option>
        <option value="Combustível">⛽ Combustível</option>
        <option value="Mercado">🛒 Mercado</option>
        <option value="Saídas">🎉 Saídas</option>
        <option value="Jantares">🍽️ Jantares</option>
        <option value="Outros">📦 Outros</option>
      </select>

      <button type="submit">
        Adicionar despesa
      </button>
    </form>
  );
}

export default ExpenseForm;