import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { z } from "zod";

// GET /api/players?search=nome
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");

  const players = await prisma.player.findMany({
    where: search ? { name: { contains: search, mode: "insensitive" } } : undefined,
    orderBy: { name: "asc" },
    take: 50,
  });

  return NextResponse.json({ players });
}

const playerSchema = z.object({
  name: z.string().min(2),
  birthDate: z.string().optional().nullable(),
  nationality: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  heightCm: z.number().int().optional().nullable(),
  weightKg: z.number().int().optional().nullable(),
  preferredFoot: z.string().optional().nullable(),
});

// POST /api/players -> cria jogador (admin geral; colaboradores criam via /api/teams/:id/squad)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!(await isAdmin((session?.user as any)?.id))) {
    return NextResponse.json({ error: "Acesso restrito ao administrador." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = playerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { birthDate, ...rest } = parsed.data;
  const player = await prisma.player.create({
    data: { ...rest, birthDate: birthDate ? new Date(birthDate) : undefined },
  });

  return NextResponse.json({ player }, { status: 201 });
}
