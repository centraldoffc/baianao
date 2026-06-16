import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canEditTeam } from "@/lib/permissions";

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const team = await prisma.team.findUnique({
    where: { slug: params.slug },
    include: { stadium: true },
  });

  if (!team) {
    return NextResponse.json({ error: "Time não encontrado." }, { status: 404 });
  }

  return NextResponse.json({ team });
}

export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  const team = await prisma.team.findUnique({ where: { slug: params.slug } });
  if (!team) {
    return NextResponse.json({ error: "Time não encontrado." }, { status: 404 });
  }

  if (!(await canEditTeam((session?.user as any)?.id, team.id))) {
    return NextResponse.json(
      { error: "Você não tem permissão para editar este time." },
      { status: 403 }
    );
  }

  const body = await req.json();
  const allowed = [
    "name",
    "shortName",
    "logoUrl",
    "city",
    "foundedYear",
    "description",
    "primaryColor",
    "stadiumId",
  ] as const;

  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }

  const updated = await prisma.team.update({ where: { id: team.id }, data });
  return NextResponse.json({ team: updated });
}
