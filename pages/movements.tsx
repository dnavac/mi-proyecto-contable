import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import {toast} from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

  const [isFormOpen, setIsFormOpen] = useState(false);

  const today = new Date().toISOString().split("T")[0]; // Fecha actual en formato YYYY-MM-DD
  
  // Estado para el formulario
  const [formData, setFormData] = useState({
    concept: "",
    amount: "",
    type: "INCOME",
    date: today,
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
    if (!formData.amount || !formData.concept) {
      toast.warning("Por favor completa todos los campos");
      return;
    }

    const cleanAmount = formData.amount.replace(/\./g, ""); // Eliminar puntos

    try {
      const res = await fetch("/api/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            concept: formData.concept,
            type: formData.type,
            amount: cleanAmount, // Enviamos el monto limpio sin puntos
            date: formData.date,
         }),
      });

      if (res.ok) {
        setFormData({ concept: "", amount: "", type: "INCOME", date: today }); // Limpiar formulario
        fetchMovements(); //Recargar tabla
        setIsFormOpen(false);
        toast.success("Movimiento guardado con éxito");
      } else {
        const error = await res.json();
        toast.error("Error: " + error.error);
      }
    } catch (err) {
      toast.error("Error de conexión");
    }
  };

  if (loading) return <div className="text-slate-500 font-medium text-lg flex justify-center py-12">Cargando movimientos...</div>;

  return (
    <div className="font-sans">

      {/* Botón de Volver */}
      <div className="mb-4">
        <Link 
          href="/" 
          className="flex items-center gap-2 w-fit px-3 py-2 text-sm font-medium text-slate-600 rounded-md hover:bg-slate-100 hover:text-slate-900 transition-all"
        >
          ← Volver al menú
        </Link>
      </div>
      
      {/* Encabezado con Título y Botón "Nuevo" */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">💰 Ingresos y Egresos</h1>
        
        {/* El botón solo aparece si es ADMIN y el formulario NO está abierto */}
        {(session?.user as { role?: string })?.role === "ADMIN" && !isFormOpen && (
          <Button onClick={() => setIsFormOpen(true)} className="bg-slate-900 hover:bg-slate-800">
            + Nuevo Movimiento
          </Button>
        )}
      </div>

      {/* Formulario Desplegable (Solo visible si isFormOpen es true) */}
      {(session?.user as { role?: string })?.role === "ADMIN" && isFormOpen && (
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-slate-200 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Registrar Operación</h2>
            <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-700 mb-1">Concepto</label>
              <Input
                type="text"
                placeholder="Ej. Pago de servicios"
                value={formData.concept}
                onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
              />
            </div>
            
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-slate-700 mb-1">Monto</label>
              <Input
                type="text"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  setFormData({ ...formData, amount: val });
                }}
                onBlur={() => {
                  if (formData.amount) {
                    const val = Number(formData.amount.replace(/\./g, ""));
                    setFormData({ ...formData, amount: val.toLocaleString("es-CO") });
                  }
                }}
                onFocus={() => {
                  if (formData.amount) {
                    const val = formData.amount.replace(/\./g, "");
                    setFormData({ ...formData, amount: val });
                  }
                }} 
              />
            </div>

            <div className="flex-1 min-w-[140px]">
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
              <Input
                type="date"
                value={formData.date || ""}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            {/* ----------------------------- */}

            <div className="flex-1 min-w-[140px]">
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="INCOME">Ingreso (+)</option>
                <option value="EXPENSE">Egreso (-)</option>
              </select>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <Button type="submit" className="h-10 bg-slate-900 hover:bg-slate-800 text-white">
                Guardar
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="h-10 bg-slate-900 hover:bg-slate-800 text-white">
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Concepto</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Monto</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Usuario</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {movements.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-slate-500 font-medium">
                  No hay movimientos registrados aún.
                </td>
              </tr>
            ) : (
              movements.map((mov) => (
                <tr key={mov.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">
                    {mov.concept}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-black ${
                    mov.type === "INCOME" ? "text-emerald-600" : "text-rose-600"
                  }`}>
                    {mov.type === "INCOME" ? "+" : "-"} ${mov.amount.toLocaleString('es-CO')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-500">
                    {new Date(mov.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600 flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                      {mov.user?.name ? mov.user.name.charAt(0).toUpperCase() : "?"}
                    </div>
                    {mov.user?.name || "Desconocido"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
    </div>
  );
}