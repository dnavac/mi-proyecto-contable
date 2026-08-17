# Sistema contable

Aplicación web para registrar y consultar los movimientos de dinero de un negocio: ingresos, egresos y saldo disponible. Este proyecto nació como una prueba técnica y fue construido para demostrar un flujo completo, desde el inicio de sesión hasta el almacenamiento de información y la generación de reportes.

## El reto

Construir un sistema contable sencillo, pero suficientemente realista para cubrir estas necesidades:

- Permitir que una persona inicie sesión de forma segura.
- Registrar ingresos y egresos con concepto, monto y fecha.
- Diferenciar los permisos de administradores y usuarios.
- Mostrar la información financiera de forma fácil de entender.
- Permitir consultar los datos desde una API documentada.

## Resultado

El resultado es un sistema con autenticación mediante GitHub y dos niveles de acceso:

- **ADMIN:** puede registrar movimientos, consultar el dashboard, descargar el reporte en CSV y administrar nombres y roles de usuarios.
- **USER:** puede iniciar sesión y consultar los movimientos registrados.

El sistema cuenta con una pantalla de inicio, un módulo de ingresos y egresos, una sección de gestión de usuarios, un dashboard con totales y gráfica comparativa, exportación a CSV y documentación interactiva de la API en `/docs`.

## ¿Cómo está construido?

En términos simples, la aplicación está dividida en tres partes:

1. **La interfaz:** las pantallas que ve la persona usuaria. Está construida con React y Next.js, y usa Tailwind CSS junto con componentes de Shadcn UI.
2. **La lógica del servidor:** recibe las solicitudes para iniciar sesión, consultar movimientos, crear registros y actualizar usuarios. Está implementada con las API Routes de Next.js.
3. **La base de datos:** guarda usuarios, sesiones, cuentas de GitHub y movimientos. PostgreSQL almacena la información y Prisma facilita la comunicación entre la aplicación y la base de datos.

La autenticación se realiza con Better Auth y GitHub OAuth. La autorización se valida en el servidor, por lo que no depende únicamente de ocultar botones en la interfaz.

## Tecnologías

- Next.js 16 con Pages Router y React 19
- TypeScript
- Tailwind CSS y Shadcn UI
- API Routes de Next.js
- PostgreSQL y Prisma ORM
- Better Auth con GitHub OAuth
- Recharts para la gráfica del dashboard
- Swagger UI para documentar la API
- Jest para pruebas unitarias

## Ejecutar el proyecto en local

### Requisitos

- Node.js 20 o superior
- npm
- Una base de datos PostgreSQL. Puedes usar una instancia local o un proveedor como Supabase.
- Una aplicación OAuth de GitHub para probar el inicio de sesión.

### 1. Instalar dependencias

Desde la carpeta que contiene este README:

```bash
npm install
```

### 2. Crear las variables de entorno

Crea un archivo `.env` en la raíz del proyecto. No lo subas al repositorio.

```env
DATABASE_URL="postgresql://USUARIO:CONTRASENA@HOST:5432/NOMBRE_BASE_DE_DATOS"
GITHUB_CLIENT_ID="tu_client_id"
GITHUB_CLIENT_SECRET="tu_client_secret"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

En GitHub, configura como callback de autorización:

```text
http://localhost:3000/api/auth/callback/github
```

Si usas Supabase, copia la cadena de conexión de PostgreSQL desde la configuración del proyecto. Para conexiones desde tu equipo suele ser más estable usar el pooler de Supabase.

### 3. Crear las tablas

Genera el cliente de Prisma y sincroniza el esquema con la base de datos:

```bash
npx prisma generate
npx prisma db push
```

`db push` es suficiente para levantar esta versión del proyecto porque el esquema se encuentra en `prisma/schema.prisma` y el repositorio no incluye migraciones.

### 4. Iniciar la aplicación

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). La documentación de los endpoints está disponible en [http://localhost:3000/docs](http://localhost:3000/docs).

### 5. Probar el flujo principal

1. Inicia sesión con GitHub.
2. Entra en **Ingresos y Egresos** y registra un ingreso y un egreso.
3. Revisa **Reportes y Dashboard** para ver totales, saldo y gráfica.
4. Descarga el reporte CSV.
5. En **Gestión de Usuarios**, cambia el rol de un usuario de prueba y comprueba los permisos.

## Comandos disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Compilación de producción
npm run start    # Iniciar la compilación de producción
npm run lint     # Revisar problemas de ESLint
npm test         # Ejecutar pruebas unitarias
```

## Publicarlo temporalmente para grabar la demo

Para tomar capturas o grabar un video, la opción más rápida es levantar el proyecto en local y compartirlo temporalmente con un túnel como ngrok o Cloudflare Tunnel.

Primero inicia la aplicación:

```bash
npm run dev
```

Luego, en otra terminal, ejecuta por ejemplo:

```bash
ngrok http 3000
```

Usa la URL HTTPS que te entregue el túnel para mostrar la aplicación. En ese caso debes actualizar temporalmente estas variables y el callback de GitHub para que apunten a esa URL:

```env
BETTER_AUTH_URL="https://tu-url-publica"
NEXT_PUBLIC_APP_URL="https://tu-url-publica"
```

Callback de GitHub:

```text
https://tu-url-publica/api/auth/callback/github
```

Reinicia el servidor después de cambiar el `.env`. Esta opción es adecuada para una demo; para dejar el proyecto disponible de forma permanente necesitas desplegar la aplicación y mantener una base de datos PostgreSQL accesible.

## Notas

- El primer usuario creado por Better Auth queda con el rol `ADMIN` según la configuración actual.
- No compartas las variables de entorno ni las credenciales de GitHub.
- Los datos de la demo se guardan en la base de datos configurada, así que puedes usar registros ficticios para grabar el video.
