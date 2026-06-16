# Migrations — Baianão (Supabase)

Execute os arquivos abaixo **em ordem** no **SQL Editor** do Supabase.
Acesse: https://fblqecsuzxdearcctpwx.supabase.co → SQL Editor → New query

| Ordem | Arquivo                          | O que cria                          |
|-------|----------------------------------|-------------------------------------|
| 1     | 01_enums.sql                     | Todos os tipos ENUM                 |
| 2     | 02_user.sql                      | Tabela de usuários                  |
| 3     | 03_competition_season_round.sql  | Competição, temporada e rodada      |
| 4     | 04_stadium_team.sql              | Estádio e time                      |
| 5     | 05_player_squad.sql              | Jogador e elenco                    |
| 6     | 06_match_lineup_broadcast.sql    | Jogo, escalação e transmissão       |
| 7     | 07_standing.sql                  | Tabela de classificação             |
| 8     | 08_transfer.sql                  | Transferências                      |
| 9     | 09_collaborator_request.sql      | Solicitações de colaborador         |

## Após rodar os SQLs

Configure o `.env` com as strings de conexão do Supabase e rode:

```bash
npm install
npx prisma generate   # gera o client Prisma sem precisar de db push
npm run db:seed       # popula times/jogadores de exemplo (opcional)
npm run dev
```

## Onde encontrar as strings de conexão

No painel do Supabase: **Project Settings → Database → Connection string**

- **DATABASE_URL** → use a aba **Connection pooling** (porta 6543)
  - Adicione `?pgbouncer=true&connection_limit=1` no final
- **DIRECT_URL** → use a aba **URI** direta (porta 5432)
  - Usada só pelo Prisma para migrations

## Variáveis de ambiente na Vercel

Na Vercel, adicione todas as variáveis do `.env.example`:
- `DATABASE_URL` (pooling, porta 6543)
- `DIRECT_URL` (direta, porta 5432)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` ← encontre em Project Settings → API
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` ← URL final do seu site na Vercel
