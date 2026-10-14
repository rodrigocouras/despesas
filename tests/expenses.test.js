import assert from "node:assert/strict";
import test from "node:test";
import { guardarDespesa } from "../src/utils/expenses.js";

test("envia a despesa inserida como objeto para atualizar a interface", async () => {
  const despesa = {
    descricao: "Supermercado",
    valor: 24.5,
    categoria: "Mercado",
  };
  const despesaGuardada = { ...despesa, id: "expense-1" };
  let despesaRecebida;
  let tabelaConsultada;
  let valoresInseridos;

  const clienteSupabase = {
    from(tabela) {
      tabelaConsultada = tabela;
      return {
        insert(valores) {
          valoresInseridos = valores;
          return {
            select() {
              return {
                async single() {
                  return { data: despesaGuardada, error: null };
                },
              };
            },
          };
        },
      };
    },
  };

  await guardarDespesa(clienteSupabase, despesa, (resultado) => {
    despesaRecebida = resultado;
  });

  assert.equal(tabelaConsultada, "despesas");
  assert.deepEqual(valoresInseridos, [despesa]);
  assert.equal(despesaRecebida, despesaGuardada);
  assert.equal(Array.isArray(despesaRecebida), false);
});

test("não atualiza a interface quando o Supabase devolve um erro", async () => {
  let interfaceAtualizada = false;
  const clienteSupabase = {
    from() {
      return {
        insert() {
          return {
            select() {
              return {
                async single() {
                  return { data: null, error: new Error("Falha de teste") };
                },
              };
            },
          };
        },
      };
    },
  };

  await assert.rejects(
    guardarDespesa(clienteSupabase, {}, () => {
      interfaceAtualizada = true;
    }),
    /Falha de teste/
  );
  assert.equal(interfaceAtualizada, false);
});
