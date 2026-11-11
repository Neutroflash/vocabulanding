import { asc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireTeacher } from "@/lib/dal";

export const metadata: Metadata = { title: "Panel docente · Vocabulanding" };

const dateFormat = new Intl.DateTimeFormat("es-PE", {
  dateStyle: "medium",
  timeZone: "America/Lima",
});

export default async function TeacherPage() {
  const teacher = await requireTeacher();

  const students = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.role, "student"))
    .orderBy(asc(users.displayName));

  return (
    <>
      <AppHeader name={teacher.displayName} badge="Docente" />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
        <div>
          <h1 className="text-3xl font-black">Panel docente</h1>
          <p className="mt-1 text-muted">
            {students.length === 1 ? "1 alumno registrado" : `${students.length} alumnos registrados`}
          </p>
        </div>

        {students.length === 0 ? (
          <div className="card p-6 text-muted">
            Aún no hay alumnos. Cuando se registren, aparecerán aquí.
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b-2 border-line text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Alumno</th>
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Registro</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-bold">{student.displayName}</td>
                    <td className="px-4 py-3 text-muted">{student.username}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted">
                      {dateFormat.format(student.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
