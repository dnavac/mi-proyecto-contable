import { calculateTotalIncomes, calculateTotalExpenses, calculateBalance } from "../lib/calculations";

describe("Lógica Financiera del Sistema Contable", () => {
  
  // Simulamos movimientos de prueba
  const mockMovements = [
    { type: "INCOME", amount: 100000 },
    { type: "EXPENSE", amount: 30000 },
    { type: "INCOME", amount: 50000 },
  ];

  // Prueba 1
  it("1. Debe sumar correctamente solo los ingresos (INCOME)", () => {
    const totalIncomes = calculateTotalIncomes(mockMovements);
    expect(totalIncomes).toBe(150000); // 100k + 50k
  });

  // Prueba 2
  it("2. Debe sumar correctamente solo los egresos (EXPENSE)", () => {
    const totalExpenses = calculateTotalExpenses(mockMovements);
    expect(totalExpenses).toBe(30000);
  });

  // Prueba 3
  it("3. Debe calcular el saldo exacto (Ingresos - Egresos)", () => {
    const incomes = 150000;
    const expenses = 30000;
    const balance = calculateBalance(incomes, expenses);
    expect(balance).toBe(120000);
  });
});