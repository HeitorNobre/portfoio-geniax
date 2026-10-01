# Portfólio — Heitor · Automação & Dados

Site comercial para gerar conversas com empresas (PMEs, administradoras de condomínios, imobiliárias, distribuidoras, empresas de serviços) interessadas em **automação de processos, dashboards gerenciais e integração de dados**.

Next.js 16 (App Router) · TypeScript · Tailwind CSS 3 · Recharts. Sem backend: tudo é gerado estaticamente.

---

## 1. Antes de publicar: edite um arquivo só

Abra **`src/config/portfolio.ts`** e preencha:

| Campo | Exemplo | Efeito |
|---|---|---|
| `fullName` | `"Heitor Silva"` | Título das páginas, rodapé, SEO |
| `whatsapp` | `"5511999998888"` (DDI + DDD + número, só dígitos) | Ativa o botão flutuante e transforma todos os CTAs em links de WhatsApp com mensagem pronta |
| `email` | `"contato@seudominio.com.br"` | Botão de e-mail (vira o CTA principal se não houver WhatsApp) |
| `linkedin` | `"https://www.linkedin.com/in/seu-perfil"` | Ícone no rodapé e link no CTA final |
| `github` | `"https://github.com/seu-usuario"` | Ícone no rodapé |
| `siteUrl` | `"https://seudominio.com.br"` | URLs canônicas, sitemap e imagens de compartilhamento |
| `whatsappMessage` | já preenchida | Mensagem que abre no WhatsApp |

**Campo vazio = botão escondido.** Nenhum número ou e-mail fictício aparece no site.

Prioridade dos CTAs: WhatsApp → e-mail → LinkedIn. Sem nenhum desses, os botões de contato não aparecem (em modo de desenvolvimento um aviso amarelo lembra de configurar).

> Na seção "Problemas que resolvo", o visitante pode marcar as situações que reconhece. O botão envia essas situações dentro da mensagem do WhatsApp/e-mail.

---

## 2. Rodar localmente

Requisito: **Node.js 20.9 ou superior**.

```bash
npm install
npm run dev        # http://localhost:3000
```

Outros comandos:

```bash
npm run build      # build de produção (valida tipos)
npm run start      # serve o build
npm run typecheck  # só checagem de tipos
```

---

## 3. Publicar na Vercel

1. Suba a pasta para um repositório no GitHub.
2. Em [vercel.com](https://vercel.com) → **Add New → Project** → importe o repositório.
3. Framework é detectado automaticamente (Next.js). Não há variáveis de ambiente obrigatórias.
4. Clique em **Deploy**.
5. Em **Settings → Domains**, adicione seu domínio e siga as instruções de DNS.
6. Atualize `siteUrl` em `src/config/portfolio.ts` com o domínio final e faça novo deploy.

Se preferir não editar `siteUrl`, defina a variável `NEXT_PUBLIC_SITE_URL` na Vercel. Sem nenhuma das duas, o site usa a URL de produção da própria Vercel.

---

## 4. Estrutura

```
src/
├── config/portfolio.ts      ← seus dados (único arquivo obrigatório)
├── app/
│   ├── page.tsx             Home
│   ├── cases/[slug]/        Páginas dos cases (+ imagem OpenGraph por case)
│   ├── layout.tsx           Metadados, fontes, header/footer
│   ├── sitemap.ts, robots.ts, opengraph-image.tsx, icon.svg, not-found.tsx
├── data/
│   ├── content.ts           Textos da home (problemas, serviços, FAQ, processo…)
│   ├── cases.ts             Storytelling dos 3 cases (números calculados dos dados)
│   └── mock/                Geradores de dados simulados
│       ├── condominios.ts   Case 1 — 40 condomínios, ~2.500 chamados, 14 fornecedores
│       ├── distribuidora.ts Case 2 — ~430 clientes, ~27 mil pedidos diários
│       ├── financeiro.ts    Case 3 — 362 clientes, ~5.400 títulos
│       └── common.ts        Datas de referência e utilitários
├── components/
│   ├── home/                Seções da home
│   ├── case/                Blocos das páginas de case
│   ├── dashboards/          Os 3 dashboards interativos (carregados sob demanda)
│   ├── dashboard/           Componentes de dashboard (KPI, painel, abas, filtros, tabela)
│   ├── charts/              Tema dos gráficos, tooltip, sparkline
│   ├── diagrams/            Fluxo antes × depois e arquitetura
│   ├── layout/              Header, footer, logo, botão do WhatsApp
│   └── ui/                  Botões, container, títulos, selo "case demonstrativo"
└── lib/                     Formatação pt-BR, contato, gerador pseudoaleatório, SEO
```

---

## 5. Sobre os dados simulados

- Os três cases usam **empresas fictícias** e são sinalizados em todo lugar como *"Case demonstrativo · dados simulados"*.
- Os dados são gerados por um gerador pseudoaleatório **com semente fixa**: os números são sempre os mesmos, no servidor e no navegador, e ficam "congelados" na data de referência **30/09/2026** (`src/data/mock/common.ts`).
- Cada dataset segue regras de negócio explícitas (comentadas no topo de cada arquivo) para que os dashboards contem histórias coerentes:
  - **Condomínios:** reajuste em janeiro, inadimplência sazonal, 4 condomínios com alta contínua, fornecedor de hidráulica sistematicamente fora do SLA, fornecedor de elevadores piorando, obras que estouram o orçamento.
  - **Distribuidora:** pico em dezembro, queda em jan/fev, vendedor que perde 3 contas grandes, vendedora que cresce com novas contas, rota que passa a atrasar após perder um veículo, itens com risco de ruptura.
  - **Financeiro:** perfis de pagamento recorrentes, escolas com atraso sazonal, clientes críticos acumulando títulos, vencimentos concentrados nos dias 5 e 10, previsão ajustada pelo histórico.
- Os textos dos cases (insights, fatos, números) são **calculados a partir dos mesmos dados**, então texto e dashboard nunca se contradizem. Se você alterar um gerador, os textos se atualizam sozinhos.
- Benefícios são descritos como *impacto esperado / ganho potencial*, nunca como resultado obtido.

---

## 6. Personalizações comuns

- **Textos da home:** `src/data/content.ts`.
- **Textos dos cases:** `src/data/cases.ts`.
- **Cores:** `tailwind.config.ts` (paleta `ink`, `brand`, `series`, status `good/warn/bad`) e `src/components/charts/theme.ts` para os gráficos.
- **Novo case:** crie um gerador em `src/data/mock/`, um dashboard em `src/components/dashboards/`, registre no `DashboardLoader.tsx` e adicione o conteúdo em `CASES` (`src/data/cases.ts`). A rota e o sitemap são criados automaticamente.
- **Logo:** `public/logo-mark.svg` (cabeçalho, rodapé e imagem de compartilhamento) e `src/app/icon.svg` (favicon). Para trocar, substitua os dois arquivos mantendo o fundo transparente.
- **Foto:** a seção "Sobre" usa um monograma. Para usar foto, coloque o arquivo em `public/` e troque o bloco do monograma em `src/components/home/About.tsx` por um `next/image`.

---

## 7. Identidade visual

| Token | Cor | Uso |
|---|---|---|
| `ink-950` | `#0B1220` | Títulos, seções escuras, botões secundários fortes |
| `ink-600` | `#475569` | Texto de apoio |
| `brand-700` | `#1C5CAB` | CTA principal, links |
| `series-1` | `#2A78D6` | Série principal dos gráficos |
| `series-2` | `#EB6834` | Segunda série / destaque de atraso |
| `series-3` | `#1BAF7A` | Terceira série |
| `good / warn / bad` | `#0CA30C / #FAB219 / #D03B3B` | Somente status (sempre com ícone + texto) |

Tipografia: **Inter Tight** (títulos) + **Inter** (texto), via `next/font` (sem requisição externa em produção).

---

## 8. Checklist de publicação

- [ ] `src/config/portfolio.ts` preenchido (nome, WhatsApp e/ou e-mail, LinkedIn, `siteUrl`)
- [ ] `npm run build` sem erros
- [ ] Deploy na Vercel e domínio configurado
- [ ] Testar o botão de WhatsApp no celular
- [ ] Compartilhar o link no LinkedIn/WhatsApp para conferir a imagem de pré-visualização
