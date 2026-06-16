import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canEditTeam, isAdmin } from "@/lib/permissions";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const player = await prisma.player.findUnique({
    where: { id: params.id },
    include: {
      squadMemberships: {
        include: { team: true, season: { include: { competition: true } } },
        orderBy: { season: { year: "desc" } },
      },
      transfers: {
        include: { fromTeam: true, toTeam: true },
        orderBy: { transferDate: "desc" },
      },
    },
  });

  if (!player) {
    return NextResponse.json({ error: "Jogador não encontrado." }, { status: 404 });
  }

  return NextResponse.json({ player });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  // Permite edição se admin geral ou colaborador de algum time atual do jogador
  const player = await prisma.player.findUnique({
    where: { id: params.id },
    include: { squadMemberships: { select: { teamId: true } } },
  });
  if (!player) {
    return NextResponse.json({ error: "Jogador não encontrado." }, { status: 404 });
  }

  let allowed = await isAdmin(userId);
  if (!allowed) {
    for (const m of player.squadMemberships) {
      if (await canEditTeam(userId, m.teamId)) {
        allowed = true;
        break;
      }
    }
  }
  if (!allowed) {
    return NextResponse.json({ error: "Sem permissão para editar este jogador." }, { status: 403 });
  }

  const body = await req.json();
  const allowedFields = [
    "name",
    "birthDate",
    "nationality",
    "photoUrl",
    "heightCm",
    "weightKg",
    "preferredFoot",
  ] as const;

  const data: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (key in body) {
      data[key] = key === "birthDate" && body[key] ? new Date(body[key]) : body[key];
    }
  }

  const updated = await prisma.player.update({ where: { id: params.id }, data });
  return NextResponse.json({ player: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!(await isAdmin((session?.user as any)?.id))) {
    return NextResponse.json({ error: "Acesso restrito ao administrador." }, { status: 403 });
  }

  await prisma.player.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
