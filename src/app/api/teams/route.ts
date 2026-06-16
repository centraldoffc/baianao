import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { z } from "zod";

export async function GET() {
  const teams = await prisma.team.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      shortName: true,
      slug: true,
      logoUrl: true,
      city: true,
    },
  });
  return NextResponse.json({ teams });
}

const teamSchema = z.object({
  name: z.string().min(2),
  shortName: z.string().min(2).max(5),
  slug: z.string().min(2),
  city: z.string().min(2),
  logoUrl: z.string().url().optional().nullable(),
  foundedYear: z.number().int().optional().nullable(),
  description: z.string().optional().nullable(),
  primaryColor: z.string().optional().nullable(),
  stadiumId: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!(await isAdmin((session?.user as any)?.id))) {
    return NextResponse.json({ error: "Acesso restrito ao administrador." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = teamSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const team = await prisma.team.create({ data: parsed.data });
  return NextResponse.json({ team }, { status: 201 });
}
