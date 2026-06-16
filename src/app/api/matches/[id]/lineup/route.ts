import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canEditTeam } from "@/lib/permissions";
import { z } from "zod";

const lineupSchema = z.object({
  teamId: z.string(),
  players: z.array(
    z.object({
      playerId: z.string(),
      isStarter: z.boolean().default(true),
      position: z.string(),
      shirtNumber: z.number().int().optional().nullable(),
    })
  ),
});

// PUT /api/matches/:id/lineup -> substitui a escalação de um time no jogo
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  const body = await req.json();
  const parsed = lineupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { teamId, players } = parsed.data;

  if (!(await canEditTeam(userId, teamId))) {
    return NextResponse.json(
      { error: "Sem permissão para editar a escalação deste time." },
      { status: 403 }
    );
  }

  await prisma.$transaction([
    prisma.lineup.deleteMany({ where: { matchId: params.id, teamId } }),
    prisma.lineup.createMany({
      data: players.map((p) => ({
        matchId: params.id,
        teamId,
        playerId: p.playerId,
        isStarter: p.isStarter,
        position: p.position,
        shirtNumber: p.shirtNumber ?? undefined,
      })),
    }),
  ]);

  const lineup = await prisma.lineup.findMany({
    where: { matchId: params.id, teamId },
    include: { player: true },
  });

  return NextResponse.json({ lineup });
}
