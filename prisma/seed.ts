import { PrismaClient, Division, BroadcastType, TransferType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const year = new Date().getFullYear();

  // --- Usuário admin -------------------------------------------------
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@baianao.com" },
    update: {},
    create: {
      name: "Admin Baianão",
      email: "admin@baianao.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });
  console.log("Admin criado: admin@baianao.com / admin123 (troque a senha depois!)");

  // --- Estádios --------------------------------------------------------
  const arenaFonteNova = await prisma.stadium.create({
    data: { name: "Arena Fonte Nova", city: "Salvador", capacity: 47907 },
  });
  const barradao = await prisma.stadium.create({
    data: { name: "Estádio Manoel Barradas (Barradão)", city: "Salvador", capacity: 35632 },
  });

  // --- Competições e temporadas ----------------------------------------
  const competitionA = await prisma.competition.create({
    data: { name: "Campeonato Baiano", division: Division.SERIE_A },
  });
  const competitionB = await prisma.competition.create({
    data: { name: "Campeonato Baiano", division: Division.SERIE_B },
  });

  const seasonA = await prisma.season.create({
    data: {
      competitionId: competitionA.id,
      year,
      name: `Baianão ${year} - Série A`,
    },
  });
  const seasonB = await prisma.season.create({
    data: {
      competitionId: competitionB.id,
      year,
      name: `Baianão ${year} - Série B`,
    },
  });

  const round1A = await prisma.round.create({
    data: { seasonId: seasonA.id, number: 1, name: "Rodada 1" },
  });

  // --- Times Série A -----------------------------------------------------
  const bahia = await prisma.team.create({
    data: {
      name: "EC Bahia",
      shortName: "BAH",
      slug: "ec-bahia",
      city: "Salvador",
      foundedYear: 1931,
      stadiumId: arenaFonteNova.id,
      primaryColor: "#1f4e8c",
      description: "Tricolor de Aço, um dos maiores clubes do futebol baiano.",
    },
  });
  const vitoria = await prisma.team.create({
    data: {
      name: "EC Vitória",
      shortName: "VIT",
      slug: "ec-vitoria",
      city: "Salvador",
      foundedYear: 1899,
      stadiumId: barradao.id,
      primaryColor: "#a60000",
      description: "Leão da Barra, rival histórico do Bahia.",
    },
  });
  const jacuipense = await prisma.team.create({
    data: {
      name: "Jacuipense",
      shortName: "JAC",
      slug: "jacuipense",
      city: "Riachão do Jacuípe",
      foundedYear: 1992,
    },
  });
  const atleticoAlagoinhas = await prisma.team.create({
    data: {
      name: "Atlético de Alagoinhas",
      shortName: "ALA",
      slug: "atletico-de-alagoinhas",
      city: "Alagoinhas",
      foundedYear: 1972,
    },
  });

  // --- Times Série B -------------------------------------------------
  const bahiaDeFeira = await prisma.team.create({
    data: {
      name: "Bahia de Feira",
      shortName: "BDF",
      slug: "bahia-de-feira",
      city: "Feira de Santana",
      foundedYear: 1933,
    },
  });
  const docemel = await prisma.team.create({
    data: {
      name: "Doce Mel",
      shortName: "DCM",
      slug: "doce-mel",
      city: "Ipiaú",
      foundedYear: 1973,
    },
  });

  // --- Classificação (Série A) -----------------------------------------
  const standingsData = [
    { team: bahia, played: 1, wins: 1, draws: 0, losses: 0, gf: 3, ga: 1 },
    { team: vitoria, played: 1, wins: 1, draws: 0, losses: 0, gf: 2, ga: 0 },
    { team: jacuipense, played: 1, wins: 0, draws: 1, losses: 0, gf: 1, ga: 1 },
    { team: atleticoAlagoinhas, played: 1, wins: 0, draws: 0, losses: 1, gf: 0, ga: 2 },
  ];
  for (let i = 0; i < standingsData.length; i++) {
    const s = standingsData[i];
    await prisma.standing.create({
      data: {
        seasonId: seasonA.id,
        teamId: s.team.id,
        played: s.played,
        wins: s.wins,
        draws: s.draws,
        losses: s.losses,
        goalsFor: s.gf,
        goalsAgainst: s.ga,
        points: s.wins * 3 + s.draws,
        position: i + 1,
      },
    });
  }

  // Classificação Série B (simples, sem jogos)
  for (const [i, team] of [bahiaDeFeira, docemel].entries()) {
    await prisma.standing.create({
      data: { seasonId: seasonB.id, teamId: team.id, position: i + 1 },
    });
  }

  // --- Elenco de exemplo (Bahia) -----------------------------------------
  const players = [
    { name: "Marcos Felipe", position: "Goleiro", jerseyNumber: 1 },
    { name: "Gabriel Xavier", position: "Lateral", jerseyNumber: 2 },
    { name: "Kanu", position: "Zagueiro", jerseyNumber: 3 },
    { name: "David Duarte", position: "Zagueiro", jerseyNumber: 4 },
    { name: "Ryan Vital", position: "Lateral", jerseyNumber: 6 },
    { name: "Jean Lucas", position: "Meio-campo", jerseyNumber: 5 },
    { name: "Erick Pulga", position: "Meio-campo", jerseyNumber: 18 },
    { name: "Ademir", position: "Atacante", jerseyNumber: 9 },
    { name: "Everton Ribeiro", position: "Meio-campo", jerseyNumber: 8 },
    { name: "Thaciano", position: "Meio-campo", jerseyNumber: 10 },
    { name: "Estupiñán", position: "Atacante", jerseyNumber: 11 },
  ];

  const createdPlayers = [];
  for (const p of players) {
    const player = await prisma.player.create({
      data: { name: p.name, nationality: "Brasil" },
    });
    await prisma.squadMembership.create({
      data: {
        playerId: player.id,
        teamId: bahia.id,
        seasonId: seasonA.id,
        position: p.position,
        jerseyNumber: p.jerseyNumber,
      },
    });
    createdPlayers.push(player);
  }

  // --- Jogo de exemplo com escalação e transmissão ------------------------
  const match = await prisma.match.create({
    data: {
      seasonId: seasonA.id,
      roundId: round1A.id,
      homeTeamId: bahia.id,
      awayTeamId: vitoria.id,
      stadiumId: arenaFonteNova.id,
      matchDateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // em 3 dias
      status: "AGENDADO",
    },
  });

  await prisma.broadcast.createMany({
    data: [
      { matchId: match.id, channelName: "TV Bahia", type: BroadcastType.TV_ABERTA },
      { matchId: match.id, channelName: "Premiere", type: BroadcastType.TV_FECHADA },
    ],
  });

  // Escalação inicial (titulares) do Bahia para o jogo de exemplo
  const starters = createdPlayers.slice(0, 11);
  await prisma.lineup.createMany({
    data: starters.map((player, i) => ({
      matchId: match.id,
      teamId: bahia.id,
      playerId: player.id,
      isStarter: true,
      position: players[i].position,
      shirtNumber: players[i].jerseyNumber,
    })),
  });

  // --- Transferência de exemplo -------------------------------------------
  await prisma.transfer.create({
    data: {
      playerId: createdPlayers[createdPlayers.length - 1].id,
      fromTeamId: null,
      toTeamId: bahia.id,
      transferDate: new Date(),
      type: TransferType.CONTRATACAO,
      feeValue: 5000000,
      feeCurrency: "BRL",
      seasonId: seasonA.id,
    },
  });

  console.log("Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
