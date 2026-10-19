export const getBudgetStatus = (spent, limit) => {
  const percentage = limit > 0 ? (spent / limit) * 100 : 0;
  const isOverBudget = limit > 0 && spent > limit;

  return {
    percentage,
    isOverBudget,
    isNearBudget: !isOverBudget && limit > 0 && percentage >= 80,
    remaining: limit - spent,
    overage: Math.max(0, spent - limit),
  };
};
