# Meu Álbum 📸

Um aplicativo web moderno de galeria de fotos, projetado para oferecer uma experiência rápida, responsiva e instalável (PWA).

## 🚀 Tecnologias e Padrões de Desenvolvimento

O projeto foi construído utilizando as tecnologias mais modernas do ecossistema React e Node.js:

- **Framework:** [TanStack Start](https://tanstack.com/start) e [React 19](https://react.dev/) (Roteamento baseado em arquivos com SSR/SSG).
- **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/) com design system UI através do [Radix UI](https://www.radix-ui.com/) e animações com [Framer Motion](https://www.framer.com/motion/).
- **Banco de Dados & ORM:** [Drizzle ORM](https://orm.drizzle.team/) com SQLite local (`@libsql/client`).
- **Armazenamento de Mídia:** [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) para upload de fotos seguro na nuvem.
- **PWA:** Suporte a Progressive Web App via `vite-plugin-pwa`, permitindo instalação nativa no dispositivo.
- **Servidor:** Vite com adaptador Nitro para alta performance.

### Padrões Arquiteturais
- **File-based Routing:** As rotas são baseadas em arquivos dentro de `src/routes/`.
- **Server Functions:** As mutações e requisições para o banco de dados/API acontecem através de *Server Functions* integradas nativamente pelo TanStack Start (funções Isomorphic).
- **Componentes Modulares:** A pasta `src/components/` contém componentes UI reutilizáveis seguindo boas práticas do design system.

---

## 📂 Estrutura do Projeto

```text
meu-album/
├── public/                 # Ícones do PWA e assets estáticos (ex: logo.ico)
├── src/
│   ├── components/         # Componentes de interface (botões, cards, dialogs, ui genérica)
│   ├── lib/                # Configurações auxiliares, utilitários, e conexões
│   ├── routes/             # Páginas da aplicação e Server Functions (Roteamento)
│   ├── styles.css          # CSS global e declaração de tokens do Tailwind
│   └── ...
├── dev.db                  # Banco de Dados local SQLite
├── drizzle.config.ts       # Configurações do Drizzle ORM
├── vite.config.ts          # Configurações do Vite (incluindo PWA)
└── package.json            # Dependências e scripts
```

---

## ⚙️ Configuração do Ambiente (.env)

O projeto requer algumas variáveis de ambiente para funcionar corretamente (especialmente comunicação com banco e uploads).

1. Crie um arquivo na raiz do projeto chamado `.env` ou `.env.local` 
2. Você pode basear-se no `.env.example` fornecido:

```env
# Banco de Dados
DATABASE_URL="file:dev.db"

# Upload Vercel Blob (Adicione seu Token de leitura/escrita)
BLOB_READ_WRITE_TOKEN="seu_token_da_vercel_blob_aqui"

# Autenticação/Config (Senha administrativa, se aplicável ao seu painel)
SENHAADM="sua_senha_de_admin_aqui"
```

---

## 💻 Como Rodar o Projeto

Siga os passos abaixo para iniciar a aplicação localmente:

1. **Instalar Dependências**
```bash
npm install
```

2. **Iniciar o Servidor de Desenvolvimento**
```bash
npm run dev
```

> **Acesso:** Abra seu navegador em [http://localhost:3000](http://localhost:3000). O site carregará o cliente e fará *Hot Module Replacement (HMR)* sempre que editar um arquivo.

3. **Geração e Migração do Banco de Dados (Drizzle)**
Se houverem alterações no schema do banco, você pode usar os seguintes comandos do Drizzle:
- `npm run db:generate` (Gera as migrações com base no seu schema)
- `npm run db:push` (Aplica o schema diretamente ao banco - recomendado em ambiente local rápido)
- `npm run db:studio` (Abre um painel web para inspecionar os dados do SQLite local)

---

## 📦 Construindo para Produção

Para compilar a aplicação e publicá-la (Deploy):

```bash
npm run build
```

Isso criará uma pasta `.output/` otimizada (via Nitro). O pacote resultante é altamente portável para hospedagens Node.js ou Edge.

---

## 📱 PWA - Instalando o Aplicativo

Como o projeto é PWA-Ready:
- Em um navegador compatível (ex: Chrome, Edge, Safari), abrir o site exibirá o aviso nativo para "Instalar App", que o transformará em uma janela *standalone* em seu desktop/mobile sem as barras do navegador.
- Os ícones estão em `public/pwa-192x192.svg` e podem ser facilmente alterados para customizar a exibição.
