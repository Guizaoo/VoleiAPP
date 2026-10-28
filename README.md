# Levanta — protótipo de aluguel de quadras de vôlei

Landing page navegável, com cara de aplicativo, para validar a ideia de uma plataforma onde a pessoa encontra quadras de vôlei, vê fotos, preços e horários livres e **simula** uma reserva sem precisar esperar resposta no WhatsApp.

> **Levanta** é um nome provisório. A cidade configurada é **São Luís – MA**. Os locais listados foram encontrados em fontes públicas (reportagens e guias), mas **fotos, preços, horários, regras e disponibilidade são ilustrativos** e não há parceria com nenhum deles.

- React 18 + TypeScript + Vite 6
- CSS com variáveis (tokens) + CSS Modules
- Ícones: `lucide-react`
- Sem back-end, sem banco de dados, sem variáveis de ambiente

## Como rodar

Requisitos: Node.js 18.18+ (recomendado 20 ou 22) e npm.

```bash
npm install        # instala as dependências
npm run dev        # servidor local em http://localhost:5173
npm run typecheck  # verificação de TypeScript
npm run build      # build de produção em dist/
npm run preview    # serve o build localmente (http://localhost:4173)
```

## Publicar na Vercel

1. Suba o projeto para um repositório (GitHub, GitLab ou Bitbucket).
2. Na Vercel, clique em **Add New → Project** e importe o repositório.
3. A Vercel detecta Vite automaticamente. As configurações já estão em `vercel.json`:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Clique em **Deploy**. Nenhuma variável de ambiente é necessária.

Pela linha de comando: `npx vercel` (prévia) e `npx vercel --prod` (produção).

O app é de página única e navega por âncoras (`#quadras`, `#como-funciona`…). Mesmo assim, o `vercel.json` já redireciona caminhos desconhecidos para o `index.html`, então rotas no cliente adicionadas no futuro funcionarão em acesso direto.

## Onde alterar cada coisa

| O quê | Onde |
| --- | --- |
| Nome da plataforma, slogan, **cidade**, janela de datas (14 dias), duração da sessão, quantidade de horários no card | `src/config/site.ts` |
| Faixas de preço do filtro e textos de aviso da demonstração | `src/config/site.ts` |
| **Quadras**: nome, bairro, modalidade, cobertura, **preço** (em centavos), descrição, comodidades, regras, horário de funcionamento, **fotos** | `src/data/courts.ts` |
| Nomes exibidos de modalidades, cobertura e comodidades | `src/data/labels.ts` |
| Ícone de cada comodidade | `src/components/AmenityIcon.tsx` |
| **Imagens** | `public/images/` (referencie como `/images/arquivo.jpg` em `courts.ts`) |
| Créditos das fotos (exibidos no rodapé) | `src/data/photoCredits.ts` |
| Cores, fontes, espaçamentos, raios e sombras | `src/styles/global.css` (bloco `:root`) |
| Nome na aba do navegador e meta descrição | `index.html` |

Preços ficam em **centavos** (`16000` = R$ 160,00) para evitar erros de arredondamento. Datas usam `AAAA-MM-DD` no fuso local e são exibidas no formato brasileiro (`27/10/2026`, `19:00`).

## O que é simulado

- **Quadras**: 6 locais de São Luís citados em fontes públicas (Sports Village, Arena CF98, Arena Lito Beach, CT Neto Bruzaca, CT Professor Lúcio e Ginásio Castelinho). Só nome, bairro, endereço e estrutura citada vêm dessas fontes, que podem estar desatualizadas (algumas são de 2021–2022). O link da fonte aparece nos detalhes de cada quadra. Antes de mostrar o protótipo publicamente, confirme os dados com os locais ou troque por estabelecimentos parceiros.
- **Fotos**: genéricas, não são dos locais, e aparecem marcadas como "Foto ilustrativa".
- **Preços e regras**: inventados para a demonstração.
- **Disponibilidade**: gerada de forma determinística em `src/lib/availability.ts` a partir de quadra + data + hora. O mesmo horário aparece sempre com o mesmo status no card, nos detalhes e no resumo. Não é informação em tempo real.
- **Datas**: sempre relativas ao dia de hoje (hoje + 13 dias), então o protótipo não fica desatualizado.
- **Horários passados**: sessões que já começaram no dia atual aparecem como "Encerrado" e não podem ser escolhidas. A hora é reavaliada a cada minuto e uma seleção que expirar é limpa.
- **Reserva**: o botão "Simular reserva" leva a uma tela de revisão que avisa que nada será realizado; a confirmação mostra o resumo com o aviso "Esta é uma demonstração. Nenhuma reserva ou cobrança foi realizada." Nada é salvo, enviado ou cobrado.
- **Cadastro de donos de quadra**: o botão abre um painel informando que o recurso virá em uma próxima etapa. Não há formulário.
- Não há login, cadastro, pagamento, geolocalização nem coleta de dados pessoais.

## Estrutura

```
src/
  config/site.ts            configuração central (nome, cidade, faixas de preço, avisos)
  types/court.ts            tipos: Court, TimeSlot, BookingSelection, SimulatedBooking, CourtFilters…
  data/                     dados fictícios (quadras, rótulos, créditos das fotos)
  lib/                      regras de negócio puras: datas, formatação pt-BR, disponibilidade, filtros
  services/courtsService.ts camada de acesso a dados (ponto único para trocar por uma API)
  hooks/                    useNow (relógio por minuto), useMediaQuery
  components/               componentes de interface + CSS Modules
  styles/global.css         tokens de design e estilos base
```

### Acessibilidade e experiência mobile

- Mobile first (360–430 px), sem rolagem horizontal, áreas de toque de 44 px ou mais e respeito à área segura (`env(safe-area-inset-*)`).
- No celular, os filtros abrem em um painel inferior com o botão "Ver N quadras" ao alcance do polegar; no desktop, ficam em uma barra lateral fixa.
- Detalhes da quadra: painel inferior no celular e modal em duas colunas no desktop, com barra de ação fixa no rodapé.
- Diálogos com foco preso, fechamento por `Esc`, retorno do foco ao elemento de origem, bloqueio da rolagem do fundo e fundo marcado como `inert`.
- Datas, horários e filtros usam radios nativos (navegação por setas). A disponibilidade é escrita por extenso ("Livre", "Ocupado", "Encerrado"), além da cor e da hachura.
- Animações leves, desativadas com `prefers-reduced-motion`.

## Integração futura com API (Node.js + Express)

Os componentes não leem `src/data` diretamente: tudo passa por `src/services/courtsService.ts`, que usa os tipos de `src/types/court.ts`. Para conectar uma API:

1. Criar o back-end (ex.: pasta `server/` ou repositório separado) com Express e endpoints como:

   | Método | Rota | Retorno |
   | --- | --- | --- |
   | `GET` | `/api/courts?bairro=&modalidade=&preco=&cobertura=` | `Court[]` |
   | `GET` | `/api/courts/:id` | `Court` |
   | `GET` | `/api/courts/:id/availability?date=AAAA-MM-DD` | `TimeSlot[]` |
   | `POST` | `/api/bookings` (`{ courtId, slotId }`) | reserva criada |

2. Trocar a implementação de `courtsService` por chamadas `fetch` (tornando as funções `async`) e usar a URL base de uma variável `VITE_API_URL`.
3. Adicionar estados de carregamento e erro onde os dados são consumidos (`App.tsx` e `CourtDetails.tsx`). Hoje não existem porque os dados locais são síncronos.
4. Mover a regra de disponibilidade de `src/lib/availability.ts` para o servidor, mantendo o formato de `TimeSlot` e os IDs estáveis (`<quadra>_<AAAA-MM-DD>_<HHmm>`).

## Créditos das imagens

As fotos são do [Wikimedia Commons](https://commons.wikimedia.org/), redimensionadas para 1100 px e servidas localmente a partir de `public/images/` (não dependem de serviços externos). Os créditos também aparecem no rodapé do site. Se uma imagem falhar ao carregar, o componente `CourtImage` mostra um espaço reservado.

| Arquivo | Original | Autor | Licença |
| --- | --- | --- | --- |
| `hero-rede-entardecer.jpg` | [Beach Volleyball Net, Destin, Florida](https://commons.wikimedia.org/wiki/File:Beach_Volleyball_Net,_Destin,_Florida.jpg) | M.Fitzsimmons | CC BY-SA 3.0 |
| `indoor-laranja-1.jpg` | [Front view of Volleyball court at Australian Institute of Sport](https://commons.wikimedia.org/wiki/File:Front_view_of_Volleyball_court_at_Australian_Institute_of_Sport.jpg) | KeepActive Australia | CC BY-SA 4.0 |
| `indoor-laranja-2.jpg` | [Side view of Volleyball court at Australian Institute of Sport](https://commons.wikimedia.org/wiki/File:Side_view_of_Volleyball_court_at_Australian_Institute_of_Sport.jpg) | KeepActive Australia | CC BY-SA 4.0 |
| `ginasio-1.jpg` | [Volleyball court, Chorzow (DBR45884)](https://commons.wikimedia.org/wiki/File:Volleyball_court,_Chorzow_(DBR45884).jpg) | Matti Blume | CC BY-SA 4.0 |
| `poliesportiva-1.jpg` | [Shan King Estate Volleyball Court](https://commons.wikimedia.org/wiki/File:Shan_King_Estate_Volleyball_Court.jpg) | Exploringlife | CC BY-SA 4.0 |
| `areia-1.jpg` | [Beach volleyball court in Kaukajärvi, Tampere, Finland](https://commons.wikimedia.org/wiki/File:Beach_volleyball_court_in_Kaukaj%C3%A4rvi,_Tampere,_Finland.jpg) | DaysBrief205 | CC BY-SA 4.0 |
| `areia-complexo-1.jpg` | [Scioto Audubon - Volleyball Courts 1](https://commons.wikimedia.org/wiki/File:Scioto_Audubon_-_Volleyball_Courts_1.jpg) | Sixflashphoto | CC BY-SA 4.0 |
| `areia-praia-1.jpg` | [Volleyball courts on Jumeirah Beach, Dubai, UAE](https://commons.wikimedia.org/wiki/File:Volleyball_courts_on_Jumeirah_Beach,_Dubai,_UAE.jpg) | CT Cooper | Domínio público |
| `areia-arena-1.jpg` | [Sand Volleyball Courts (UC Santa Barbara)](https://commons.wikimedia.org/wiki/File:Sand_Volleyball_Courts_(UC_Santa_Barbara).jpg) | Spatms | CC BY-SA 4.0 |
| `areia-entardecer-1.jpg` | [Desert beach with volleyball net at sunset](https://commons.wikimedia.org/wiki/File:Desert_beach_with_volleyball_net_at_sunset.jpg) | Alon | CC BY 2.0 |

As fontes (Bricolage Grotesque e Plus Jakarta Sans) são carregadas do Google Fonts, com fontes do sistema como alternativa.
