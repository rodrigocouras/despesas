import assert from "node:assert/strict";
import test from "node:test";
import { proximaDataExecucao } from "../src/utils/recurringDates.js";

test("mantém no mês atual uma recorrência cujo dia já passou", () => {
  const hoje = new Date(2026, 9, 14);

  assert.equal(proximaDataExecucao(13, hoje), "2026-10-13");
});

test("usa o dia escolhido quando ainda está por chegar neste mês", () => {
  const hoje = new Date(2026, 9, 10);

  assert.equal(proximaDataExecucao(20, hoje), "2026-10-20");
});

test("limita o dia 31 ao último dia do mês", () => {
  const hoje = new Date(2026, 3, 1);

  assert.equal(proximaDataExecucao(31, hoje), "2026-04-30");
});

test("respeita fevereiro em anos bissextos", () => {
  const hoje = new Date(2028, 1, 1);

  assert.equal(proximaDataExecucao(31, hoje), "2028-02-29");
});

test("rejeita dias fora do intervalo permitido", () => {
  const hoje = new Date(2026, 9, 14);

  assert.throws(() => proximaDataExecucao(0, hoje), RangeError);
  assert.throws(() => proximaDataExecucao(32, hoje), RangeError);
  assert.throws(() => proximaDataExecucao(1.5, hoje), RangeError);
});
