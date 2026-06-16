import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { Division, MatchStatus } from "@prisma/client";
import { z } from "zod";

// GET /api/matches?division=SERIE_A&year=2026&status=AGENDADO&teamSlug=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const division = (searchParams.get("division") as Division) || undefined;
  const year = Number(searchParams.get("year")) || undefined;
  const status = (searchParams.get("status") as MatchStatus) || undefined;
  const teamSlug = searchParams.get("teamSlug") || undefined;
  const limit = Number(searchParams.get("limit")) || 20;

  const matches = await prisma.match.findMany({
    where: {
      status,
      season: {
        year,
        ...(division ? { competition: { division } } : {}),
      },
      ...(teamSlug
        ? {
            OR: [
              { homeTeam: { slug: teamSlug } },
              { awayTeam: { slug: teamSlug } },
            ],
          }
        : {}),
    },
    include: {
      homeTeam: { select: { name: true, shortName: true, slug: true } },
      awayTeam: { select: { name: true, shortName: true, slug: true } },
      round: true,
      broadcasts: true,
    },
    orderBy: { matchDateTime: "asc" },
    take: limit,
  });

  return NextResponse.json({ matches });
}

const matchSchema = z.object({
  seasonId: z.string(),
  roundId: z.string(),
  homeTeamId: z.string(),
  awayTeamId: z.string(),
  stadiumId: z.string().optional().nullable(),
  matchDateTime: z.string(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!(await isAdmin((session?.user as any)?.id))) {
    return NextResponse.json({ error: "Acesso restrito ao administrador." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = matchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { matchDateTime, ...rest } = parsed.data;
  const match = await prisma.match.create({
    data: { ...rest, matchDateTime: new Date(matchDateTime) },
  });

  return NextResponse.json({ match }, { status: 201 });
}
