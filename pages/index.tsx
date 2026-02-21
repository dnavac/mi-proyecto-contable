import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  const { data: session, isPending } = authClient.useSession();

  const handleLogin = async () => {
    await authClient.signIn.social({ provider: "github" });
  };

  if (isPending) return <p className="p-10 text-center text-slate-500 font-medium animate-pulse">Cargando sistema...</p>;

  return (
    <div className="flex flex-col items-center py-4">
      
      {/* Cabecera Principal */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl mb-4">
          Sistema Contable
        </h1>
      </div>

      {!session ? (
        // --- VISTA PARA USUARIOS NO LOGUEADOS ---
        <Card className="w-full max-w-md shadow-sm border-slate-200">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Acceso al Sistema</CardTitle>
            <CardDescription>Inicia sesión para comenzar</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <Button onClick={handleLogin} className="w-full h-12 text-md font-semibold bg-slate-900 hover:bg-slate-800 text-white">
              Iniciar sesión con GitHub
            </Button>
          </CardContent>
        </Card>
      ) : (
        // --- VISTA MENU PRINCIPAL ---
        <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* INFO del Usuario */}
          <div className="mb-8 p-6 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-800">¡Hola, {session.user.name}! 👋</h2>
              <p className="text-slate-500 mt-1">
                Tu nivel de acceso es: <span className="font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md text-xs">{session.user.role}</span>
              </p>
            </div>
          </div>

          <h3 className="text-xl font-bold text-slate-800 mb-4">Menú Principal</h3>
          
          {/* Grid del Menú */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/*MODULO DE INGRESO Y GASTOS para TODOS LOS ROLES */}
            <Link href="/movements" className="block group">
              <Card className="h-full transition-all hover:shadow-md hover:border-slate-400 cursor-pointer">
                <CardHeader>
                  <div className="text-4xl mb-3">💰</div>
                  <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">Ingresos y Gastos</CardTitle>
                  <CardDescription>Registra y visualiza todos los movimientos de dinero</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            {/* Módulo GESTION DE USUARIO (SOLO PARA ADMIN) */}
            {session.user.role === "ADMIN" && (
              <Link href="/users" className="block group">
                <Card className="h-full transition-all hover:shadow-md hover:border-slate-400 cursor-pointer">
                  <CardHeader>
                    <div className="text-4xl mb-3">👥</div>
                    <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">Gestión de Usuarios</CardTitle>
                    <CardDescription>Administra los permisos, roles y accesos de la plataforma.</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            )}

            {/*Módulo de DASHBOARD (SOLO PARA ADMIN) */}
            {session.user.role === "ADMIN" && (
              <Link href="/reports" className="block group">
                <Card className="h-full transition-all hover:shadow-md hover:border-slate-400 cursor-pointer">
                  <CardHeader>
                    <div className="text-4xl mb-3">📊</div>
                    <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">Reportes y Dashboard</CardTitle>
                    <CardDescription>Visualiza métricas financieras y descarga los balances en CSV.</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            )}

          </div>
        </div>
      )}
    </div>
  );
}