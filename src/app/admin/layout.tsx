import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminSidebarClient from "@/components/AdminSidebarClient";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  if (!userId) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "ADMIN") {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="font-display text-2xl text-sand">Acesso restrito</h1>
        <p className="mt-2 text-sm text-slate-light">
          Esta área é exclusiva para administradores do Baianão. Se você é
          colaborador de um time, edite o elenco, a escalação e as
          transferências diretamente nas páginas públicas do time.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <AdminSidebarClient />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
