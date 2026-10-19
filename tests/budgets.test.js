import assert from "node:assert/strict";
import test from "node:test";
import { getBudgetStatus } from "../src/utils/budgets.js";

test("assinala limites a partir de 80 por cento como próximos", () => {
  assert.deepEqual(getBudgetStatus(79, 100), {
    percentage: 79,
    isOverBudget: false,
    isNearBudget: false,
    remaining: 21,
    overage: 0,
  });
  assert.deepEqual(getBudgetStatus(80, 100), {
    percentage: 80,
    isOverBudget: false,
    isNearBudget: true,
    remaining: 20,
    overage: 0,
  });
});

test("assinala valores acima do limite e não alerta quando não há limite", () => {
  assert.deepEqual(getBudgetStatus(120, 100), {
    percentage: 120,
    isOverBudget: true,
    isNearBudget: false,
    remaining: -20,
    overage: 20,
  });
  assert.deepEqual(getBudgetStatus(50, 0), {
    percentage: 0,
    isOverBudget: false,
    isNearBudget: false,
    remaining: -50,
    overage: 50,
  });
});
