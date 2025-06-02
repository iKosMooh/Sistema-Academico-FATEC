# 🎓 Sistema Acadêmico FATEC

![Banner](https://via.placeholder.com/1200x400/1e3a8a/ffffff?text=Sistema+Acadêmico+FATEC)
*Sistema integrado de gestão acadêmica para Faculdades de Tecnologia*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![Next.js](https://img.shields.io/badge/Next.js-v14-blue)

Sistema completo para gestão acadêmica da FATEC, integrando controle de alunos, disciplinas, notas e processos acadêmicos em uma plataforma eficiente e segura.

## 🌟 Funcionalidades Principais

- 👥 **Gestão de usuários** (alunos, professores, administradores)  
- 📚 **Controle acadêmico** (disciplinas, turmas, horários)  
- 📊 **Lançamento de notas** e frequências em tempo real  
- 📈 **Relatórios acadêmicos** automatizados  
- 🔐 **Autenticação segura** com níveis de acesso  
- 📱 **Interface responsiva** para qualquer dispositivo  

## 🛠 Stack Tecnológica

| Área          | Tecnologias                                                                 |
|---------------|-----------------------------------------------------------------------------|
| **Frontend**  | Next.js, React, Tailwind CSS                                                |
| **Backend**   | Node.js, Next.js API Routes                                                 |
| **Banco de Dados** | Prisma ORM (PostgreSQL/MySQL/SQLite)                                        |
| **Autenticação** | NextAuth.js                                                               |
| **Ferramentas** | Git, GitHub, npm, Vercel                                                  |

## 🚀 Começando

### Pré-requisitos

- Node.js v18+
- npm v9+
- Banco de dados (PostgreSQL recomendado)
- Conta no GitHub

### Instalação Passo a Passo

1. **Clonar o repositório**:
   ```bash
   git clone https://github.com/iKosMooh/Sistema-Academico-FATEC.git
   cd Sistema-Academico-FATEC
Instalar dependências:

bash
npm install
Configurar ambiente:

bash
cp .env.example .env
# Edite o .env com suas configurações
Configurar banco de dados:

bash
npx prisma generate
npx prisma migrate dev --name init
Iniciar servidor:

bash
npm run dev
Acessar sistema:

http://localhost:3000
⚙️ Configuração
Variáveis de Ambiente (/.env)
Variável	Descrição	Exemplo
DATABASE_URL	URL de conexão com o banco de dados	postgresql://user:pass@localhost:5432/db
NEXTAUTH_SECRET	Segredo para criptografia de sessões	s3cretKey!
NEXTAUTH_URL	URL base da aplicação	http://localhost:3000
Estrutura de Pastas
├── prisma/
│   └── schema.prisma        # Modelos do banco de dados
├── src/
│   ├── app/                 # Rotas da aplicação
│   ├── components/          # Componentes React
│   ├── lib/                 # Utilitários
│   └── styles/              # CSS global
├── .env.example             # Modelo de configuração
└── package.json             # Dependências
📋 Guia de Uso
Fluxos Principais
Login:

Acesse /login

Use credenciais de administrador, professor ou aluno

Dashboard Administrativo:

Gerenciar usuários

Criar disciplinas e turmas

Gerar relatórios institucionais

Painel do Professor:

Lançar notas e faltas

Gerenciar atividades

Acompanhar desempenho da turma

Portal do Aluno:

Visualizar notas e frequência

Acessar materiais de aula

Ver histórico acadêmico

Comandos Úteis
Comando	Descrição
npm run dev	Inicia servidor de desenvolvimento
npm run build	Cria build de produção
npm run start	Inicia build de produção
npx prisma studio	Abre interface do banco de dados
npx prisma migrate dev	Executa migrações de banco
🤝 Como Contribuir
Faça um fork do projeto

Crie sua branch (git checkout -b feature/nova-funcionalidade)

Commit suas alterações (git commit -m 'Adiciona recurso X')

Push para a branch (git push origin feature/nova-funcionalidade)

Abra um Pull Request

Padrões:

Siga Conventional Commits

Documente novas funcionalidades

Mantenha testes atualizados

📄 Licença
Distribuído sob licença MIT. Veja LICENSE para detalhes.

✉️ Contato
Equipe de Desenvolvimento

GitHub: @iKosMooh

