# Beta 1 — Vercel + Railway + Google

## Arquitetura preparada

React/Vite na Vercel → `/api` por rewrite → Express no Railway → PostgreSQL e bucket privado no Railway.
Google Identity Services entrega um ID token ao navegador; a API valida assinatura, emissor, audiência e expiração com a biblioteca oficial. O Google identifica a conta; a sessão do Levanta é própria, dura sete dias e usa cookie HttpOnly, Secure em produção e SameSite=Lax. O banco armazena apenas o hash do token de sessão. Não guardamos senha nem token Google.

A API exige lista de e-mails convidados para login e para cada acesso autenticado. Remover um e-mail bloqueia as sessões existentes. Mutações exigem Origin igual a APP_ORIGIN. Credenciais do banco/bucket ficam exclusivamente no Railway. Somente o client ID Google é público.

## O que o código inclui

- Login Google, restauração de sessão e saída com revogação no banco.
- Perfil básico criado a partir do nome Google; não há editor de perfil nesta etapa.
- Feed dos participantes, criação de posts, comentários, curtidas e favoritos privados.
- Feed busca atualizações a cada 30 segundos enquanto a aba está visível; não usa WebSocket.
- Fotos JPG/PNG/WebP de até 5 MB, verificadas pelo decodificador, redimensionadas e convertidas para WebP (sem metadados originais).
- Bucket privado: fotos passam pela API e exigem sessão, sem URLs públicas permanentes.
- Limites de requisição por instância, migrações versionadas/transacionais e healthcheck com banco.
- Endpoint de exclusão de post próprio (a interface de exclusão fica para a próxima etapa).
- Sem flag beta, continua a demonstração atual, sem gravação no servidor.

## 1. GitHub — você faz

Use o repositório deste projeto. Envie as alterações revisadas para a branch escolhida e mantenha-o conectado à Vercel. Não envie arquivos `.env`, chaves ou senhas. A API e o site ficam no mesmo repositório, com deploys distintos.

## 2. Railway — você faz

1. Crie um projeto do beta na sua conta.
2. Adicione PostgreSQL e um Storage Bucket privado. Habilite backups do banco conforme seu plano e defina a retenção. Valide um procedimento de restauração antes dos convites.
3. Adicione serviço pelo GitHub e escolha este repositório/branch.
4. No serviço da API, configure **Root Directory: `/server`**. Use o Dockerfile dessa pasta. A configuração Railway está em `server/railway.json`; selecione esse caminho se o painel não detectar automaticamente. Confirme os comandos: pre-deploy `npm run migrate`, start `npm start`, healthcheck `/api/health`.
5. Gere o domínio HTTPS da API. Anote apenas a URL pública.
6. Configure as variáveis da tabela abaixo. Use referências do painel para banco e bucket.
7. Depois de preencher, faça o deploy e confira que a migração e o healthcheck passaram.

| Variável na API | Valor |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Referência à `DATABASE_URL` privada do PostgreSQL |
| `APP_ORIGIN` | Origem exata do site, ex.: `https://seu-beta.vercel.app`, sem barra final |
| `GOOGLE_CLIENT_ID` | Client ID Web criado no Google |
| `BETA_ALLOWED_EMAILS` | Seu e-mail e os amigos, separados por vírgula |
| `BUCKET_ENDPOINT` | Endpoint base da aba Credentials do bucket |
| `BUCKET_REGION` | Região informada pelo bucket |
| `BUCKET_NAME` | Nome do bucket |
| `BUCKET_ACCESS_KEY_ID` | Access key do bucket |
| `BUCKET_SECRET_ACCESS_KEY` | Secret key do bucket |

O Railway injeta PORT; não fixe a porta em produção. O bucket é acessado pelo backend, portanto não é necessário liberar CORS de upload no bucket. Não torne o banco público para o app em produção. Não altere a conexão para `rejectUnauthorized: false`.

## 3. Google Cloud / Google Auth Platform — você faz

1. Crie ou selecione um projeto para o Levanta Beta.
2. Configure Branding/tela de consentimento: nome do app, e-mail de suporte e contato do desenvolvedor. Preencha os campos de domínio/política de privacidade exigidos pelo painel para seu ambiente.
3. Escolha público externo; mantenha em Testing para o beta e adicione os amigos em Test users quando solicitado.
4. Crie OAuth Client do tipo **Web application**.
5. Em **Authorized JavaScript origins**, inclua a origem exata da Vercel. Para teste local, adicione também `http://localhost:5175` e/ou `http://127.0.0.1:5175` (somente os endereços que usar).
6. Copie o **Client ID** para GOOGLE_CLIENT_ID na API e VITE_GOOGLE_CLIENT_ID no frontend.

Este fluxo usa o botão Google em popup com callback JavaScript. Não precisa de redirect URI do backend nem client secret; não pedimos acesso a Drive, Gmail ou outros dados Google. Uma nova URL de preview da Vercel precisa ser autorizada no Google e corresponder ao APP_ORIGIN; prefira um endereço estável do beta.

## 4. Vercel — configuração final

1. Mantenha Root Directory na raiz do repositório, build `npm run build`, output `dist`.
2. Quando tiver o domínio Railway, execute na raiz:

   ```sh
   node scripts/configure-beta-proxy.mjs https://SUA-API.up.railway.app
   ```

   O comando atualiza `vercel.json`, adicionando o rewrite `/api/:path*` antes do fallback React. Inclua essa alteração no GitHub. Sem esse passo, `/api` não alcança o Railway.
3. Configure VITE_BETA_ENABLED=`true` e VITE_GOOGLE_CLIENT_ID com o mesmo Client ID da API, no ambiente do beta.
4. Faça novo deploy: as variáveis VITE são incorporadas no build. Nunca use VITE para segredo ou DATABASE_URL.
5. Abra `/api/health` pelo domínio da Vercel. Deve retornar `{"ok":true}`.

O proxy mantém os cookies na origem do site; não configure o React para chamar diretamente a URL Railway. Não adicione cache público às rotas /api. API e banco devem existir antes de ativar a flag do site. Para voltar à demonstração, defina VITE_BETA_ENABLED=false e gere novo build.

## Desenvolvimento local

Use um banco/bucket de desenvolvimento, separado do beta. Não conecte testes destrutivos ao banco com dados de amigos.

```sh
npm ci
npm ci --prefix server
cp .env.example .env.local
cp server/.env.example server/.env
```

Preencha server/.env. No .env.local, ative VITE_BETA_ENABLED e preencha o client ID. A API lê server/.env; o Vite lê .env.local. APP_ORIGIN deve ser a URL exata do navegador, inclusive porta. Se usar localhost, não misture com 127.0.0.1.

```sh
cd server
npm run migrate
npm start
```

Em outro terminal, na raiz:

```sh
npm run dev -- --host 127.0.0.1 --port 5175 --strictPort
```

O Vite encaminha /api para 127.0.0.1:3001. Reinicie o Vite ao alterar as variáveis. Sem credenciais, o modo demonstração continua disponível, mas não comprova a integração.

## Critérios para liberar convites

- Conta A entra pelo Google, publica texto/foto e comenta.
- Conta B, em outro navegador, vê a publicação e comenta/curte.
- Atualizar, fechar e entrar novamente mantém dados e favoritos da conta correta.
- Duas curtidas da mesma pessoa não duplicam contagem; descurtir funciona.
- Favoritos de A não aparecem nos favoritos de B.
- Visitante sem sessão e conta fora da lista não acessam feed/fotos nem gravam dados.
- B não consegue excluir post de A; logout invalida o cookie anterior.
- Foto inválida/grande é recusada; falha de rede mantém o rascunho e mostra erro.
- Conferir API via proxy Vercel, cookie Secure/HttpOnly e persistência após redeploy da API.
- Confirmar backup/restauração e orçamento/limites de consumo.

## Limites desta entrega

Ranking, stories, quadras e reservas continuam demonstrativos. Conteúdo fictício não é importado para o feed real. Ainda faltam editor de perfil, paginação além dos 100 posts mais recentes, moderação administrativa, exclusão pela interface e limpeza de fotos órfãs (upload sem publicação ou post excluído). Não liberar cadastro público antes dessas próximas etapas. Para beta pequeno, mantenha uma instância da API; rate limit em memória não é global entre réplicas.

### Testes automatizados

`npm test --prefix server` executa as validações; a integração exige TEST_DATABASE_URL. Use somente um PostgreSQL de desenvolvimento. O teste cria um schema aleatório e o remove ao finalizar, sem limpar tabelas existentes.

```sh
TEST_DATABASE_URL=postgresql://usuario:senha@127.0.0.1:5432/levanta_test npm test --prefix server
```

A suíte integrada aplica migrações duas vezes, testa sessões/revogação/expiração, convite, proteção de origem, feed compartilhado, curtidas idempotentes, favoritos privados, autoria e fotos (S3 simulado localmente). O login Google válido exige validação manual com as credenciais reais; as sessões dos testes são preparadas diretamente no banco.

Os testes locais automatizados não substituem o teste final com Google, PostgreSQL e bucket reais. A integração externa só estará validada depois da configuração e execução dos critérios acima.

## Referências oficiais

- https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid
- https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
- https://docs.railway.com/databases/postgresql
- https://docs.railway.com/storage-buckets
- https://vercel.com/docs/routing/rewrites
