import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner"; 
import { Button } from "@/components/ui/button"; 
import { Input } from "@/components/ui/input";

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
  
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<string>("");   // estado para el rol editable
  const [newName, setNewName] = useState<string>("");  // estado para el nombre editable

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

  // Función para enviar ambos datos
  const handleUpdateUser = async (userId: string) => {
    if (!newName.trim()) {
      toast.warning("El nombre no puede estar vacío");
      return;
    }

    const res = await fetch("/api/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, newRole, newName }), // Enviamos nombre y rol
    });

    if (res.ok) {
      toast.success("Usuario actualizado correctamente"); 
      setEditingUserId(null);
      fetchUsers(); 
    } else {
      toast.error("Error al actualizar el usuario"); 
    }
  };

  if (isPending || loading) return <div className="p-10 font-sans text-lg text-slate-500 flex justify-center">Cargando usuarios...</div>;

  if (session?.user.role !== "ADMIN") {
    return (
      <div className="p-10 font-sans flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-bold text-rose-600 mb-4">Acceso Denegado</h1>
        <p className="text-slate-600 mb-6">No tienes permisos de Administrador para ver esta página.</p>
      </div>
    );
  }

  return (
    <div className="font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">👥 Gestión de Usuarios</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Correo</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Teléfono</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                
                {/*NOMBRE(editable)*/}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">
                  {editingUserId === u.id ? (
                    <Input 
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="h-8 text-sm w-full max-w-[200px]"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                        {u.name ? u.name.charAt(0).toUpperCase() : "?"}
                      </div>
                      {u.name || "Sin nombre"}
                    </div>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">
                  {u.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">
                  {u.phone || "N/A"}
                </td>
                
                {/* ROL(Editable)*/}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  {editingUserId === u.id ? (
                    <select 
                      className="h-8 w-28 rounded-md border border-slate-300 bg-white px-2 text-sm shadow-sm hover:border-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 cursor-pointer transition-all animate-in fade-in"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="USER">USER</option>
                    </select>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm border ${
                      u.role === "ADMIN" 
                        ? "bg-indigo-50 text-indigo-700 border-indigo-200" 
                        : "bg-slate-100 text-slate-700 border-slate-200"
                    }`}>
                      {u.role}
                    </span>
                  )}
                </td>
                
                {/* ACCIONES */}
                <td className="px-6 py-4 whitespace-nowrap text-left">
                  {editingUserId === u.id ? (
                    <div className="flex items-center justify-start gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
                      <Button 
                        onClick={() => handleUpdateUser(u.id)} 
                        size="sm" 
                        className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
                      >
                        Guardar
                      </Button>
                      <Button 
                        onClick={() => setEditingUserId(null)} 
                        variant="outline" 
                        size="sm"
                        className="h-8 px-3 text-xs border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-sm transition-all"
                      >
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="ghost"
                      size="sm"
                      onClick={() => { 
                        setEditingUserId(u.id); 
                        setNewRole(u.role); 
                        setNewName(u.name || ""); // Cargamos el nombre actual al abrir la edición
                      }}
                      disabled={session.user.id === u.id}
                      className={`h-8 px-2 text-xs font-semibold transition-all ${
                        session.user.id === u.id 
                          ? "text-slate-400 bg-transparent" 
                          : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      }`}
                    >
                      {session.user.id === u.id ? "Tu Cuenta" : "✏️ Editar"}
                    </Button>
                  )}
                </td>
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}