# Ignite Node.js - Fundamentos Challenge

[![CI](https://github.com/gabrielalmir/ignite-nodejs-01-fundamentos-nodejs-challenge/actions/workflows/ci.yml/badge.svg)](https://github.com/gabrielalmir/ignite-nodejs-01-fundamentos-nodejs-challenge/actions/workflows/ci.yml)

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

- Node.js (versão 20 ou superior)
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

## 📊 Importação de Tarefas via CSV

Para importar tarefas em lote via arquivo CSV:

1. Crie um arquivo CSV com o formato:
```csv
title,description
Task 01,Descrição da Task 01
Task 02,Descrição da Task 02
Task 03,Descrição da Task 03
```

2. Execute o comando de importação:
```bash
npm run import [caminho-do-arquivo.csv]
```

Se nenhum caminho for especificado, o script usará `tasks.csv` do diretório raiz.

**Exemplo:**
```bash
npm run import
# ou
npm run import ./meu-arquivo.csv
```

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
Cria uma nova tarefa ou importa múltiplas tarefas via CSV.

**Criar tarefa única (JSON):**
```bash
curl -X POST http://localhost:3333/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Minha Tarefa", "description": "Descrição da tarefa"}'
```

**Importar via CSV (Multipart):**
```bash
curl -X POST http://localhost:3333/tasks \
  -F "file=@tasks.csv"
```

**Resposta (201):**
```json
{
  "message": "Successfully imported 5 tasks from CSV",
  "tasks": [...]
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
