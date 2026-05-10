"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ClipboardCheck, Database, GalleryHorizontalEnd, LayoutDashboard, Search, UserCircle } from "lucide-react";

const navItems = [
  { href: "/explore", label: "Explore", icon: Search },
  { href: "/saved", label: "Saved Canvases", icon: LayoutDashboard },
  { href: "/sources", label: "Sources", icon: Database },
  { href: "/gallery", label: "Gallery", icon: GalleryHorizontalEnd },
  { href: "/demo-readiness", label: "Demo", icon: ClipboardCheck }
];

export function Header() {
  const pathname = usePathname();
  const appEnvironment = process.env.NEXT_PUBLIC_APP_ENV;
  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION;
  const runtimeLabel = appEnvironment === "hosted-beta"
    ? "Hosted beta"
    : appEnvironment
      ? appEnvironment
      : null;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-civic-900 focus:shadow-panel focus:outline-none focus:ring-2 focus:ring-civic-500"
      >
        Skip to main content
      </a>
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5">
        <Link href="/explore" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm">
            <Image
              src="/brand/civiccanvas-mark.svg"
              alt="CivicCanvas logo"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
              priority
            />
          </div>
          <div>
            <div className="text-base font-semibold leading-5 text-ink">CivicCanvas</div>
            <div className="text-xs font-medium text-slate-500">Public data, cited visually</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-civic-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-civic-100 hover:text-civic-900"
                }`}
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
