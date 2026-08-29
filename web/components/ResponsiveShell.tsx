"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, CalendarDays, ClipboardList, Users, Building2, LogOut } from "lucide-react";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/reservations", label: "Reservas", icon: CalendarDays },
  { href: "/tasks", label: "Tareas", icon: ClipboardList },
  { href: "/providers", label: "Proveedores", icon: Users },
  { href: "/properties", label: "Propiedades", icon: Building2 },
];

export function ResponsiveShell({ children, userName }: { children: React.ReactNode; userName?: string | null }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background md:flex">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-gray-200 bg-white md:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="h-8 w-8 rounded-lg bg-primary" />
          <span className="text-lg font-semibold text-foreground">HostSync</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} active={pathname === item.href} />
          ))}
        </nav>
        <div className="border-t border-gray-200 p-3">
          <p className="truncate px-2 text-xs text-gray-500">{userName}</p>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mt-1 flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesion
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:hidden">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary" />
            <span className="font-semibold text-foreground">HostSync</span>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="text-gray-500">
            <LogOut className="h-5 w-5" />
          </button>
        </header>

        <main className="flex-1 px-4 py-4 pb-24 sm:px-6 md:pb-6">{children}</main>

        <nav
          className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-gray-200 bg-white md:hidden"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {NAV_ITEMS.map((item) => (
            <MobileNavLink key={item.href} item={item} active={pathname === item.href} />
          ))}
        </nav>
      </div>
    </div>
  );
}

type NavItem = (typeof NAV_ITEMS)[number];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100",
      )}
    >
      <Icon className="h-4 w-4" />
      {item.label}
    </Link>
  );
}

function MobileNavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-center text-[10.5px] font-medium leading-tight transition-colors active:bg-gray-50",
        active ? "text-primary" : "text-gray-500",
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}
