export const calculateTotalIncomes = (movements: { type: string, amount: number }[]) => {
  return movements
    .filter(m => m.type === "INCOME")
    .reduce((total, m) => total + m.amount, 0);
};

export const calculateTotalExpenses = (movements: { type: string, amount: number }[]) => {
  return movements
    .filter(m => m.type === "EXPENSE")
    .reduce((total, m) => total + m.amount, 0);
};

export const calculateBalance = (incomes: number, expenses: number) => {
  return incomes - expenses;
};