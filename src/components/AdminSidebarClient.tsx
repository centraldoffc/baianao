"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Dashboard", icon: "▦" },
  { href: "/admin/times", label: "Times", icon: "🛡" },
  { href: "/admin/jogadores", label: "Jogadores", icon: "👤" },
  { href: "/admin/jogos", label: "Jogos", icon: "⚽" },
  { href: "/admin/transferencias", label: "Transferências", icon: "⇄" },
  { href: "/admin/colaboradores", label: "Colaboradores", icon: "✓" },
];

export default function AdminSidebarClient() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 md:w-56">
      <p className="mb-3 px-2 font-display text-sm uppercase tracking-widest text-slate-light">
        Painel Admin
      </p>
      <nav className="flex flex-row gap-1 overflow-x-auto md:flex-col md:overflow-visible">
        {items.map((item) => {
          const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition ${
                isActive
                  ? "bg-coral/15 text-coral"
                  : "text-slate-light hover:bg-ink-light hover:text-sand"
              }`}
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
