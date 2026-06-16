import Link from "next/link";
import Badge from "@/components/Badge";
import { formatMatchDate, statusLabels, broadcastLabels } from "@/lib/utils";

type MatchCardData = {
  id: string;
  matchDateTime: Date | string;
  status: string;
  homeScore?: number | null;
  awayScore?: number | null;
  homeTeam: { name: string; shortName: string; slug: string };
  awayTeam: { name: string; shortName: string; slug: string };
  round?: { name: string } | null;
  broadcasts?: { channelName: string; type: string }[];
};

export default function MatchCard({ match }: { match: MatchCardData }) {
  const hasScore = match.homeScore != null && match.awayScore != null;
  const isLive = match.status === "EM_ANDAMENTO";

  return (
    <Link
      href={`/jogos/${match.id}`}
      className="ticket-card group block px-5 py-4 transition hover:border-coral/50"
    >
      <div className="flex items-center justify-between text-xs text-slate-light">
        <span>{match.round?.name ?? "Rodada"}</span>
        <span className="flex items-center gap-2">
          {isLive && (
            <span className="flex items-center gap-1 text-coral">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-coral" />
              AO VIVO
            </span>
          )}
          {!isLive && (
            <span>
              {match.status === "FINALIZADO"
                ? "Encerrado"
                : formatMatchDate(match.matchDateTime)}
            </span>
          )}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <TeamLine name={match.homeTeam.name} align="right" />

        <div className="flex flex-col items-center font-display text-2xl text-sand">
          {hasScore ? (
            <span>
              {match.homeScore} <span className="text-slate-light">x</span> {match.awayScore}
            </span>
          ) : (
            <span className="text-base text-slate-light">VS</span>
          )}
        </div>

        <TeamLine name={match.awayTeam.name} align="left" />
      </div>

      {match.broadcasts && match.broadcasts.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 border-t border-dashed border-ink-border pt-3">
          <span className="text-xs text-slate-light">Onde assistir:</span>
          {match.broadcasts.map((b, idx) => (
            <Badge key={idx} variant="turquoise">
              {b.channelName} · {broadcastLabels[b.type] ?? b.type}
            </Badge>
          ))}
        </div>
      )}

      {(!match.broadcasts || match.broadcasts.length === 0) && (
        <div className="mt-3 text-center text-xs text-slate-light">
          {statusLabels[match.status] ?? match.status} · transmissão a confirmar
        </div>
      )}
    </Link>
  );
}

function TeamLine({ name, align }: { name: string; align: "left" | "right" }) {
  return (
    <div
      className={`flex items-center gap-2 ${
        align === "right" ? "justify-end text-right" : "justify-start text-left"
      }`}
    >
      <span className={`text-sm font-medium text-sand ${align === "right" ? "order-2" : "order-2"}`}>
        {name}
      </span>
      <span className="order-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-light text-[11px] font-display text-slate-light">
        {name.slice(0, 3).toUpperCase()}
      </span>
    </div>
  );
}
