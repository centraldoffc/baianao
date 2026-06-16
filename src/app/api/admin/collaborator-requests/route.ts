import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { CollaboratorStatus } from "@prisma/client";

// GET /api/admin/collaborator-requests?status=PENDING
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!(await isAdmin((session?.user as any)?.id))) {
    return NextResponse.json({ error: "Acesso restrito ao administrador." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = (searchParams.get("status") as CollaboratorStatus) || undefined;

  const requests = await prisma.collaboratorRequest.findMany({
    where: { status },
    include: { user: { select: { id: true, name: true, email: true } }, team: true },
    orderBy: { requestedAt: "desc" },
  });

  return NextResponse.json({ requests });
}
