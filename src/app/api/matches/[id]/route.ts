import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canEditTeam, isAdmin } from "@/lib/permissions";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const match = await prisma.match.findUnique({
    where: { id: params.id },
    include: {
      homeTeam: true,
      awayTeam: true,
      stadium: true,
      round: true,
      season: { include: { competition: true } },
      broadcasts: true,
      lineups: { include: { player: true } },
    },
  });

  if (!match) {
    return NextResponse.json({ error: "Jogo não encontrado." }, { status: 404 });
  }

  return NextResponse.json({ match });
}

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
    return NextResponse.json({ error: "Sem permissão para editar este jogo." }, { status: 403 });
  }

  const body = await req.json();
  const allowedFields = ["status", "homeScore", "awayScore", "matchDateTime", "stadiumId"] as const;

  const data: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (key in body) {
      data[key] = key === "matchDateTime" && body[key] ? new Date(body[key]) : body[key];
    }
  }

  const updated = await prisma.match.update({ where: { id: params.id }, data });
  return NextResponse.json({ match: updated });
}
