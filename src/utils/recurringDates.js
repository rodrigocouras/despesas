const dataLocalISO = (data) =>
  `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(
    data.getDate()
  ).padStart(2, "0")}`;

export const proximaDataExecucao = (diaMes, hoje = new Date()) => {
  if (!Number.isInteger(diaMes) || diaMes < 1 || diaMes > 31) {
    throw new RangeError("O dia da recorrência deve estar entre 1 e 31.");
  }

  const ultimoDiaEsteMes = new Date(
    hoje.getFullYear(),
    hoje.getMonth() + 1,
    0
  ).getDate();
  const data = new Date(
    hoje.getFullYear(),
    hoje.getMonth(),
    Math.min(diaMes, ultimoDiaEsteMes)
  );

  return dataLocalISO(data);
};
