export default function Footer() {
  return (
    <footer className="mt-16 border-t border-ink-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-slate-light">
        <p className="font-display text-lg text-sand">
          BAIAN<span className="text-coral">ÃO</span>
        </p>
        <p>
          Tabelas, escalações, elencos e transferências do Campeonato Baiano —
          Séries A e B.
        </p>
        <p className="text-xs">
          Dados mantidos pela comunidade. Quer ajudar a manter o seu time
          atualizado? Acesse a página do elenco e peça para ser colaborador.
        </p>
      </div>
    </footer>
  );
}
