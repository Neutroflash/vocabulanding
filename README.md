# Vocabulanding

Plataforma web gamificada para reforzar vocabulario y gramática del inglés en estudiantes de secundaria. Versión demo.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind 4 · PostgreSQL · Drizzle ORM.

## Desarrollo local

Requisitos: Node 20.12+ y Docker.

```bash
npm install
cp .env.example .env.local   # completa SESSION_SECRET y TEACHER_PASSWORD
docker compose up -d         # Postgres en el puerto 5433
npm run db:migrate           # crea las tablas
npm run db:seed              # crea la cuenta docente
npm run dev                  # http://localhost:3000
```

Los alumnos se registran desde la app. La cuenta docente solo se crea con `db:seed`, usando `TEACHER_USERNAME` y `TEACHER_PASSWORD`.

## Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | ESLint |
| `npm run db:generate` | Genera una migración a partir de `src/db/schema.ts` |
| `npm run db:migrate` | Aplica las migraciones pendientes |
| `npm run db:seed` | Crea o actualiza la cuenta docente |

## Deploy (Vercel + Neon)

1. Crea una base de datos en Neon y copia la cadena de conexión *pooled*.
2. Aplica el esquema y crea la docente desde tu máquina:
   ```bash
   DATABASE_URL="<cadena de Neon>" npm run db:migrate
   DATABASE_URL="<cadena de Neon>" TEACHER_USERNAME=profesora TEACHER_PASSWORD="<clave>" npm run db:seed
   ```
3. Importa el repo en Vercel y define `DATABASE_URL` y `SESSION_SECRET` como variables de entorno.

## Estructura

```
src/app/            páginas: /, /login, /signup, /learn (alumno), /teacher (docente)
src/app/actions/    server actions (registro, login, logout)
src/components/     componentes de interfaz
src/db/             esquema y conexión a la base de datos
src/lib/            sesión (cookie firmada) y control de acceso
drizzle/            migraciones SQL
scripts/            seed de la cuenta docente
```
