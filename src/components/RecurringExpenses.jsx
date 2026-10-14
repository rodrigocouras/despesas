import { useEffect, useState } from "react";
import { proximaDataExecucao } from "../utils/recurringDates";
import { supabase } from "../supabaseClient";

function RecurringExpenses({ userId, categorias }) {
  const hoje = new Date();
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [diaMes, setDiaMes] = useState(String(hoje.getDate()));
  const [recorrencias, setRecorrencias] = useState([]);
  const [aCarregar, setACarregar] = useState(true);
  const [aGuardar, setAGuardar] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });

  useEffect(() => {
    let ativo = true;

    const carregar = async () => {
      setACarregar(true);

      const { data, error } = await supabase
        .from("despesas_recorrentes")
        .select("id, descricao, valor, categoria, dia_mes, proxima_execucao, ativo")
        .eq("user_id", userId)
        .order("proxima_execucao", { ascending: true });

      if (!ativo) return;

      if (error) {
        setMensagem({
          tipo: "erro",
          texto: `Não foi possível carregar as despesas recorrentes: ${error.message}`,
        });
      } else {
        setRecorrencias(data);
      }

      setACarregar(false);
    };

    carregar();

    return () => {
      ativo = false;
    };
  }, [userId]);

  const criarRecorrencia = async (event) => {
    event.preventDefault();
    const dia = Number(diaMes);
    const valorNumerico = Number(valor);

    if (!descricao.trim() || !Number.isFinite(valorNumerico) || valorNumerico <= 0) {
      setMensagem({
        tipo: "erro",
        texto: "Indica uma descrição e um valor superior a zero.",
      });
      return;
    }

    setAGuardar(true);
    setMensagem({ tipo: "", texto: "" });

    const novaRecorrencia = {
      user_id: userId,
      descricao: descricao.trim(),
      valor: valorNumerico,
      categoria,
      dia_mes: dia,
      proxima_execucao: proximaDataExecucao(dia),
      ativo: true,
    };

    try {
      const { data, error } = await supabase
        .from("despesas_recorrentes")
        .insert(novaRecorrencia)
        .select("id, descricao, valor, categoria, dia_mes, proxima_execucao, ativo")
        .single();

      if (error) {
        setMensagem({
          tipo: "erro",
          texto: `Não foi possível criar a recorrência: ${error.message}`,
        });
      } else {
        setRecorrencias((atuais) =>
          [...atuais, data].sort((a, b) =>
            a.proxima_execucao.localeCompare(b.proxima_execucao)
          )
        );
        setDescricao("");
        setValor("");
        setCategoria("");
        setDiaMes(String(new Date().getDate()));
        setMensagem({
          tipo: "sucesso",
          texto: "Despesa recorrente criada.",
        });
      }
    } catch (error) {
      setMensagem({
        tipo: "erro",
        texto: `Não foi possível criar a recorrência: ${error.message}`,
      });
    } finally {
      setAGuardar(false);
    }
  };

  const alterarEstado = async (recorrencia) => {
    setMensagem({ tipo: "", texto: "" });

    try {
      const { error } = await supabase
        .from("despesas_recorrentes")
        .update({ ativo: !recorrencia.ativo })
        .eq("id", recorrencia.id)
        .eq("user_id", userId);

      if (error) {
        setMensagem({
          tipo: "erro",
          texto: `Não foi possível atualizar a recorrência: ${error.message}`,
        });
        return;
      }

      setRecorrencias((atuais) =>
        atuais.map((item) =>
          item.id === recorrencia.id ? { ...item, ativo: !item.ativo } : item
        )
      );
      setMensagem({
        tipo: "sucesso",
        texto: recorrencia.ativo
          ? "Despesa recorrente pausada."
          : "Despesa recorrente reativada.",
      });
    } catch (error) {
      setMensagem({
        tipo: "erro",
        texto: `Não foi possível atualizar a recorrência: ${error.message}`,
      });
    }
  };

  const eliminarRecorrencia = async (recorrencia) => {
    try {
      const { error } = await supabase
        .from("despesas_recorrentes")
        .delete()
        .eq("id", recorrencia.id)
        .eq("user_id", userId);

      if (error) {
        setMensagem({
          tipo: "erro",
          texto: `Não foi possível eliminar a recorrência: ${error.message}`,
        });
        return;
      }

      setRecorrencias((atuais) =>
        atuais.filter((item) => item.id !== recorrencia.id)
      );
      setMensagem({ tipo: "sucesso", texto: "Despesa recorrente eliminada." });
    } catch (error) {
      setMensagem({
        tipo: "erro",
        texto: `Não foi possível eliminar a recorrência: ${error.message}`,
      });
    }
  };

  return (
    <section className="dashboard-card recurring-section">
      <div className="card-heading">
        <div>
          <h2>Despesas recorrentes</h2>
          <p>
            Cria uma despesa mensal automática. O Supabase verifica os vencimentos
            diariamente e recupera os que já passaram neste mês.
          </p>
        </div>
      </div>

      <form className="recurring-form" onSubmit={criarRecorrencia}>
        <div className="form-group">
          <label htmlFor="recorrente-descricao">Descrição</label>
          <input
            id="recorrente-descricao"
            type="text"
            value={descricao}
            onChange={(event) => setDescricao(event.target.value)}
            placeholder="Ex.: Renda"
            maxLength={120}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="recorrente-valor">Valor</label>
          <input
            id="recorrente-valor"
            type="number"
            min="0.01"
            step="0.01"
            value={valor}
            onChange={(event) => setValor(event.target.value)}
            placeholder="0,00"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="recorrente-categoria">Categoria</label>
          <select
            id="recorrente-categoria"
            value={categoria}
            onChange={(event) => setCategoria(event.target.value)}
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
          <label htmlFor="recorrente-dia">Dia do mês</label>
          <input
            id="recorrente-dia"
            type="number"
            min="1"
            max="31"
            value={diaMes}
            onChange={(event) => setDiaMes(event.target.value)}
            required
          />
        </div>

        <button type="submit" className="form-button" disabled={aGuardar}>
          {aGuardar ? "A guardar..." : "Criar recorrência"}
        </button>
      </form>

      {mensagem.texto && (
        <div
          className={`settings-message ${mensagem.tipo === "erro" ? "erro" : ""}`}
          role={mensagem.tipo === "erro" ? "alert" : "status"}
        >
          {mensagem.texto}
        </div>
      )}

      <div className="recurring-list">
        {aCarregar ? (
          <p className="recurring-empty" role="status">
            A carregar despesas recorrentes...
          </p>
        ) : recorrencias.length === 0 ? (
          <p className="recurring-empty">
            Ainda não configuraste despesas recorrentes.
          </p>
        ) : (
          recorrencias.map((recorrencia) => (
            <div className="recurring-item" key={recorrencia.id}>
              <div className="recurring-item-main">
                <strong>{recorrencia.descricao}</strong>
                <span>
                  {recorrencia.categoria} · {Number(recorrencia.valor).toFixed(2)} €
                  · dia {recorrencia.dia_mes}
                </span>
                <small>
                  {recorrencia.ativo
                    ? `Próxima criação: ${new Date(
                        `${recorrencia.proxima_execucao}T12:00:00`
                      ).toLocaleDateString("pt-PT")}`
                    : "Pausada"}
                </small>
              </div>
              <div className="recurring-item-actions">
                <button
                  type="button"
                  className="settings-button"
                  onClick={() => alterarEstado(recorrencia)}
                >
                  {recorrencia.ativo ? "Pausar" : "Reativar"}
                </button>
                <button
                  type="button"
                  className="expense-cancel-button"
                  onClick={() => eliminarRecorrencia(recorrencia)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default RecurringExpenses;
