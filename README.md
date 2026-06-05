# AuraBrew Dashboard — Arquitetura de Dados

Este projeto é uma pequena fábrica de informações: ele pega sinais do sensor, guarda esses dados num lugar acessível pela internet e mostra tudo em um painel visual simples.

## Visão geral

O caminho dos dados é assim:

1. **ESP32** coleta temperatura + estado do relé.
2. O dado é enviado para a **nuvem**.
3. A nuvem grava em **Google Sheets**.
4. O **dashboard** lê o Google Sheets publicado como CSV e mostra painel, gráficos e tabelas.

Esse é o ciclo completo: do hardware até a tela.

## Componentes da arquitetura

### 1. ESP32

O ESP32 é a origem dos dados. Ele normalmente faz isso:

- lê o sensor de temperatura
- decide se o relé deve estar ligado ou desligado
- calcula valores de consumo ou gera o registro do momento
- envia tudo para um serviço na nuvem

Mesmo que o código do ESP32 não esteja aqui, a ideia é que ele seja o produtor de dados.

### 2. Nuvem

A nuvem funciona como um intermediário confiável.

- pode ser um endpoint HTTP, um webhook ou um pequeno script que recebe os dados do ESP32
- recebe as leituras com horário e valores
- encaminha ou grava os dados no Google Sheets

Esse passo é importante para não deixar o ESP32 dependente de uma página web direta.

### 3. Google Sheets

O Google Sheets é o banco de dados fácil de usar do projeto.

- as planilhas estão publicadas como CSV
- o dashboard consome esse CSV diretamente
- isso torna o acesso simples, sem precisar de backend complexo

No `js/config.js` e em `js/db.js`, o dashboard busca URLs do Google Sheets publicadas como CSV.

### 4. Dashboard

O dashboard é a interface final, feita com HTML, CSS e JavaScript.

- ele busca planilhas publicadas como CSV
- transforma cada linha em registro
- mostra:
  - temperatura atual
  - status do relé
  - consumo acumulado
  - apontadores de produção
  - gráfico de temperatura
  - gráfico de consumo
  - tabela dos últimos registros

O `js/app.js` cuida da lógica do sensor em tempo real e da renderização dos gráficos.

## Como os dados fluem na prática

### Fluxo típico

ESP32 → Nuvem → Google Sheets → Dashboard

- o ESP32 gera um novo registro a cada leitura
- a nuvem grava na planilha do Google Sheets
- o dashboard, a cada 10 segundos, faz `fetch` na planilha publicamente disponível
- as funções JavaScript convertem o CSV em objetos e atualizam a tela

### Porque esse fluxo funciona bem

- o ESP32 não precisa saber nada sobre a interface
- o Google Sheets serve como uma camada de armazenamento simples e compartilhável
- o dashboard não precisa de servidor próprio além de um host estático ou mesmo `file://` se rodar localmente com caminhos públicos

## Porque essa arquitetura foi escolhida

- **simplicidade**: Google Sheets evita banco de dados e backend complexo
- **visibilidade**: dados ficam visíveis e editáveis em um lugar conhecido
- **flexibilidade**: o dashboard só precisa do CSV para reconstruir visualizações
- **rapidez**: mudanças no Google Sheets caem no dashboard sem deploy de backend

## O que deve existir em cada parte

### ESP32
- registro de tempo
- temperatura
- status do relé
- consumo ou outro valor relevante

### Nuvem
- endpoint que recebe os dados
- processo que escreve na planilha ou atualiza o CSV

### Google Sheets
- planilha publicada como CSV
- colunas claras, por exemplo:
  - `dataHora`
  - `temperatura`
  - `rele`
  - `consumoLinha`
  - `consumoAcumulado`

### Dashboard
- leitura de CSV
- tratamento dos dados
- atualização de gráficos e tabelas
- feedback visual para o usuário

## Resumo simples

O sistema funciona como uma corrente:

- o ESP32 é o gerador de informação
- a nuvem é o mensageiro confiável
- o Google Sheets é o repositório acessível
- o dashboard é a vitrine visual

Se você quiser, posso também adicionar um diagrama em ASCII ou uma seção de “como conectar o ESP32 ao Google Sheets”.
