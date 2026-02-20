import { authClient } from "@/lib/auth-client";

export default function Home() {
  const { data: session, isPending } = authClient.useSession();

  const handleLogin = async () => {
    await authClient.signIn.social({
      provider: "github",
    });
  };

  const handleLogout = async () => {
    await authClient.signOut();
  };

  if (isPending) return <p className="p-10 text-xl">Cargando...</p>;

  return (
    <div className="p-10 font-sans">
      <h1 className="text-3xl font-bold mb-6">Prueba Técnica: Sistema Contable</h1>

      {!session ? (
        <div className="bg-gray-100 p-6 rounded-lg max-w-sm">
          <p className="mb-4 text-gray-700">No has iniciado sesión.</p>
          <button
            onClick={handleLogin}
            className="bg-black text-white px-4 py-2 rounded shadow hover:bg-gray-800 transition"
          >
            Iniciar sesión con GitHub
          </button>
        </div>
      ) : (
        <div className="bg-green-100 p-6 rounded-lg max-w-md border border-green-300">
          <p className="text-green-800 font-semibold text-lg mb-2">
            ¡Hola, {session.user.name}! 👋
          </p>
          <p className="text-sm text-green-700 mb-4">
            Tu rol actual es: <span className="font-bold bg-green-200 px-2 py-1 rounded">{session.user.role}</span>
          </p>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 transition"
          >
            Cerrar sesión
          </button>
            <div className="my-4">
              <a href="/movements" className="text-blue-600 underline text-lg font-semibold">
                Ir a Gestión de Ingresos y Gastos →
              </a>
            </div>
            <div className="my-2">
              <a href="/users" className="text-blue-600 underline text-lg font-semibold">
                Ir a Gestión de Usuarios →
              </a>
            </div>
            <div className="my-2">
              <a href="/reports" className="text-blue-600 underline text-lg font-semibold">
                Ir a Reportes Financieros →
              </a>
            </div>
        </div>
      )}
    </div>
  );
}