# Baianão — Portal do Campeonato Baiano (Série A & B)

Site + API completos com tabela de classificação, calendário/escalações, onde
assistir, elenco dos times, mercado de transferências e painel admin com
sistema de aprovação de colaboradores por time.

## Stack

- Next.js 14 (App Router) + TypeScript + TailwindCSS
- Prisma ORM + PostgreSQL
- NextAuth (login por e-mail/senha)

## 1. Pré-requisitos

- Node.js 18+
- Um banco PostgreSQL (recomendado: [Supabase](https://supabase.com) ou
  [Neon](https://neon.tech), ambos com plano gratuito)

## 2. Instalação

```bash
npm install
```

## 3. Configurar variáveis de ambiente

Copie o arquivo de exemplo e preencha com seus dados:

```bash
cp .env.example .env
```

- `DATABASE_URL`: string de conexão do seu banco PostgreSQL
- `NEXTAUTH_SECRET`: gere com `openssl rand -base64 32`
- `NEXTAUTH_URL`: `http://localhost:3000` em desenvolvimento

## 4. Criar as tabelas no banco

```bash
npx prisma db push
```

## 5. Popular com dados de exemplo (opcional, recomendado)

Cria times, jogadores, um jogo de exemplo, classificação e um usuário admin.

```bash
npm run db:seed
```

Login do admin criado pelo seed:
- **E-mail:** admin@baianao.com
- **Senha:** admin123

> ⚠️ Troque essa senha depois de testar (crie outro usuário admin e ajuste o
> campo `role` para `ADMIN` direto no banco, ou use o Prisma Studio).

## 6. Rodar localmente

```bash
npm run dev
```

Acesse `http://localhost:3000`.

## 7. Painel admin

Acesse `/admin` logado com uma conta cujo `role` seja `ADMIN`. No painel você
pode:

- Cadastrar/editar times, estádios e descrições
- Gerenciar o elenco de cada time (jogadores, posição, número, status)
- Cadastrar jogos, definir placar/status, escalações e onde assistir
- Registrar transferências
- Aprovar ou rejeitar pedidos de colaborador

## 8. Como funciona o sistema de colaboradores

Na página de um time (`/times/[slug]`), qualquer usuário logado vê o botão
**"Quero ser colaborador deste time"**. Ao clicar, é criada uma solicitação
pendente. O admin aprova em `/admin/colaboradores`. Usuários aprovados podem
editar (via API) o elenco, escalações, transmissões e transferências do time
para o qual foram aprovados — sem acesso aos demais times.

## 9. Estrutura de pastas

```
prisma/schema.prisma   -> modelo de dados completo
prisma/seed.ts         -> dados de exemplo
src/app/               -> páginas (App Router) e rotas de API (src/app/api)
src/components/        -> componentes da interface
src/lib/                -> prisma client, auth, permissões, utils
```

## 10. Cadastrando temporadas e rodadas

O seed cria a temporada e a 1ª rodada da Série A do ano atual. Para cadastrar
novas temporadas/rodadas (Série A, Série B, próximos anos), use o
[Prisma Studio](https://www.prisma.io/studio):

```bash
npm run db:studio
```

Crie registros em `Competition` (se ainda não existir a divisão desejada),
depois em `Season` (vinculado à competição e ao ano) e em `Round` (vinculado
à temporada). Depois disso, os formulários do painel admin (times, jogos,
elenco) já vão usar essas temporadas/rodadas automaticamente.

## 11. Deploy

**Frontend + API:** [Vercel](https://vercel.com) — conecte o repositório e
defina as variáveis de ambiente (`DATABASE_URL`, `NEXTAUTH_SECRET`,
`NEXTAUTH_URL` com a URL final do site).

**Banco de dados:** Supabase ou Neon — copie a connection string para
`DATABASE_URL` e rode `npx prisma db push` apontando para o banco de produção
(pode ser feito localmente, uma vez, antes do primeiro deploy).

## 12. Próximos passos sugeridos

- Adicionar fotos/escudos reais (campo `logoUrl` em `Team`, `photoUrl` em
  `Player`) usando um serviço como Cloudinary
- Automatizar atualização da tabela de classificação a partir dos resultados
  dos jogos (hoje a `Standing` é editada manualmente/via seed)
- Adicionar página de notícias/blog
- Adicionar busca global de jogadores/times no topo do site
