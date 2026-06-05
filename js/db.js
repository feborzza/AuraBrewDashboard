const URL_MATERIA_PRIMA  = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS9QbqX8p0UoXys8fsxkq1IFwIXXQeRT51scN3bxVL384JS_TGExcOndgA64WLEuyNa_Thhfbc9S2mv/pub?gid=739226076&single=true&output=csv";
const URL_ESTAGIOS       = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS9QbqX8p0UoXys8fsxkq1IFwIXXQeRT51scN3bxVL384JS_TGExcOndgA64WLEuyNa_Thhfbc9S2mv/pub?gid=1342554411&single=true&output=csv";
const URL_INDICADORES    = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS9QbqX8p0UoXys8fsxkq1IFwIXXQeRT51scN3bxVL384JS_TGExcOndgA64WLEuyNa_Thhfbc9S2mv/pub?gid=1831833715&single=true&output=csv";
const URL_CUSTO          = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS9QbqX8p0UoXys8fsxkq1IFwIXXQeRT51scN3bxVL384JS_TGExcOndgA64WLEuyNa_Thhfbc9S2mv/pub?gid=1686605078&single=true&output=csv";

function analisarCSVGenerico(texto) {
  const linhas = texto.trim().split("\n").filter(linha => linha.trim());
  const cabecalhos = linhas[0].split(",").map(cabecalho => cabecalho.replace(/^"|"$/g, "").trim());
  return linhas.slice(1).map(linha => {
    const colunas = linha.split(",").map(coluna => coluna.replace(/^"|"$/g, "").trim());
    const objeto = {};
    cabecalhos.forEach((cabecalho, i) => objeto[cabecalho] = colunas[i] || "");
    return objeto;
  });
}

function analisarPercentual(valor) {
  return parseFloat(valor.toString().replace("%", "").replace(",", ".")) || 0;
}

function analisarNumero(valor) {
  return parseFloat(valor.toString().replace(",", ".")) || 0;
}

async function carregarKPIs() {
  try {
    const resposta  = await fetch(URL_INDICADORES + "&nocache=" + Date.now());
    const texto     = await resposta.text();
    const registros = analisarCSVGenerico(texto);

    registros.forEach(registro => {
      const indicador = (registro["Indicador"] || "").trim();
      const valor     = (registro["Valor"] || "").toString().trim();

      if (indicador === "Produção Total do Período") {
        document.getElementById("stat-producao").textContent = analisarNumero(valor).toFixed(2);
      }
      if (indicador === "Lotes Produzidos") {
        document.getElementById("stat-lotes").textContent = valor;
      }
      if (indicador === "Cerveja em Fermentação") {
        document.getElementById("stat-fermentacao").textContent = analisarNumero(valor).toFixed(2);
      }
    });
  } catch (erro) {
    console.error("Erro ao carregar KPIs:", erro);
  }
}

async function carregarEstagios() {
  try {
    const resposta  = await fetch(URL_ESTAGIOS + "&nocache=" + Date.now());
    const texto     = await resposta.text();
    const registros = analisarCSVGenerico(texto);

    const mapeamento = {
      "Brassagem":   "brassagem",
      "Fervura":     "fervura",
      "Fermentação": "fermentacao",
      "Maturação":   "maturacao",
      "Envase":      "envase"
    };

    registros.forEach(registro => {
      const estagio = (registro["Estágio"] || "").trim();
      const chave   = mapeamento[estagio];
      if (!chave) return;

      const percentual    = analisarPercentual(registro["Progresso"] || "0");
      const preenchimento = document.getElementById("prog-" + chave);
      const rotulo        = document.getElementById("pct-" + chave);
      if (preenchimento)  preenchimento.style.width  = percentual + "%";
      if (rotulo)         rotulo.textContent          = percentual + "%";
    });
  } catch (erro) {
    console.error("Erro ao carregar Estágios:", erro);
  }
}

async function carregarCusto() {
  try {
    const resposta  = await fetch(URL_CUSTO + "&nocache=" + Date.now());
    const texto     = await resposta.text();
    const registros = analisarCSVGenerico(texto);

    const rotulos = registros.map(registro => registro["Data"] || "");
    const real    = registros.map(registro => analisarNumero(registro["Custo Total (Real)"]));
    const orcado  = registros.map(registro => analisarNumero(registro["Custo Orçado (Esperado)"]));

    graficoCusto.data.labels           = rotulos;
    graficoCusto.data.datasets[0].data = orcado;
    graficoCusto.data.datasets[1].data = real;
    graficoCusto.update();
  } catch (erro) {
    console.error("Erro ao carregar Custo:", erro);
  }
}

async function carregarMateriaPrima() {
  try {
    const resposta  = await fetch(URL_MATERIA_PRIMA + "&nocache=" + Date.now());
    const texto     = await resposta.text();
    const registros = analisarCSVGenerico(texto);

    const corpoTabela = document.getElementById("tabela-materia");
    corpoTabela.innerHTML = registros.map(registro => `<tr>
      <td style="color:var(--cream);font-weight:500">${registro["Insumo"] || ""}</td>
      <td>${registro["Entrada"] || ""}</td>
      <td>${registro["Unidade"] || ""}</td>
      <td>${registro["Saída"] || registro["Saida"] || ""}</td>
      <td>${registro["Saldo"] || ""}</td>
    </tr>`).join("");
  } catch (erro) {
    console.error("Erro ao carregar Matéria-Prima:", erro);
  }
}

carregarKPIs();
carregarEstagios();
carregarCusto();
carregarMateriaPrima();