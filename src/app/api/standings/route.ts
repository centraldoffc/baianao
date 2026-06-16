import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Division } from "@prisma/client";

// GET /api/standings?division=SERIE_A&year=2026
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const division = (searchParams.get("division") ?? "SERIE_A") as Division;
  const year = Number(searchParams.get("year")) || new Date().getFullYear();

  const season = await prisma.season.findFirst({
    where: { year, competition: { division } },
    include: {
      standings: {
        orderBy: { position: "asc" },
        include: {
          team: {
            select: { id: true, name: true, shortName: true, slug: true, logoUrl: true },
          },
        },
      },
    },
  });

  if (!season) {
    return NextResponse.json({ season: null, standings: [] });
  }

  return NextResponse.json({
    season: { id: season.id, name: season.name, year: season.year },
    standings: season.standings,
  });
}
