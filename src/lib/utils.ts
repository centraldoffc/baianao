import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatMatchDate(date: Date | string) {
  const d = new Date(date);
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatCurrency(value: number | null | undefined, currency = "BRL") {
  if (value == null) return "Não informado";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(value);
}

export const statusLabels: Record<string, string> = {
  AGENDADO: "Agendado",
  EM_ANDAMENTO: "Em andamento",
  FINALIZADO: "Finalizado",
  ADIADO: "Adiado",
  CANCELADO: "Cancelado",
};

export const broadcastLabels: Record<string, string> = {
  TV_ABERTA: "TV Aberta",
  TV_FECHADA: "TV Fechada",
  STREAMING: "Streaming",
  RADIO: "Rádio",
};

export const transferLabels: Record<string, string> = {
  CONTRATACAO: "Contratação",
  EMPRESTIMO: "Empréstimo",
  RETORNO_EMPRESTIMO: "Retorno de empréstimo",
  LIVRE: "Livre",
  ENCERRAMENTO_CONTRATO: "Fim de contrato",
};

export const divisionLabels: Record<string, string> = {
  SERIE_A: "Série A",
  SERIE_B: "Série B",
};
