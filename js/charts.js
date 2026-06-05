// CHART.JS — Inicialização dos gráficos

Chart.defaults.color       = 'rgba(245,230,200,0.4)';
Chart.defaults.borderColor = 'rgba(245,230,200,0.07)';
Chart.defaults.font.family = 'Inter';

// Contextos
const contextoTemp    = document.getElementById('chartTemp').getContext('2d');
const contextoConsumo = document.getElementById('chartConsumo').getContext('2d');
const contextoCusto   = document.getElementById('chartCusto').getContext('2d');

// Gradientes
const gradienteTemp = contextoTemp.createLinearGradient(0, 0, 0, 260);
gradienteTemp.addColorStop(0,   'rgba(232,69,26,0.35)');
gradienteTemp.addColorStop(0.6, 'rgba(232,69,26,0.08)');
gradienteTemp.addColorStop(1,   'rgba(232,69,26,0)');

const gradienteConsumo = contextoConsumo.createLinearGradient(0, 0, 0, 200);
gradienteConsumo.addColorStop(0, 'rgba(0,196,180,0.3)');
gradienteConsumo.addColorStop(1, 'rgba(0,196,180,0)');

// Tooltip padrão
const estiloTooltip = {
  backgroundColor: '#111',
  borderColor: 'rgba(245,230,200,0.1)',
  borderWidth: 1,
  titleColor: '#f5e6c8',
  bodyColor: 'rgba(245,230,200,0.55)'
};

// Gráfico: Temperatura
const graficoTemp = new Chart(contextoTemp, {
  type: 'line',
  data: { labels: [], datasets: [{
    label: 'Temperatura °C',
    data: [],
    borderColor: '#e8451a',
    backgroundColor: gradienteTemp,
    borderWidth: 2,
    pointRadius: 2,
    pointHoverRadius: 5,
    pointBackgroundColor: '#e8451a',
    tension: 0.4,
    fill: true
  }]},
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      annotation: {
        annotations: {
          lineMin: {
            type: 'line', yMin: MINIMO_IDEAL, yMax: MINIMO_IDEAL,
            borderColor: 'rgba(0,196,180,0.45)', borderWidth: 1, borderDash: [5, 4],
            label: { content: '18°C', display: true, position: 'end', color: '#00c4b4', font: { size: 10, family: 'Bebas Neue' }, backgroundColor: 'transparent', padding: 0 }
          },
          lineMax: {
            type: 'line', yMin: MAXIMO_IDEAL, yMax: MAXIMO_IDEAL,
            borderColor: 'rgba(0,196,180,0.45)', borderWidth: 1, borderDash: [5, 4],
            label: { content: '24°C', display: true, position: 'end', color: '#00c4b4', font: { size: 10, family: 'Bebas Neue' }, backgroundColor: 'transparent', padding: 0 }
          }
        }
      },
      tooltip: estiloTooltip
    },
    scales: {
      x: { grid: { color: 'rgba(245,230,200,0.04)' }, ticks: { maxTicksLimit: 8, maxRotation: 0, font: { size: 10 } } },
      y: { grid: { color: 'rgba(245,230,200,0.04)' }, ticks: { callback: valor => valor + '°C', font: { size: 10 } }, suggestedMin: 10, suggestedMax: 30 }
    }
  }
});

// Gráfico: Custo de Produção (dados do banco — preenchido via db.js)
const graficoCusto = new Chart(contextoCusto, {
  type: 'line',
  data: { labels: [], datasets: [
    {
      label: 'Custo Orçado (Esperado)',
      data: [],
      borderColor: 'rgba(245,230,200,0.4)',
      borderWidth: 1.5,
      pointRadius: 0,
      tension: 0.3,
      borderDash: [5, 4],
      fill: false
    },
    {
      label: 'Custo Total (Real)',
      data: [],
      borderColor: '#e8451a',
      borderWidth: 2,
      pointRadius: 2,
      pointBackgroundColor: '#e8451a',
      tension: 0.3,
      fill: false
    }
  ]},
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: { color: 'rgba(245,230,200,0.55)', font: { size: 10, family: 'Inter' }, boxWidth: 20, padding: 16 }
      },
      tooltip: estiloTooltip
    },
    scales: {
      x: { grid: { color: 'rgba(245,230,200,0.04)' }, ticks: { maxTicksLimit: 8, font: { size: 10 } } },
      y: { grid: { color: 'rgba(245,230,200,0.04)' }, ticks: { callback: valor => 'R$' + valor, font: { size: 10 } }, beginAtZero: true }
    }
  }
});

// Gráfico: Consumo
const graficoConsumo = new Chart(contextoConsumo, {
  type: 'line',
  data: { labels: [], datasets: [{
    label: 'kWh Acumulado',
    data: [],
    borderColor: '#00c4b4',
    backgroundColor: gradienteConsumo,
    borderWidth: 2,
    pointRadius: 0,
    tension: 0.4,
    fill: true
  }]},
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: estiloTooltip },
    scales: {
      x: { grid: { color: 'rgba(245,230,200,0.04)' }, ticks: { maxTicksLimit: 5, font: { size: 10 } } },
      y: { grid: { color: 'rgba(245,230,200,0.04)' }, ticks: { font: { size: 10 } }, beginAtZero: true }
    }
  }
});

