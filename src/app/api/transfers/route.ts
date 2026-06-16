import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canEditTeam, isAdmin } from "@/lib/permissions";
import { z } from "zod";

// GET /api/transfers?year=2026&teamSlug=...&playerId=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const teamSlug = searchParams.get("teamSlug") || undefined;
  const playerId = searchParams.get("playerId") || undefined;
  const limit = Number(searchParams.get("limit")) || 30;

  const transfers = await prisma.transfer.findMany({
    where: {
      playerId,
      ...(teamSlug
        ? {
            OR: [
              { fromTeam: { slug: teamSlug } },
              { toTeam: { slug: teamSlug } },
            ],
          }
        : {}),
    },
    include: { player: true, fromTeam: true, toTeam: true },
    orderBy: { transferDate: "desc" },
    take: limit,
  });

  return NextResponse.json({ transfers });
}

const transferSchema = z.object({
  playerId: z.string(),
  fromTeamId: z.string().optional().nullable(),
  toTeamId: z.string().optional().nullable(),
  transferDate: z.string(),
  type: z.enum(["CONTRATACAO", "EMPRESTIMO", "RETORNO_EMPRESTIMO", "LIVRE", "ENCERRAMENTO_CONTRATO"]),
  feeValue: z.number().optional().nullable(),
  feeCurrency: z.string().optional().nullable(),
  seasonId: z.string().optional().nullable(),
});

// POST /api/transfers -> registra uma movimentação (admin geral ou colaborador de um dos times)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  const body = await req.json();
  const parsed = transferSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { fromTeamId, toTeamId, transferDate, ...rest } = parsed.data;

  const allowed =
    (await isAdmin(userId)) ||
    (fromTeamId ? await canEditTeam(userId, fromTeamId) : false) ||
    (toTeamId ? await canEditTeam(userId, toTeamId) : false);

  if (!allowed) {
    return NextResponse.json(
      { error: "Sem permissão para registrar esta transferência." },
      { status: 403 }
    );
  }

  const transfer = await prisma.transfer.create({
    data: {
      ...rest,
      fromTeamId: fromTeamId ?? undefined,
      toTeamId: toTeamId ?? undefined,
      transferDate: new Date(transferDate),
    },
    include: { player: true, fromTeam: true, toTeam: true },
  });

  return NextResponse.json({ transfer }, { status: 201 });
}
