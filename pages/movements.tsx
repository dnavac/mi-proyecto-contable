import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

// Definimos qué forma tiene un  Movimiento para tener tipado en el frontend
interface Movement {
  id: string;
  concept: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  date: string;
  user: { name: string | null };
}

export default function MovementsPage() {
  const { data: session } = authClient.useSession(); // ¿Quién está conectado?
  const [movements, setMovements] = useState<Movement[]>([]); // Lista de movimientos
  const [loading, setLoading] = useState(true);
  
  // Estado para el formulario
  const [formData, setFormData] = useState({
    concept: "",
    amount: "",
    type: "INCOME",
  });

  //Cargar los movimientos al entrar a la página
  useEffect(() => {
    fetchMovements();
  }, []);

  const fetchMovements = async () => {
    const res = await fetch("/api/movements");
    if (res.ok) {
      const data = await res.json();
      setMovements(data);
    }
    setLoading(false);
  };

  //Guardar un nuevo movimiento (Solo si eres ADMIN)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.concept) return;

    try {
      const res = await fetch("/api/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({ concept: "", amount: "", type: "INCOME" }); // Limpiar form
        fetchMovements(); //Recargar tabla
        alert("¡Movimiento guardado!");
      } else {
        const error = await res.json();
        alert("Error: " + error.error);
      }
    } catch (err) {
      alert("Error de conexión");
    }
  };

  if (loading) return <div className="p-10">Cargando movimientos...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Encabezado y Navegación */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">💰 Ingresos y Egresos</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            ← Volver al Inicio
          </Link>
        </div>

        {/* Formulario (SOLO VISIBLE PARA ADMIN) */}
        {session?.user.role === "ADMIN" ? (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Nuevo Movimiento</h2>
            <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700">Concepto</label>
                <input
                  type="text"
                  placeholder="Ej. Venta de software"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-900"
                  value={formData.concept}
                  onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Monto</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-900"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo</label>
                <select
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="INCOME">Ingreso (+)</option>
                  <option value="EXPENSE">Egreso (-)</option>
                </select>
              </div>
              <button
                type="submit"
                className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition h-10"
              >
                Guardar
              </button>
            </form>
          </div>
        ) : (
          <div className="mb-8 p-4 bg-yellow-100 text-yellow-800 rounded">
            👀 Solo puedes ver los movimientos. Para agregar, necesitas ser Administrador.
          </div>
        )}

        {/* Tabla de Resultados */}
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-300">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Concepto</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-800 uppercase tracking-wider">Monto</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-6 text-center text-gray-700 font-medium text-lg">
                    No hay movimientos registrados aún.
                  </td>
                </tr>
              ) : (
                movements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                      {new Date(mov.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {mov.concept}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                      {mov.user?.name || "Desconocido"}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-black ${
                      mov.type === "INCOME" ? "text-green-700" : "text-red-700"
                    }`}>
                      {mov.type === "INCOME" ? "+" : "-"} ${mov.amount}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}