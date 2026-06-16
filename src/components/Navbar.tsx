import Link from "next/link";

const links = [
  { href: "/campeonato/serie-a", label: "Série A" },
  { href: "/campeonato/serie-b", label: "Série B" },
  { href: "/times", label: "Times" },
  { href: "/transferencias", label: "Transferências" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-border bg-ink/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-coral font-display text-lg text-ink">
            B
          </span>
          <span className="font-display text-xl tracking-wide text-sand">
            BAIAN<span className="text-coral">ÃO</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-slate-light md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="transition hover:text-sand">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-full border border-ink-border px-4 py-1.5 text-sm text-sand transition hover:border-turquoise hover:text-turquoise"
          >
            Entrar
          </Link>
        </div>
      </div>
    </header>
  );
}
