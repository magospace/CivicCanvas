"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ClipboardCheck, Database, GalleryHorizontalEnd, LayoutDashboard, Menu, Search, UserCircle, X } from "lucide-react";

const navItems = [
  { href: "/explore", label: "Explore", icon: Search },
  { href: "/saved", label: "Saved Canvases", icon: LayoutDashboard },
  { href: "/sources", label: "Sources", icon: Database },
  { href: "/gallery", label: "Gallery", icon: GalleryHorizontalEnd },
  { href: "/demo-readiness", label: "Demo", icon: ClipboardCheck }
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const appEnvironment = process.env.NEXT_PUBLIC_APP_ENV;
  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION;
  const runtimeLabel = appEnvironment === "hosted-beta"
    ? "Hosted beta"
    : appEnvironment
      ? appEnvironment
      : null;

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileMenuOpen]);

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
          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-controls="mobile-navigation"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-civic-500 hover:text-civic-900 focus:border-civic-500 focus:outline-none focus:ring-2 focus:ring-civic-500 md:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm">
            <UserCircle className="h-4 w-4" />
            No account mode
          </span>
        </div>
      </div>
      <nav
        id="mobile-navigation"
        aria-label="Mobile navigation"
        className={`${mobileMenuOpen ? "grid" : "hidden"} border-t border-slate-200 bg-white px-5 py-3 shadow-sm md:hidden`}
      >
        <div className="grid gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-civic-500 ${
                  isActive
                    ? "bg-civic-900 text-white shadow-sm"
                    : "text-slate-700 hover:bg-civic-100 hover:text-civic-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
