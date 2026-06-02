# Documentação do Processo de Refatoração e Integração

Este documento detalha o processo técnico de adaptação do frontend da aplicação "Dashboard Academia" para integração com a nova API Flask de predição de Churn, bem como as funcionalidades de busca e paginação otimizadas.

---

## 📌 Contexto e Objetivos

O sistema anteriormente utilizava uma única planilha e realizava predições simuladas localmente ou via uma API Mock. A refatoração e as adições atuais visam:
- Permitir o envio de **dois arquivos distintos** (Base de Clientes e Planilha da Catraca) via `multipart/form-data` para a API Flask rodando em `http://localhost:5000/upload`.
- **Híbrido**: Permitir o envio tanto de arquivos CSV quanto Excel (`.csv, .xlsx, .xls`) para **ambos** os campos de upload, mantendo o visual intacto.
- **Busca por Nome**: Adicionar uma barra de busca para filtrar alunos por nome de forma case-insensitive e parcial.
- **Gráficos Dinâmicos**: Sincronizar o gráfico de distribuição visual para atualizar em tempo real conforme a pesquisa de texto ativa.
- **Paginação Segura**: Adicionar paginação de 10 itens por página em ambas as listas de alunos, limitando a exibição a no máximo **5 botões de páginas numéricas** (formato carrossel/janela deslizante) para evitar quebras visuais de tela.

---

## 🛠️ Alterações Implementadas no Frontend (`src/App.jsx`)

### 1. Reorganização e Sincronização dos Gráficos
- As variáveis auxiliares de busca e filtro (`alunosGeraisFiltrados`) foram movidas para o topo do componente.
- O cálculo das métricas do gráfico (`totalAlto`, `totalMedio`, `totalBaixo`) foi alterado para consumir os dados filtrados em vez da lista completa estática:
  ```javascript
  const totalAlto = alunosGeraisFiltrados.filter(p => p.probabilidade >= 0.7).length;
  ```

### 2. Janela Deslizante de Paginação (Máximo 5 Páginas)
- O helper `renderPagination` foi reestruturado para implementar um limitador de páginas exibidas ao redor da página ativa atual:
  ```javascript
  let startPage = Math.max(1, paginaAtual - 2);
  let endPage = Math.min(totalPaginas, startPage + 4);
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }
  ```
- Isso garante que, mesmo que haja dezenas de páginas, a interface permaneça limpa e sem quebras visuais na tela.

### 3. Habilitação de Excel para a Base de Clientes
- Alterado o atributo `accept` do input `fileInputClientes` para:
  ```jsx
  accept=".csv, .xlsx, .xls"
  ```
- Isso permite a seleção flexível de arquivos CSV e planilhas de Excel.

---

## 🔍 Processo de Verificação e Qualidade

- **Construção de Produção**: Executado `npm run build` localmente com sucesso.
- **Validação de Estilos**: Nenhuma alteração foi realizada nas regras de estilo originais além do acréscimo das regras de busca/paginações. A Regra de Ouro foi mantida integralmente.
