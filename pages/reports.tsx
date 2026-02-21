import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Movement {
  id: string;
  concept: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  date: string;
  user: { name: string | null };
}

export default function ReportsPage() {
  const { data: session, isPending } = authClient.useSession();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if ((session?.user as { role?: string })?.role === "ADMIN") {
      fetchMovements();
    }
  }, [session]);

  const fetchMovements = async () => {
    const res = await fetch("/api/movements");
    if (res.ok) {
      const data = await res.json();
      setMovements(data);
    }
    setLoading(false);
  };

  //Cálculos para el Dashboard
  const totalIncomes = movements.filter(m => m.type === "INCOME").reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = movements.filter(m => m.type === "EXPENSE").reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncomes - totalExpenses;

  // Datos para el Gráfico
  const chartData = [
    { name: "Ingresos", valor: totalIncomes, fill: "#15803d" }, 
    { name: "Egresos", valor: totalExpenses, fill: "#b91c1c" }  
  ];

  // Descargar el CSV
  const handleDownloadCSV = () => {
    const headers = ["Fecha", "Concepto", "Usuario", "Tipo", "Monto"];
    const rows = movements.map(m => {
      const date = new Date(m.date).toLocaleDateString();
      const userName = m.user?.name || "Desconocido";
      return `"${date}","${m.concept}","${userName}","${m.type}","${m.amount}"`;
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "reporte_financiero.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); 
  };

  if (isPending || loading) return <div className="p-10 font-sans text-lg">Generando reportes...</div>;

  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gray-50 p-10 font-sans flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
        <Link href="/" className="bg-black text-white px-6 py-2 rounded shadow hover:bg-gray-800 transition">
          Volver al Inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">📊 Reportes Financieros</h1>
        </div>

        {/* Tarjetas de Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-300">
            <h3 className="text-gray-600 text-sm font-bold uppercase">Total Ingresos</h3>
            <p className="text-2xl font-black text-green-700">${totalIncomes.toLocaleString("es-CO")}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-300">
            <h3 className="text-gray-600 text-sm font-bold uppercase">Total Egresos</h3>
            <p className="text-2xl font-black text-red-700">${totalExpenses.toLocaleString("es-CO")}</p>
          </div>
          <div className={`p-6 rounded-lg shadow border ${balance >= 0 ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
            <h3 className="text-gray-800 text-sm font-bold uppercase">Saldo Actual</h3>
            <p className={`text-3xl font-black ${balance >= 0 ? 'text-green-800' : 'text-red-800'}`}>
              ${balance.toLocaleString("es-CO")}
            </p>
          </div>
        </div>

        {/* Gráfico y Botón CSV */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Comparativa Visual</h2>
            <button 
              onClick={handleDownloadCSV}
              className="bg-black text-white px-4 py-2 rounded shadow hover:bg-gray-800 transition font-bold"
            >
              ⬇️ Descargar Reporte (CSV)
            </button>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: any) => `$${Number(value || 0).toLocaleString('es-CO')}`} />
                <Bar dataKey="valor" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}