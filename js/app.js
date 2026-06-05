// APP.JS — Lógica do sensor em tempo real (Google Sheets)

// Utils
function analisarCSV(texto) {
  const linhas = texto.trim().split('\n').filter(linha => linha.trim());
  return linhas.slice(1).map(linha => {
    const colunas = linha.split(',').map(coluna => coluna.replace(/^"|"$/g, '').trim());
    return {
      dataHora:         colunas[0] || '',
      temperatura:      parseFloat((colunas[1] || '0').replace(',', '.')),
      rele:             (colunas[2] || 'DESLIGADO').toUpperCase().trim(),
      consumoLinha:     parseFloat((colunas[3] || '0').replace(',', '.')),
      consumoAcumulado: parseFloat((colunas[4] || '0').replace(',', '.'))
    };
  }).filter(registro => !isNaN(registro.temperatura));
}

// Formata apenas a hora. Aceita duas situações:
// - se já estiver em `dd/mm/aaaa hh:mm:ss`, retorna só a parte da hora
// - se vier em timestamp/ISO, converte para hora local em `pt-BR`
function formatarHora(entrada) {
  try {
    if (typeof entrada === 'string' && entrada.includes('/')) {
      const [data, hora] = entrada.split(' ');
      return hora || entrada;
    }

    const data = new Date(entrada);
    if (isNaN(data)) return entrada;

    return data.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return entrada;
  }
}

// Formata data e hora no padrão brasileiro.
// Se o valor já estiver em formato brasileiro, preservamos exatamente a string original.
function formatarDataHora(entrada) {
  try {
    if (typeof entrada === 'string' && entrada.includes('/')) {
      return entrada;
    }

    const data = new Date(entrada);
    if (isNaN(data)) return entrada;

    return data.toLocaleString('pt-BR');
  } catch {
    return entrada;
  }
}

function obterStatus(temperatura) {
  if (temperatura < MINIMO_AVISO || temperatura > MAXIMO_AVISO) return 'CRITICAL';
  if (temperatura < MINIMO_IDEAL || temperatura > MAXIMO_IDEAL) return 'WARNING';
  return 'OK';
}

const ROTULO_STATUS = {
  OK:       '✓  OK',
  WARNING:  '⚠  Atenção',
  CRITICAL: '✕  Crítico'
};

// Atualização principal
function atualizar(registros) {
  if (!registros.length) return;

  const MAX_PONTOS  = 60;
  const recentes    = registros.slice(-MAX_PONTOS);
  const ultimo      = registros[registros.length - 1];
  const temperatura = ultimo.temperatura;

  // KPI cards
  document.getElementById('kpi-temp').innerHTML = `${temperatura.toFixed(1)}<span class="kpi-unit">°C</span>`;
  document.getElementById('kpi-kwh').innerHTML  = `${ultimo.consumoAcumulado.toFixed(4)}<span class="kpi-unit">kWh</span>`;
  document.getElementById('kpi-pts').innerHTML  = `${registros.length}<span class="kpi-unit">pts</span>`;

  const elementoRele = document.getElementById('rele-value');
  elementoRele.textContent = ultimo.rele;
  elementoRele.className   = ultimo.rele;
  document.getElementById('kpi-rele-sub').textContent = ultimo.rele === 'LIGADO' ? 'Resfriamento ativo' : 'Sistema em espera';

  // Status badge
  const situacao = obterStatus(temperatura);
  document.getElementById('status-badge').className = situacao;
  document.getElementById('status-text').textContent = ROTULO_STATUS[situacao];

  // Temp sub
  const textoDiferenca =
    temperatura < MINIMO_IDEAL ? `${(MINIMO_IDEAL - temperatura).toFixed(1)}°C abaixo do mínimo` :
    temperatura > MAXIMO_IDEAL ? `${(temperatura - MAXIMO_IDEAL).toFixed(1)}°C acima do máximo` :
    'Dentro da faixa ideal (18–24°C)';
  document.getElementById('kpi-temp-sub').textContent = textoDiferenca;

  // Faixa bar
  const percentual    = Math.min(100, Math.max(0, ((temperatura - MINIMO_AVISO) / (MAXIMO_AVISO - MINIMO_AVISO)) * 100));
  const preenchimento = document.getElementById('faixa-fill');
  preenchimento.style.width = `${percentual}%`;
  preenchimento.style.background =
    situacao === 'OK'       ? 'linear-gradient(90deg,#00c4b4,#00a090)' :
    situacao === 'WARNING'  ? 'linear-gradient(90deg,#e8451a,#d4266a)' :
                              'linear-gradient(90deg,#d4266a,#8b0a3a)';
  document.getElementById('faixa-pct').textContent = `${percentual.toFixed(0)}%`;

  // Timestamp
  const agora = new Date();
  document.getElementById('last-update').textContent = `Atualizado ${agora.toLocaleTimeString('pt-BR')}`;
  document.getElementById('footer-info').innerHTML =
    `Dashboard IoT · ${agora.toLocaleDateString('pt-BR')}<br/>Premium Beer · Good Music · Good People`;

  // Charts data
  const rotulos      = recentes.map(registro => formatarHora(registro.dataHora));
  const temperaturas = recentes.map(registro => registro.temperatura);
  const consumos     = recentes.map(registro => registro.consumoAcumulado);

  graficoTemp.data.labels              = rotulos;
  graficoTemp.data.datasets[0].data    = temperaturas;
  graficoTemp.update('none');

  graficoConsumo.data.labels           = rotulos;
  graficoConsumo.data.datasets[0].data = consumos;
  graficoConsumo.update('none');

  // Tabela sensor
  const corpoTabela = document.getElementById('tabela-body');
  const ultimos15   = registros.slice(-15).reverse();
  corpoTabela.innerHTML = ultimos15.map(registro => {
    const situacao   = obterStatus(registro.temperatura);
    const classeTemp = situacao === 'OK' ? 'badge-ok' : situacao === 'WARNING' ? 'badge-warn' : 'badge-crit';
    const classeRele = registro.rele === 'LIGADO' ? 'badge-on' : 'badge-off';
    return `<tr>
      <td>${formatarDataHora(registro.dataHora)}</td>
      <td class="${classeTemp}">${registro.temperatura.toFixed(1)}°C</td>
      <td class="${classeRele}">${registro.rele}</td>
      <td>${registro.consumoAcumulado.toFixed(4)}</td>
    </tr>`;
  }).join('');
}

// Fetch
async function buscarDados() {
  try {
    const resposta  = await fetch(URL_PLANILHA_SENSOR + '&nocache=' + Date.now());
    if (!resposta.ok) throw new Error('HTTP ' + resposta.status);
    const texto     = await resposta.text();
    const registros = analisarCSV(texto);
    if (registros.length) atualizar(registros);
  } catch (erro) {
    document.getElementById('last-update').textContent = 'Erro: ' + erro.message;
    console.error(erro);
  }
}

// Init
buscarDados();
setInterval(buscarDados, INTERVALO);