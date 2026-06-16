import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canEditTeam } from "@/lib/permissions";
import { z } from "zod";

async function getTeamId(slug: string) {
  const team = await prisma.team.findUnique({ where: { slug }, select: { id: true } });
  return team?.id ?? null;
}

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const teamId = await getTeamId(params.slug);
  if (!teamId) return NextResponse.json({ error: "Time não encontrado." }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const seasonId = searchParams.get("seasonId");

  const squad = await prisma.squadMembership.findMany({
    where: { teamId, ...(seasonId ? { seasonId } : {}) },
    include: { player: true },
    orderBy: [{ position: "asc" }, { jerseyNumber: "asc" }],
  });

  return NextResponse.json({ squad });
}

const addSchema = z.object({
  seasonId: z.string(),
  position: z.string(),
  jerseyNumber: z.number().int().optional().nullable(),
  status: z.enum(["ATIVO", "LESIONADO", "SUSPENSO", "EMPRESTADO"]).optional(),
  player: z.object({
    id: z.string().optional(),
    name: z.string().min(2),
    birthDate: z.string().optional().nullable(),
    nationality: z.string().optional().nullable(),
    photoUrl: z.string().optional().nullable(),
    heightCm: z.number().int().optional().nullable(),
    weightKg: z.number().int().optional().nullable(),
    preferredFoot: z.string().optional().nullable(),
  }),
});

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const teamId = await getTeamId(params.slug);
  if (!teamId) return NextResponse.json({ error: "Time não encontrado." }, { status: 404 });

  const session = await getServerSession(authOptions);
  if (!(await canEditTeam((session?.user as any)?.id, teamId))) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { seasonId, position, jerseyNumber, status, player } = parsed.data;
  let playerId = player.id;
  if (!playerId) {
    const created = await prisma.player.create({
      data: { name: player.name, birthDate: player.birthDate ? new Date(player.birthDate) : undefined, nationality: player.nationality ?? undefined, photoUrl: player.photoUrl ?? undefined, heightCm: player.heightCm ?? undefined, weightKg: player.weightKg ?? undefined, preferredFoot: player.preferredFoot ?? undefined },
    });
    playerId = created.id;
  }

  const membership = await prisma.squadMembership.create({
    data: { playerId, teamId, seasonId, position, jerseyNumber: jerseyNumber ?? undefined, status: status ?? "ATIVO" },
    include: { player: true },
  });

  return NextResponse.json({ membership }, { status: 201 });
}

const updateSchema = z.object({
  membershipId: z.string(),
  position: z.string().optional(),
  jerseyNumber: z.number().int().nullable().optional(),
  status: z.enum(["ATIVO", "LESIONADO", "SUSPENSO", "EMPRESTADO"]).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  const teamId = await getTeamId(params.slug);
  if (!teamId) return NextResponse.json({ error: "Time não encontrado." }, { status: 404 });

  const session = await getServerSession(authOptions);
  if (!(await canEditTeam((session?.user as any)?.id, teamId))) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { membershipId, ...data } = parsed.data;
  const updated = await prisma.squadMembership.update({ where: { id: membershipId }, data, include: { player: true } });

  return NextResponse.json({ membership: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
  const teamId = await getTeamId(params.slug);
  if (!teamId) return NextResponse.json({ error: "Time não encontrado." }, { status: 404 });

  const session = await getServerSession(authOptions);
  if (!(await canEditTeam((session?.user as any)?.id, teamId))) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const membershipId = searchParams.get("membershipId");
  if (!membershipId) return NextResponse.json({ error: "membershipId obrigatório." }, { status: 400 });

  await prisma.squadMembership.delete({ where: { id: membershipId } });
  return NextResponse.json({ ok: true });
}
