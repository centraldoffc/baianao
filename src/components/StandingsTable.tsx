import Link from "next/link";

type StandingRow = {
  position: number;
  team: { name: string; shortName: string; slug: string; logoUrl?: string | null };
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
};

export default function StandingsTable({ rows }: { rows: StandingRow[] }) {
  return (
    <div className="overflow-x-auto rounded-ticket border border-ink-border">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-ink-border bg-ink-light text-left text-xs uppercase tracking-wide text-slate-light">
            <th className="px-3 py-3 font-medium">#</th>
            <th className="px-3 py-3 font-medium">Time</th>
            <th className="px-3 py-3 text-center font-medium">P</th>
            <th className="px-3 py-3 text-center font-medium">J</th>
            <th className="px-3 py-3 text-center font-medium">V</th>
            <th className="px-3 py-3 text-center font-medium">E</th>
            <th className="px-3 py-3 text-center font-medium">D</th>
            <th className="px-3 py-3 text-center font-medium">GP</th>
            <th className="px-3 py-3 text-center font-medium">GC</th>
            <th className="px-3 py-3 text-center font-medium">SG</th>
          </tr>
        </thead>
        <tbody className="font-mono">
          {rows.map((row, i) => (
            <tr
              key={row.team.slug}
              className={`border-b border-ink-border/60 last:border-0 ${
                i % 2 === 0 ? "bg-transparent" : "bg-ink-light/40"
              }`}
            >
              <td className="px-3 py-2.5 font-display text-base text-coral">
                {row.position}
              </td>
              <td className="px-3 py-2.5 font-body">
                <Link
                  href={`/times/${row.team.slug}`}
                  className="flex items-center gap-2 text-sand hover:text-turquoise"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-light text-[10px] font-display text-slate-light">
                    {row.team.shortName.slice(0, 3).toUpperCase()}
                  </span>
                  {row.team.name}
                </Link>
              </td>
              <td className="px-3 py-2.5 text-center text-gold">{row.points}</td>
              <td className="px-3 py-2.5 text-center">{row.played}</td>
              <td className="px-3 py-2.5 text-center">{row.wins}</td>
              <td className="px-3 py-2.5 text-center">{row.draws}</td>
              <td className="px-3 py-2.5 text-center">{row.losses}</td>
              <td className="px-3 py-2.5 text-center">{row.goalsFor}</td>
              <td className="px-3 py-2.5 text-center">{row.goalsAgainst}</td>
              <td className="px-3 py-2.5 text-center">
                {row.goalsFor - row.goalsAgainst}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={10} className="px-3 py-8 text-center text-slate-light">
                Classificação ainda não cadastrada para esta temporada.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
