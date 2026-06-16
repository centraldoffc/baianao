import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { z } from "zod";

const schema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});

// PUT /api/admin/collaborator-requests/:id -> aprova ou rejeita
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const adminId = (session?.user as any)?.id as string | undefined;
  if (!(await isAdmin(adminId))) {
    return NextResponse.json({ error: "Acesso restrito ao administrador." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.collaboratorRequest.update({
    where: { id: params.id },
    data: {
      status: parsed.data.status,
      reviewedAt: new Date(),
      reviewedBy: adminId,
    },
    include: { user: true, team: true },
  });

  return NextResponse.json({ request: updated });
}
