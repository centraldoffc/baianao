import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canEditTeam, isAdmin } from "@/lib/permissions";
import { z } from "zod";

const broadcastSchema = z.object({
  broadcasts: z.array(
    z.object({
      channelName: z.string().min(1),
      type: z.enum(["TV_ABERTA", "TV_FECHADA", "STREAMING", "RADIO"]),
      url: z.string().url().optional().nullable(),
    })
  ),
});

// PUT /api/matches/:id/broadcast -> substitui a lista de transmissões do jogo
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  const match = await prisma.match.findUnique({ where: { id: params.id } });
  if (!match) {
    return NextResponse.json({ error: "Jogo não encontrado." }, { status: 404 });
  }

  const allowed =
    (await isAdmin(userId)) ||
    (await canEditTeam(userId, match.homeTeamId)) ||
    (await canEditTeam(userId, match.awayTeamId));

  if (!allowed) {
    return NextResponse.json({ error: "Sem permissão para editar a transmissão." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = broadcastSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.broadcast.deleteMany({ where: { matchId: params.id } }),
    prisma.broadcast.createMany({
      data: parsed.data.broadcasts.map((b) => ({
        matchId: params.id,
        channelName: b.channelName,
        type: b.type,
        url: b.url ?? undefined,
      })),
    }),
  ]);

  const broadcasts = await prisma.broadcast.findMany({ where: { matchId: params.id } });
  return NextResponse.json({ broadcasts });
}
