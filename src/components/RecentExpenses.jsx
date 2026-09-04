function RecentExpenses({ despesas }) {

  function formatarData(data) {
    return new Date(data).toLocaleDateString(
      "pt-PT",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  return (
    <div className="expenses-list">

      {despesas.map((despesa) => (

        <div
          className="expense-row"
          key={despesa.id}
        >

          <div className="expense-main">

            <div className="expense-icon">
              €
            </div>

            <div>
              <strong>
                {despesa.descricao}
              </strong>

              <span>
                {despesa.categoria || "Outros"}
              </span>
            </div>

          </div>

          <span className="expense-date">
            {formatarData(despesa.created_at)}
          </span>

          <strong className="expense-value">
            -{Number(despesa.valor).toFixed(2)} €
          </strong>

        </div>

      ))}

      {despesas.length === 0 && (
        <p className="empty">
          Ainda não tens despesas.
        </p>
      )}

    </div>
  );
}

export default RecentExpenses;