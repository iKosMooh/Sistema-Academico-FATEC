# 🎓 Sistema Acadêmico FATEC

![Banner](https://via.placeholder.com/1200x400/1e3a8a/ffffff?text=Sistema+Acadêmico+FATEC)
*Sistema integrado de gestão acadêmica para Faculdades de Tecnologia*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![Next.js](https://img.shields.io/badge/Next.js-v14-blue)

Sistema de gerenciamento acadêmico desenvolvido para a FATEC, visando facilitar o controle de alunos, disciplinas, notas e demais informações acadêmicas de forma integrada, eficiente e segura.

---

## 📑 Sumário

- [Descrição](#descrição)
- [Funcionalidades](#funcionalidades)
- [Stack Tecnológica](#stack-tecnológica)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Guia de Uso](#guia-de-uso)
- [Contribuição](#contribuição)
- [Licença](#licença)
- [Contato](#contato)

---

## 📝 Descrição

Este projeto é um sistema acadêmico completo que permite a gestão de dados como cadastro de alunos, professores, disciplinas, turmas, lançamento de notas e geração de relatórios. Desenvolvido para apoiar os processos administrativos e pedagógicos da FATEC, com foco em usabilidade, segurança e acessibilidade.

---

## 🌟 Funcionalidades

- 👥 Cadastro e gerenciamento de usuários (alunos, professores, administradores)
- 📚 Controle de disciplinas e turmas
- 📊 Lançamento e consulta de notas e frequências
- 📈 Geração de relatórios acadêmicos automatizados
- 🔐 Autenticação segura e controle de acesso por níveis
- 📱 Interface responsiva e intuitiva para qualquer dispositivo

---

## 🛠 Stack Tecnológica

| Área               | Tecnologias                                                                 |
|--------------------|-----------------------------------------------------------------------------|
| **Frontend**       | Next.js, React, Tailwind CSS                                                |
| **Backend**        | Node.js, Next.js API Routes                                                 |
| **Banco de Dados** | Prisma ORM (PostgreSQL/MySQL/SQLite)                                        |
| **Autenticação**   | NextAuth.js                                                                 |
| **Ferramentas**    | Git, GitHub, npm, Vercel                                                    |

---

## 🚀 Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/iKosMooh/Sistema-Academico-FATEC.git
   cd Sistema-Academico-FATEC
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure o ambiente:**
   ```bash
   cp .env.example .env
   # Edite o arquivo .env com suas configurações
   ```

4. **Configure o banco de dados:**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

5. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

6. **Acesse o sistema:**
   - Abra o navegador e acesse: [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Configuração

### Variáveis de Ambiente (`.env`)

| Variável         | Descrição                                 | Exemplo                                      |
|------------------|-------------------------------------------|----------------------------------------------|
| DATABASE_URL     | URL de conexão com o banco de dados       | `mysql://user:password@localhost:3306/database`   |
| NEXTAUTH_SECRET  | Segredo para criptografia de sessões      | `your-secret-key-here`                      |
| NEXTAUTH_URL     | URL base da aplicação                     | `http://localhost:3000`                      |

---

## 📂 Estrutura de Pastas

```
├── prisma/
│   └── schema.prisma        # Modelos do banco de dados
├── src/
│   ├── app/                 # Rotas da aplicação
│   ├── components/          # Componentes React
│   ├── lib/                 # Utilitários
│   └── styles/              # CSS global
├── .env.example             # Modelo de configuração
└── package.json             # Dependências
```

---

## 📋 Guia de Uso

### Fluxos Principais

- **Login:**  
  Acesse `/login` e utilize credenciais de administrador, professor ou aluno.

- **Dashboard Administrativo:**  
  Gerencie usuários, crie disciplinas e turmas, e gere relatórios institucionais.

- **Painel do Professor:**  
  Lance notas e faltas, gerencie atividades e acompanhe o desempenho da turma.

- **Portal do Aluno:**  
  Visualize notas, frequência, materiais de aula e histórico acadêmico.

### Comandos Úteis

| Comando                  | Descrição                                 |
|--------------------------|-------------------------------------------|
| `npm run dev`            | Inicia servidor de desenvolvimento        |
| `npm run build`          | Cria build de produção                    |
| `npm run start`          | Inicia build de produção                  |
| `npx prisma studio`      | Abre interface do banco de dados          |
| `npx prisma migrate dev` | Executa migrações de banco                |

---

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie sua branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas alterações (`git commit -m 'Adiciona recurso X'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

**Padrões:**
- Siga [Conventional Commits](https://www.conventionalcommits.org/)
- Documente novas funcionalidades
- Mantenha testes atualizados

---

## 📄 Licença

Distribuído sob licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## ✉️ Contato

- **Equipe de Desenvolvimento**
- GitHub: [@iKosMooh](https://github.com/iKosMooh)
- E-mail: contato@fatec.edu.br
- Site: [www.fatec.edu.br](https://www.fatec.edu.br)

---
