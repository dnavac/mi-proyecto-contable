import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
}

export default function UsersPage() {
  const { data: session, isPending } = authClient.useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para manejar la edición de roles
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<string>("");

  useEffect(() => {
    if (session?.user.role === "ADMIN") {
      fetchUsers();
    }
  }, [session]);

  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    }
    setLoading(false);
  };

  const handleUpdateRole = async (userId: string) => {
    const res = await fetch("/api/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, newRole }),
    });

    if (res.ok) {
      alert("Rol actualizado correctamente");
      setEditingUserId(null);
      fetchUsers();
    } else {
      alert("Error al actualizar el rol");
    }
  };

  // Si está cargando o validando la sesión
  if (isPending || loading) return <div className="p-10 font-sans text-lg">Cargando usuarios...</div>;

  // Protección de la ruta en el frontend
  if (session?.user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gray-50 p-10 font-sans flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
        <p className="text-gray-700 mb-6">No tienes permisos de Administrador para ver esta página.</p>
        <Link href="/" className="bg-black text-white px-6 py-2 rounded shadow hover:bg-gray-800 transition">
          Volver al Inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">👥 Gestión de Usuarios</h1>
          <Link href="/" className="text-blue-600 hover:underline font-semibold">
            ← Volver al Inicio
          </Link>
        </div>
        {/* Tabla de Usuarios */}
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-300">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Correo</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Teléfono</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {u.name || "Sin nombre"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                    {u.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                    {u.phone || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <span className={`px-3 py-1 rounded text-xs font-black ${
                      u.role === "ADMIN" ? "bg-purple-200 text-purple-900" : "bg-gray-200 text-gray-800"
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    
                    {/* Lógica para alternar entre Modo Edición y Modo Normal */}
                    {editingUserId === u.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <select 
                          className="border border-gray-400 rounded p-1 text-gray-900 font-medium"
                          value={newRole}
                          onChange={(e) => setNewRole(e.target.value)}
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="USER">USER</option>
                        </select>
                        <button onClick={() => handleUpdateRole(u.id)} className="bg-green-600 text-white px-3 py-1 rounded font-bold hover:bg-green-700">
                          Guardar
                        </button>
                        <button onClick={() => setEditingUserId(null)} className="bg-gray-300 text-gray-800 px-3 py-1 rounded font-bold hover:bg-gray-400">
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => { setEditingUserId(u.id); setNewRole(u.role); }}
                        className="text-blue-600 hover:text-blue-800 font-bold underline"
                        disabled={session.user.id === u.id} // Evita quitarte el rol ADMIN a ti mismo
                      >
                        {session.user.id === u.id ? "Tu Cuenta" : "Editar Rol"}
                      </button>
                    )}

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}