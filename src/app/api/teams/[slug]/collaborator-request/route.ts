import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function getTeamId(slug: string) {
  const team = await prisma.team.findUnique({ where: { slug }, select: { id: true } });
  return team?.id ?? null;
}

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ status: "NONE" });

  const teamId = await getTeamId(params.slug);
  if (!teamId) return NextResponse.json({ status: "NONE" });

  const existing = await prisma.collaboratorRequest.findUnique({
    where: { userId_teamId: { userId, teamId } },
  });

  return NextResponse.json({ status: existing?.status ?? "NONE" });
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "Você precisa entrar na sua conta." }, { status: 401 });

  const teamId = await getTeamId(params.slug);
  if (!teamId) return NextResponse.json({ error: "Time não encontrado." }, { status: 404 });

  let message: string | undefined;
  try { const body = await req.json(); message = body?.message; } catch {}

  const existing = await prisma.collaboratorRequest.findUnique({
    where: { userId_teamId: { userId, teamId } },
  });

  if (existing) {
    if (existing.status === "PENDING" || existing.status === "APPROVED") {
      return NextResponse.json({ request: existing });
    }
    const updated = await prisma.collaboratorRequest.update({
      where: { id: existing.id },
      data: { status: "PENDING", message, reviewedAt: null, reviewedBy: null },
    });
    return NextResponse.json({ request: updated });
  }

  const created = await prisma.collaboratorRequest.create({
    data: { userId, teamId, message },
  });
  return NextResponse.json({ request: created }, { status: 201 });
}
