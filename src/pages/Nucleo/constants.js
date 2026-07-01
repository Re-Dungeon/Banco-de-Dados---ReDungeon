export const CHART_OPTIONS = {
  responsive: true,
  plugins: {
    legend: {
      labels: { color: '#94a3b8' },
    },
  },
  scales: {
    x: {
      ticks: { color: '#94a3b8' },
      grid: { color: 'rgba(96,165,250,0.08)' },
    },
    y: {
      ticks: { color: '#94a3b8' },
      grid: { color: 'rgba(96,165,250,0.08)' },
      beginAtZero: true,
    },
  },
};

export const DOUGHNUT_OPTIONS = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { color: '#94a3b8' },
    },
  },
};
