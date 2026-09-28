# Despliegue — Vercel + Supabase

Arquitectura: el frontend (Vue) se sirve como sitio estático y el backend (NestJS)
corre como función serverless de Vercel (`api/[...path].ts`), ambos bajo el mismo
dominio. La base de datos es PostgreSQL de Supabase.

## 1. Obtener la URL de conexión de Supabase

1. Entra a tu proyecto en [supabase.com](https://supabase.com).
2. **Project Settings → Database → Connection string → URI**, y elige el
   **Session pooler** (puerto **5432**, host tipo `aws-0-<región>.pooler.supabase.com`).
   Es el recomendado para esta app: soporta todo lo que usa el backend
   (incluido el `synchronize` inicial) y multiplexa conexiones.
3. Reemplaza `[YOUR-PASSWORD]` por la contraseña real de la base.
   **Importante:** si la contraseña tiene caracteres especiales (`@`, `#`, `%`,
   espacios…), deben ir codificados en la URL (`@` → `%40`, etc.).

Queda algo así:

```
postgresql://postgres.abc123:Tu%40Password@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

> No uses la conexión "Direct" (`db.xxx.supabase.co`): usa IPv6 y desde Vercel
> suele fallar.

## 2. Preparar la base de datos (recomendado, 1 minuto)

Desde la raíz del proyecto, con esa URL aplica el esquema y el seed una única vez:

```bash
# Git Bash (Windows) / Linux / macOS
cd backend
DATABASE_URL="postgresql://postgres.abc123:Tu%40Password@aws-0-...pooler.supabase.com:5432/postgres" npm run db:push

# PowerShell
$env:DATABASE_URL="postgresql://..."; npm run db:push
```

Al final verás `Seed completo: "Análisis de supervisión..." (7 escenarios)`.

(No es estrictamente obligatorio: la primera invocación de la función en Vercel
ejecuta lo mismo, pero hacerlo antes evita una primera request lenta o una
condición de carrera entre dos arranques simultáneos.)

## 3. Subir el repo a GitHub

El proyecto ya tiene git inicializado con un commit. Crea un repo vacío en
GitHub y:

```bash
git remote add origin https://github.com/<tu-usuario>/campus-asfi.git
git push -u origin main
```

## 4. Desplegar en Vercel

1. [vercel.com/new](https://vercel.com/new) → importa el repo `campus-asfi`.
2. Vercel lee automáticamente `vercel.json` (build, output y funciones ya están
   configurados; no cambies el Root Directory).
3. Antes de desplegar, en **Environment Variables** agrega:

   | Nombre | Valor |
   |---|---|
   | `DATABASE_URL` | la URL de Supabase del paso 1 |

   Marca al menos **Production** (y Preview si quieres probar ramas).
4. **Deploy**.

### Alternativa sin GitHub (CLI)

```bash
npm i -g vercel
vercel login
npx vercel env add DATABASE_URL production   # pega la URL cuando la pida
npx vercel --prod
```

## 5. Verificar

- Abre `https://<tu-proyecto>.vercel.app/` → debe listar la simulación.
- Complétala de punta a punta; el resultado final confirma la conexión a Supabase
  (los intentos quedan guardados ahí — puedes verlos en Supabase → Table Editor).

## Notas y límites del plan gratuito

- **Cold starts:** la primera request tras un rato de inactividad tarda unos
  segundos (arranca Nest + conecta a la DB). Es normal en serverless.
- **Pausa de Supabase free:** proyectos gratuitos se pausan tras ~1 semana sin
  tráfico. Se reactivan con *Restore* en el dashboard (los datos no se pierden).
- **Ver logs del backend:** Vercel → proyecto → Deployments → Functions/Logs.
- Si tras desplegar la primera llamada a `/api/...` da 500, reintenta una vez:
  casi siempre es la carrera entre dos cold starts creando las tablas a la vez
  (o evítala con el paso 2).
