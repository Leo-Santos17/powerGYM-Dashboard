# Dashboard de Academia - Monitoramento Preditivo de Evasão (Churn)

Este repositório contém uma aplicação completa para previsão de evasão de alunos (Churn), composta por uma interface frontend rica e moderna em React (Vite) e uma API de predição desenvolvida em Python (Flask).

---

## 🏗️ Arquitetura do Projeto

O projeto é dividido em duas partes principais:

1. **Frontend (React + Vite)**:
   - Dashboard dinâmico para monitoramento de risco.
   - Interface de upload de dois arquivos obrigatórios: **Base de Clientes** e **Planilha da Catraca**.
   - Integração com a API Flask para predição em tempo real.
   - Exibição de probabilidades formatadas como porcentagem detalhada (uma casa decimal).
   - Tratamento visual de erros e estados de carregamento.

2. **Backend (Python + Flask)**:
   - Localizado no diretório `api-python`.
   - Processa os arquivos enviados via `multipart/form-data`.
   - Gerencia a execução das predições de churn e retorna uma lista estruturada de alunos com suas respectivas probabilidades de evasão.

---

## 🚀 Como Rodar o Projeto

### 1. Preparar e Rodar o Backend (API Python)

Navegue até a pasta da API Python e instale as dependências necessárias:

```bash
cd api-python
pip install -r requirements.txt
```

Inicie o servidor Flask:

```bash
python app.py
```

O backend estará ativo em `http://localhost:5000`.

### 2. Rodar o Frontend (React)

Na raiz do projeto, instale as dependências do Node.js:

```bash
npm install
```

Inicie o servidor de desenvolvimento do Vite:

```bash
npm run dev
```

O dashboard estará disponível em `http://localhost:5173` (ou na porta configurada pelo Vite).

---

## 📊 Fluxo de Arquivos

Para realizar a análise preditiva de churn de forma bem-sucedida, você deve fornecer dois arquivos na seção de upload:

1. **Base de Clientes** (Aceita extensões `.csv` e `.xlsx`)
2. **Planilha da Catraca** (Aceita extensões `.csv`, `.xlsx` e `.xls`)

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React, Chart.js, Vanilla CSS, Vite.
- **Backend**: Python, Flask, Flask-CORS, Pandas.
