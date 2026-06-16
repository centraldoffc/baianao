type LineupPlayer = {
  id: string;
  isStarter: boolean;
  position: string;
  shirtNumber?: number | null;
  player: { id: string; name: string };
};

// Ordem das linhas do campo, do gol até o ataque
const POSITION_ORDER = ["Goleiro", "Zagueiro", "Lateral", "Meio-campo", "Atacante"];

function groupByPosition(players: LineupPlayer[]) {
  const groups = new Map<string, LineupPlayer[]>();
  for (const p of players) {
    const key = p.position || "Outros";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }
  const ordered = [...groups.entries()].sort((a, b) => {
    const ia = POSITION_ORDER.indexOf(a[0]);
    const ib = POSITION_ORDER.indexOf(b[0]);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
  return ordered;
}

export default function LineupField({
  teamName,
  players,
}: {
  teamName: string;
  players: LineupPlayer[];
}) {
  const starters = players.filter((p) => p.isStarter);
  const bench = players.filter((p) => !p.isStarter);
  const rows = groupByPosition(starters);

  return (
    <div>
      <h3 className="mb-3 font-display text-lg text-sand">{teamName}</h3>

      {/* Campo */}
      <div className="flex flex-col gap-4 rounded-ticket border border-ink-border bg-gradient-to-b from-turquoise-dark/20 to-turquoise-dark/5 p-4">
        {rows.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-light">
            Escalação ainda não divulgada.
          </p>
        )}
        {rows.map(([position, group]) => (
          <div key={position} className="flex flex-wrap justify-center gap-3">
            {group.map((p) => (
              <div
                key={p.id}
                className="flex w-20 flex-col items-center gap-1 text-center"
                title={p.position}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-border bg-ink font-mono text-sm text-gold">
                  {p.shirtNumber ?? "-"}
                </span>
                <span className="line-clamp-2 text-[11px] leading-tight text-sand">
                  {p.player.name}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Banco */}
      {bench.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs uppercase tracking-wide text-slate-light">
            Banco de reservas
          </p>
          <ul className="flex flex-wrap gap-2 text-xs text-sand">
            {bench.map((p) => (
              <li
                key={p.id}
                className="rounded-full border border-ink-border bg-ink-light px-3 py-1"
              >
                <span className="font-mono text-gold">{p.shirtNumber ?? "-"}</span> {p.player.name}
                <span className="text-slate-light"> · {p.position}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
