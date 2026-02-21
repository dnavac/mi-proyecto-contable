import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session } = authClient.useSession();

  const handleLogout = async () => {
    await authClient.signOut();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Barra de Navegación Superior */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-black text-xl tracking-tight text-slate-800 flex items-center gap-2">
            <span className="bg-black text-white px-2 py-1 rounded-md text-sm">SC</span>
            SisContable
          </Link>

          <nav className="flex items-center gap-6">
            {session ? (
              <>
                {/* Menú de Usuario Desplegable */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-slate-200 hover:bg-slate-100 p-0">
                      <Avatar className="h-9 w-9">
                        {/* Intentamos cargar la foto de GitHub, si falla ponemos la primera letra de su nombre */}
                        <AvatarImage src={session.user.image || ""} alt={session.user.name} />
                        <AvatarFallback className="bg-slate-800 text-white font-bold">
                          {session.user.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-bold leading-none text-slate-800">{session.user.name}</p>
                        <p className="text-xs leading-none text-slate-500">
                          {session.user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer font-medium" 
                      onClick={handleLogout}
                    >
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

              </>
            ) : (
              <span className="text-sm font-medium text-slate-500">Bienvenido</span>
            )}
          </nav>
        </div>
      </header>

      {/* Contenido Dinámico de cada página */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-8 w-full">
        {children}
      </main>
    </div>
  );
}