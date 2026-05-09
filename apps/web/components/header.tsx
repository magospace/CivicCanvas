import Link from "next/link";
import { Database, LayoutDashboard, Search, UserCircle } from "lucide-react";

const navItems = [
  { href: "/explore", label: "Explore", icon: Search },
  { href: "/saved", label: "Saved Canvases", icon: LayoutDashboard },
  { href: "/sources", label: "Sources", icon: Database }
];

export function Header() {
  const appEnvironment = process.env.NEXT_PUBLIC_APP_ENV;
  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION;
  const runtimeLabel = appEnvironment === "hosted-beta"
    ? "Hosted beta"
    : appEnvironment
      ? appEnvironment
      : null;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5">
        <Link href="/explore" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-civic-900 text-white">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div>
            <div className="text-base font-semibold leading-5 text-ink">Texas Data Canvas</div>
            <div className="text-xs font-medium text-slate-500">Public data, cited visually</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-civic-100 hover:text-civic-900"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          {runtimeLabel ? (
            <span className="hidden rounded-md bg-civic-100 px-2.5 py-1 text-xs font-semibold text-civic-700 md:inline-flex">
              {runtimeLabel}{appVersion ? ` / ${appVersion}` : ""}
            </span>
          ) : null}
          <button className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm">
            <UserCircle className="h-4 w-4" />
            No account mode
          </button>
        </div>
      </div>
    </header>
  );
}
