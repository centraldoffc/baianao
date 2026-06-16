import { prisma } from "@/lib/prisma";
import { CollaboratorStatus, UserRole } from "@prisma/client";

/**
 * Verifica se um usuário pode editar dados de um determinado time.
 * Retorna true se o usuário for ADMIN geral, ou se tiver uma
 * solicitação de colaborador APROVADA para o time informado.
 */
export async function canEditTeam(userId: string | undefined | null, teamId: string) {
  if (!userId) return false;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return false;
  if (user.role === UserRole.ADMIN) return true;

  const collab = await prisma.collaboratorRequest.findUnique({
    where: { userId_teamId: { userId, teamId } },
  });

  return collab?.status === CollaboratorStatus.APPROVED;
}

export async function isAdmin(userId: string | undefined | null) {
  if (!userId) return false;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user?.role === UserRole.ADMIN;
}
