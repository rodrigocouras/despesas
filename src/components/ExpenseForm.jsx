
import { useState } from "react";
import { categorias } from "../data/dashboardData";
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

  const {
  data: { user },
} = await supabase.auth.getUser();

const novaDespesa = {
  descricao,
  valor: parseFloat(valor),
  categoria,
  user_id: user.id,
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
    <form className="expense-form" onSubmit={handleSubmit}>

      <div className="form-group">
        <label>Descrição</label>

        <input
          type="text"
          placeholder="Ex.: Supermercado"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Valor</label>

        <div className="input-with-symbol">
          <input
            type="number"
            placeholder="0,00"
            step="0.01"
            min="0"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />

          <span>€</span>
        </div>
      </div>

      <div className="form-group">
        <label>Categoria</label>

        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
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

      <button type="submit" className="form-button">
        <span>+</span>
        Adicionar
      </button>

    </form>
  );
}

export default ExpenseForm;
