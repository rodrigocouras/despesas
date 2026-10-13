export const categorias = [
  { nome: "Todas", icone: "📋" },
  { nome: "Habitação", icone: "🏠" },
  { nome: "Contas", icone: "💡" },
  { nome: "Transportes", icone: "🚆" },
  { nome: "Combustível", icone: "⛽" },
  { nome: "Mercado", icone: "🛒" },
  { nome: "Saúde", icone: "🩺" },
  { nome: "Educação", icone: "📚" },
  { nome: "Saídas", icone: "🎉" },
  { nome: "Jantares", icone: "🍽️" },
  { nome: "Poupança", icone: "🐖" },
  { nome: "Outros", icone: "📦" },
];

export const meses = [
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

export const formatCurrency = (value) => `${Number(value || 0).toFixed(2)} €`;
