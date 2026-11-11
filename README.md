# Vocabulanding

Plataforma web gamificada para reforzar vocabulario y gramática del inglés en estudiantes de secundaria. Versión demo. La interfaz está en inglés.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind 4 · PostgreSQL · Drizzle ORM.

## Qué incluye

- **Registro e inicio de sesión** con usuario y contraseña. Los alumnos se registran solos; la cuenta docente se crea con un script.
- **Ruta de aprendizaje** con 3 módulos y 3 juegos por módulo.
- **Tres juegos**, todos con puntos, corazones, racha, sonidos y lectura en voz alta:

  | Juego | Ronda | Corazones | Puntaje máximo |
  |---|---|---|---|
  | Fill in the blank | 10 preguntas al azar | 3, uno por error | 170 |
  | Memory Game | 6 pares palabra-imagen | 5, uno por fallar con una carta ya vista | 90 |
  | Hangman | 5 palabras, 6 errores por palabra | 3, uno por palabra fallada | 70 |

  Cada acierto vale 10 puntos más un bono por racha (12, 14… hasta 20).
- **Dashboard docente** con el progreso de la clase, puntajes por juego y detalle por alumno. Se actualiza cada 15 segundos.

El puntaje nunca se toma del navegador: el servidor recibe las respuestas y lo recalcula con las mismas reglas (`src/lib/choice.ts`, `memory.ts`, `hangman.ts`).

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

## Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | ESLint |
| `npm run db:generate` | Genera una migración a partir de `src/db/schema.ts` |
| `npm run db:migrate` | Aplica las migraciones pendientes |
| `npm run db:seed` | Crea o actualiza la cuenta docente (`TEACHER_USERNAME`, `TEACHER_PASSWORD`) |
| `npm run db:demo` | Crea una clase de ejemplo de 12 alumnos con partidas |
| `npm run db:demo -- --clear` | Borra la clase de ejemplo |

La clase de ejemplo solo toca cuentas cuyo usuario empieza con `demo_`.

## Contenido

El vocabulario y las preguntas están en `src/content/modules/`, un archivo por módulo. Para agregar una palabra o una pregunta basta con editar ese archivo; los juegos y el dashboard la toman solos.

```ts
vocab: [{ word: "teacher", emoji: "🧑‍🏫" }],
questions: [{ prompt: "She is ___ nurse.", options: ["a", "an", "the"], answer: 0 }],
```

`answer` es la posición de la opción correcta, empezando en 0. Las entradas marcadas como "pending teacher review" en esos archivos deben ser validadas por el equipo docente.

## Deploy (Vercel + Neon)

1. Crea una base de datos en Neon y copia la cadena de conexión *pooled*.
2. Aplica el esquema y crea la docente desde tu máquina:
   ```bash
   DATABASE_URL="<cadena de Neon>" npm run db:migrate
   DATABASE_URL="<cadena de Neon>" TEACHER_USERNAME=profesora TEACHER_PASSWORD="<clave>" npm run db:seed
   ```
3. Importa el repo en Vercel y define `DATABASE_URL` y `SESSION_SECRET` como variables de entorno.

Cada push a `main` se despliega solo. Si cambia `src/db/schema.ts`, hay que volver a correr `db:migrate` contra Neon.

## Estructura

```
src/app/            páginas: /, /login, /signup, /learn (alumno), /teacher (docente)
src/app/actions/    server actions: autenticación y guardado de partidas
src/components/     juegos e interfaz
src/content/        módulos, vocabulario y preguntas
src/db/             esquema y conexión a la base de datos
src/lib/            reglas de los juegos, sesión, progreso y consultas del dashboard
drizzle/            migraciones SQL
scripts/            cuenta docente y clase de ejemplo
```

## Limitaciones conocidas de la demo

- **Audio:** usa la voz del navegador, que cambia según el dispositivo. No son grabaciones nativas.
- **Imágenes:** son emojis, no ilustraciones propias.
- **Contraseñas:** no hay recuperación; si un alumno la olvida, debe crear otra cuenta.
- **Una sola clase:** todos los alumnos pertenecen al mismo grupo y hay una única cuenta docente.
- **Sin pruebas automatizadas** en el repositorio.
