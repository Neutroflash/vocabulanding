import { logout } from "@/app/actions/auth";
import { Logo } from "./logo";

export function AppHeader({ name, badge }: { name: string; badge?: string }) {
  return (
    <header className="sticky top-0 z-10 border-b-2 border-line bg-surface">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <Logo />
        <div className="flex items-center gap-3">
          <span className="hidden text-sm font-bold text-muted sm:inline">
            {name}
            {badge && (
              <span className="ml-2 rounded-full bg-brand-soft px-2.5 py-1 text-xs text-brand">{badge}</span>
            )}
          </span>
          <form action={logout}>
            <button type="submit" className="btn btn-ghost btn-sm">
              Salir
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
