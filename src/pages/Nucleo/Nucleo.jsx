import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { getNPCs, getMesas, getMundos, getRegras } from 'service/storage';
import { CHART_OPTIONS, DOUGHNUT_OPTIONS } from './constants';
import { StatCard, ChartCard } from './styles';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  ArcElement,
);

const Nucleo = () => {
  const npcs = getNPCs();
  const mesas = getMesas();
  const mundos = getMundos();
  const regras = getRegras();

  const barData = {
    labels: ['NPCs', 'Mesas', 'Mundos', 'Regras'],
    datasets: [
      {
        label: 'Total de Registros',
        data: [npcs.length, mesas.length, mundos.length, regras.length],
        backgroundColor: [
          'rgba(111, 45, 168, 0.7)',
          'rgba(0, 217, 255, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(96, 165, 250, 0.7)',
        ],
        borderColor: ['#6f2da8', '#00d9ff', '#3b82f6', '#60a5fa'],
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const doughnutData = {
    labels: ['NPCs', 'Mesas', 'Mundos', 'Regras'],
    datasets: [
      {
        data: [
          npcs.length || 1,
          mesas.length || 1,
          mundos.length || 1,
          regras.length || 1,
        ],
        backgroundColor: [
          'rgba(111, 45, 168, 0.8)',
          'rgba(0, 217, 255, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(96, 165, 250, 0.8)',
        ],
        borderColor: ['#050816'],
        borderWidth: 2,
      },
    ],
  };

  const stats = [
    { label: 'NPCs', value: npcs.length, icon: '👤', color: '#6f2da8' },
    { label: 'Mesas', value: mesas.length, icon: '⬡', color: '#00d9ff' },
    { label: 'Mundos', value: mundos.length, icon: '◉', color: '#3b82f6' },
    { label: 'Regras', value: regras.length, icon: '📋', color: '#60a5fa' },
  ];

  return (
    <Box className="page-container" id="redungeon-nucleo" data-page="nucleo">
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          sx={{ color: 'var(--text-primary)', fontWeight: 700, mb: 0.5 }}
        >
          Núcleo
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
          Visão geral do sistema e estatísticas da campanha.
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map(stat => (
          <Grid key={stat.label} size={{ xs: 6, sm: 3 }}>
            <StatCard elevation={0}>
              <Typography variant="h4" sx={{ mb: 0.5 }}>
                {stat.icon}
              </Typography>
              <Typography
                variant="h4"
                sx={{ color: stat.color, fontWeight: 700, lineHeight: 1 }}
              >
                {stat.value}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'var(--text-secondary)' }}
              >
                {stat.label}
              </Typography>
            </StatCard>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <ChartCard elevation={0}>
            <Typography
              variant="subtitle1"
              sx={{ color: 'var(--text-primary)', fontWeight: 600, mb: 2 }}
            >
              Registros por Categoria
            </Typography>
            <Bar data={barData} options={CHART_OPTIONS} />
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ChartCard elevation={0}>
            <Typography
              variant="subtitle1"
              sx={{ color: 'var(--text-primary)', fontWeight: 600, mb: 2 }}
            >
              Distribuição
            </Typography>
            <Doughnut data={doughnutData} options={DOUGHNUT_OPTIONS} />
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Nucleo;
