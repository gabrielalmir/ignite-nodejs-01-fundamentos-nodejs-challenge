# Ignite Node.js - Fundamentos Challenge

Uma API REST simples para gerenciamento de tarefas, desenvolvida como desafio do curso Ignite da Rocketseat. Este projeto demonstra os fundamentos do Node.js, usando somente recursos internos do Node.js, incluindo criação de servidor HTTP, roteamento, manipulação de dados e testes end-to-end.

## 🚀 Funcionalidades

- ✅ Criar novas tarefas
- 📋 Listar todas as tarefas
- ✏️ Atualizar tarefas existentes
- 🗑️ Deletar tarefas (futuro)
- 🔍 Buscar tarefa por ID (futuro)
- 📊 Persistência de dados com banco de dados customizado

## 🛠️ Tecnologias Utilizadas

- **Puro Node.js** - Runtime JavaScript
- **HTTP Module** - Servidor HTTP nativo
- **ES Modules** - Sistema de módulos moderno
- **LunaDB** - Banco de dados customizado em arquivo (apenas por desafio adicional)
- **Arquitetura Limpa** - Separação em camadas (Domain, Application, Infrastructure)

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/gabrielalmir/ignite-nodejs-01-fundamentos-nodejs-challenge.git
cd ignite-nodejs-01-fundamentos-nodejs-challenge
```

## ▶️ Como Executar

### Modo Desenvolvimento
```bash
npm run dev
```

### Modo Produção
```bash
npm start
```

O servidor será iniciado em `http://localhost:3333` (ou a porta definida na variável de ambiente `PORT`).

## 🧪 Testes

Execute os testes end-to-end:
```bash
npm test
```

- **Testes E2E**: Testam a API completa usando fetch

## 📡 API Endpoints

### GET /
Retorna o status da aplicação.

**Resposta:**
```json
{
  "status": "ok"
}
```

### POST /tasks
Cria uma nova tarefa.

**Corpo da requisição:**
```json
{
  "title": "Título da tarefa",
  "description": "Descrição da tarefa"
}
```

**Resposta (201):**
```json
{
  "id": "uuid",
  "title": "Título da tarefa",
  "description": "Descrição da tarefa",
  "completed": false,
  "createdAt": "2023-...",
  "updatedAt": "2023-..."
}
```

### GET /tasks
Lista todas as tarefas.

**Resposta:**
```json
[
  {
    "id": "uuid",
    "title": "Título da tarefa",
    "description": "Descrição da tarefa",
    "completed": false,
    "createdAt": "2023-...",
    "updatedAt": "2023-..."
  }
]
```

### PUT /tasks/:id
Atualiza uma tarefa existente.

**Parâmetros:**
- `id` (string): ID da tarefa

**Corpo da requisição:**
```json
{
  "title": "Novo título",
  "description": "Nova descrição"
}
```

**Resposta (200):**
```json
{
  "id": "uuid",
  "title": "Novo título",
  "description": "Nova descrição",
  "completed": false,
  "createdAt": "2023-...",
  "updatedAt": "2023-..."
}
```

## 👨‍💻 Autor

**Gabriel** - [GitHub](https://github.com/gabrielalmir)

---

⭐ Se este projeto te ajudou, dê uma estrela!
