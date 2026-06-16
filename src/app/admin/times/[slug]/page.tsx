import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TeamEditForm from "@/components/admin/TeamEditForm";
import SquadManager from "@/components/admin/SquadManager";
import { divisionLabels } from "@/lib/utils";

export default async function AdminTeamPage({ params }: { params: { slug: string } }) {
  const team = await prisma.team.findUnique({ where: { slug: params.slug } });
  if (!team) return notFound();

  const seasons = await prisma.season.findMany({
    include: { competition: true },
    orderBy: { year: "desc" },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="text-xs uppercase tracking-[0.3em] text-turquoise">Editar time</span>
        <h1 className="font-display text-2xl text-sand">{team.name}</h1>
      </div>

      <section>
        <h2 className="mb-3 font-display text-lg text-sand">Dados do clube</h2>
        <TeamEditForm team={team} />
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg text-sand">Elenco</h2>
        <SquadManager
          teamSlug={team.slug}
          seasons={seasons.map((s) => ({
            id: s.id,
            label: `${divisionLabels[s.competition.division]} ${s.year}`,
          }))}
        />
      </section>
    </div>
  );
}
