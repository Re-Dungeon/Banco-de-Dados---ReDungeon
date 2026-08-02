import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Paper from '@mui/material/Paper';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Tooltip from '@mui/material/Tooltip';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { getRegras, removeRegra } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import { useAuth } from 'context/AuthContext';
import {
  CATEGORIAS_REGRA,
  COMPLEXIDADES_REGRA,
} from 'common/constants/constants';
import useEntityCRUD from 'hooks/useEntityCRUD';
import useDeleteConfirmation from 'hooks/useDeleteConfirmation';
import useUniversos from 'hooks/useUniversos';
import { ordenarPorNome, ORDEM_ASC } from 'common/utils/ordenacao';
import EntityFilters from 'components/EntityFilters/EntityFilters';
import {
  RacaCard,
  RacaImageFrame,
  RacaImageOverlay,
  RacaActionBar,
  RacaContent,
  RacaTitle,
  RacaSubtitle,
  RacaDescription,
  RacaFooter,
} from '../Recursos/Racas/styles';
import CardTokens from 'components/CardTokens/CardTokens';
import { getRegraUniversos } from './utils';

const CAMPOS_FUNCIONAMENTO = [
  { key: 'comoFunciona', label: 'Como Funciona' },
  { key: 'dadosUtilizados', label: 'Dados Utilizados' },
  { key: 'sucesso', label: 'Sucesso' },
  { key: 'falha', label: 'Falha' },
];


const Regras = () => {
  const navigate = useNavigate();
  const { canCreate, canWrite } = useAuth();
  const {
    items: regras,
    loading: loadingRegras,
    remove: handleRemove,
  } = useEntityCRUD({ getAll: getRegras, remove: removeRegra });
  const { universos, loadingUniversos } = useUniversos();
  const { confirmDelete, deleteConfirmationDialog } = useDeleteConfirmation();
  const loading = loadingRegras || loadingUniversos;
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroComplexidade, setFiltroComplexidade] = useState('');
  const [filtroUniverso, setFiltroUniverso] = useState('');
  const [ordenacao, setOrdenacao] = useState(ORDEM_ASC);
  const [regraVisualizando, setRegraVisualizando] = useState(null);

  const regrasFiltradas = useMemo(() => {
    const filtradas = regras.filter(regra => {
      const matchNome =
        !filtroNome ||
        regra.nome?.toLowerCase().includes(filtroNome.toLowerCase());
      const matchCategoria =
        !filtroCategoria || regra.categoria === filtroCategoria;
      const matchComplexidade =
        !filtroComplexidade || regra.complexidade === filtroComplexidade;
      const matchUniverso =
        !filtroUniverso || getRegraUniversos(regra).includes(filtroUniverso);
      return matchNome && matchCategoria && matchComplexidade && matchUniverso;
    });
    return ordenarPorNome(filtradas, ordenacao);
  }, [
    regras,
    filtroNome,
    filtroCategoria,
    filtroComplexidade,
    filtroUniverso,
    ordenacao,
  ]);

  return (
    <Box className="page-container" id="redungeon-regras" data-page="regras">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ color: 'var(--text-primary)', fontWeight: 700, mb: 0.5 }}
          >
            Regras
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Consulte e customize as regras do seu jogo.
          </Typography>
        </Box>
        {canCreate() && (
          <Button
            variant="contained"
            onClick={() => navigate(ROUTE_PATHS.NOVA_REGRA)}
            sx={{
              background: 'var(--color-primary)',
              '&:hover': { background: '#5a2090' },
            }}
          >
            + Nova Regra
          </Button>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: 'var(--color-accent)' }} />
        </Box>
      ) : (
        <>
          <EntityFilters
            nomeValue={filtroNome}
            onNomeChange={setFiltroNome}
            extraFilters={[
              {
                label: 'Categoria',
                value: filtroCategoria,
                onChange: setFiltroCategoria,
                options: CATEGORIAS_REGRA,
                allLabel: 'Todas',
              },
              {
                label: 'Complexidade',
                value: filtroComplexidade,
                onChange: setFiltroComplexidade,
                options: COMPLEXIDADES_REGRA,
                allLabel: 'Todas',
              },
            ]}
            universos={universos}
            universoValue={filtroUniverso}
            onUniversoChange={setFiltroUniverso}
            sortValue={ordenacao}
            onSortChange={setOrdenacao}
            sx={{
              gridTemplateColumns: {
                xs: '1fr',
                sm: '2fr 1fr 1fr 1fr',
                md: '2fr 1fr 1fr 1fr 1fr',
              },
            }}
          />

          {regrasFiltradas.length === 0 ? (
            <Box
              sx={{ textAlign: 'center', py: 8, color: 'var(--text-muted)' }}
            >
              <Typography variant="h2" sx={{ mb: 1 }}>
                📋
              </Typography>
              <Typography variant="body1">Nenhuma regra encontrada</Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(auto-fill, minmax(320px, 1fr))',
                  md: 'repeat(auto-fill, minmax(360px, 1fr))',
                },
                gap: 2,
              }}
            >
              {regrasFiltradas.map(regra => (
                <RacaCard key={regra.id} elevation={0}>
                  <RacaImageFrame>
                    <RacaImageOverlay />
                    <RacaActionBar>
                      <Tooltip title="Visualizar detalhes">
                        <IconButton size="small" onClick={() => setRegraVisualizando(regra)} sx={{ color: 'var(--text-secondary)', padding: '14px', minWidth: '16px', width: '16px', height: '16px', '&:hover': { color: 'var(--color-accent)' } }} aria-label={`Visualizar regra ${regra.nome}`}>
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {canWrite(getRegraUniversos(regra)) && (
                        <>
                          <IconButton size="small" onClick={() => navigate(ROUTE_PATHS.NOVA_REGRA, { state: { regra } })} sx={{ color: 'var(--color-accent)', padding: '4px', minWidth: '32px', width: '32px', height: '32px', '&:hover': { color: 'var(--color-accent)', opacity: 0.8 } }} aria-label={`Editar regra ${regra.nome}`}>
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => confirmDelete(regra.nome, () => handleRemove(regra.id))} sx={{ color: '#ef4444', padding: '4px', minWidth: '32px', width: '32px', height: '32px', '&:hover': { color: '#ef4444' } }} aria-label={`Remover regra ${regra.nome}`}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </RacaActionBar>

                    {regra.linkImagem && (
                      <Box component="img" className="raca-card-image" src={regra.linkImagem} alt={regra.nome} onError={e => { e.currentTarget.style.display = 'none'; }} />
                    )}
                  </RacaImageFrame>

                  <RacaContent>
                    <RacaTitle variant="h6">{regra.nome}</RacaTitle>

                    {(regra.categoria || regra.complexidade) && <RacaSubtitle variant="caption">{[regra.categoria, regra.complexidade].filter(Boolean).join(' · ')}</RacaSubtitle>}

                    {regra.tipo && <RacaSubtitle variant="caption" sx={{ color: 'var(--text-muted)' }}>{regra.tipo}</RacaSubtitle>}

                    {regra.descricaoCurta && <RacaDescription variant="body2">{regra.descricaoCurta}</RacaDescription>}

                    <RacaFooter>
                      <CardTokens
                        items={
                          getRegraUniversos(regra).length > 0
                            ? getRegraUniversos(regra).map(universoId => {
                                const universo = universos.find(u => u.id === universoId);
                                return `📖 ${universo?.Nome || 'Universo Desconhecido'}`;
                              })
                            : ['📖 Universo Desconhecido']
                        }
                      />
                    </RacaFooter>
                  </RacaContent>
                </RacaCard>
              ))}
            </Box>
          )}
        </>
      )}

      <Dialog
        open={Boolean(regraVisualizando)}
        onClose={() => setRegraVisualizando(null)}
        maxWidth="lg"
        fullWidth
        slotProps={{ paper: { sx: { background: 'linear-gradient(180deg, rgba(6,10,20,0.98), rgba(3,6,12,0.98))', borderRadius: 3, border: '1px solid rgba(255,255,255,0.04)', boxShadow: '0 40px 80px rgba(0,0,0,0.6)', overflow: 'hidden' } } }}
      >
        <DialogTitle sx={{ px: { xs: 2.4, md: 3 }, py: { xs: 2, md: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h3" sx={{ color: '#fff', fontWeight: 900, fontSize: { xs: '1.5rem', md: '2.2rem' }, lineHeight: 1 }}>{regraVisualizando?.nome}</Typography>
              <Typography variant="subtitle2" sx={{ color: 'var(--text-muted)', mt: 0.6 }}>{(regraVisualizando?.categoria || regraVisualizando?.complexidade) && [regraVisualizando.categoria, regraVisualizando.complexidade].filter(Boolean).join(' · ')}</Typography>
            </Box>
            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
              {canWrite(getRegraUniversos(regraVisualizando)) && (
                <Button variant="contained" onClick={() => { navigate(ROUTE_PATHS.NOVA_REGRA, { state: { regra: regraVisualizando } }); setRegraVisualizando(null); }} sx={{ background: 'var(--color-primary)', '&:hover': { background: '#5a2090' } }}>Editar</Button>
              )}
            </Box>
          </Box>
          <Box sx={{ mt: 2, height: 6, width: 220, borderRadius: 2, background: 'linear-gradient(90deg, rgba(111,45,168,0.9), rgba(0,217,255,0.6))' }} />
        </DialogTitle>

        <DialogContent dividers sx={{ display: 'flex', gap: 3, px: { xs: 2.2, md: 3.2 }, py: 2 }}>
          {/* barra lateral decorativa */}
          <Box sx={{ width: 8, borderRadius: 2, background: 'linear-gradient(180deg, rgba(111,45,168,0.9), rgba(0,217,255,0.6))' }} />

          <Box sx={{ flex: 1, display: 'grid', gap: 2 }}>
            {/* Descrição card */}
            <Paper sx={{ p: 3, borderRadius: 2, background: 'rgba(255,255,255,0.02)', boxShadow: '0 8px 30px rgba(0,0,0,0.18)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <DescriptionOutlinedIcon sx={{ color: 'var(--color-accent)' }} />
                <Typography variant="h6" sx={{ color: 'var(--text-primary)', fontWeight: 800 }}>Descrição</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>{regraVisualizando?.descricaoCurta || 'Nenhuma descrição disponível.'}</Typography>
            </Paper>

            {/* Regras Gerais card */}
            <Paper sx={{ p: 3, borderRadius: 2, background: 'linear-gradient(180deg, rgba(10,10,20,0.02), rgba(6,6,12,0.02))', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ListAltOutlinedIcon sx={{ color: '#9be3ff' }} />
                <Typography variant="h6" sx={{ color: 'var(--text-primary)', fontWeight: 800 }}>Regras Gerais</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 1.5 }}>{regraVisualizando?.explicacaoCompleta || 'Sem informações adicionais.'}</Typography>

              {/* Transform lists into elegant bullets if any list-like fields exist */}
              {Array.isArray(regraVisualizando?.regras) && regraVisualizando.regras.length > 0 && (
                <Box component="ul" sx={{ pl: 3, m: 0 }}>
                  {regraVisualizando.regras.map((r, i) => (
                    <Box component="li" key={i} sx={{ mb: 1, listStyle: 'none', display: 'flex', gap: 2 }}>
                      <Box sx={{ width: 8, height: 8, background: 'var(--color-accent)', borderRadius: '50%', mt: '6px' }} />
                      <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>{r}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <Paper sx={{ p: 2.5, borderRadius: 2, background: 'rgba(20,40,20,0.02)', boxShadow: '0 6px 22px rgba(0,0,0,0.12)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <TrendingUpOutlinedIcon sx={{ color: '#5ee19a' }} />
                  <Typography variant="subtitle1" sx={{ color: 'var(--text-primary)', fontWeight: 800 }}>Funcionamento</Typography>
                </Box>
                {CAMPOS_FUNCIONAMENTO.filter(f => regraVisualizando?.[f.key]).map(f => (
                  <Box key={f.key} sx={{ mb: 1 }}>
                    <Typography variant="caption" sx={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>{f.label}</Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>{regraVisualizando[f.key]}</Typography>
                  </Box>
                ))}
              </Paper>

              <Paper sx={{ p: 2.5, borderRadius: 2, background: 'rgba(40,20,20,0.02)', boxShadow: '0 6px 22px rgba(0,0,0,0.12)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LightbulbOutlinedIcon sx={{ color: '#ffd97a' }} />
                  <Typography variant="subtitle1" sx={{ color: 'var(--text-primary)', fontWeight: 800 }}>Exemplos</Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>{regraVisualizando?.exemplo || 'Nenhum exemplo registrado.'}</Typography>
              </Paper>
            </Box>

            <Paper sx={{ p: 2.5, borderRadius: 2, background: 'rgba(12,12,20,0.02)', boxShadow: '0 6px 22px rgba(0,0,0,0.12)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <InfoOutlinedIcon sx={{ color: '#9fb6ff' }} />
                <Typography variant="subtitle1" sx={{ color: 'var(--text-primary)', fontWeight: 800 }}>Observações</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>{regraVisualizando?.observacoes || 'Sem observações.'}</Typography>
            </Paper>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: { xs: 2.2, md: 3.2 }, py: 2, borderTop: '1px solid rgba(255,255,255,0.04)', justifyContent: 'flex-end', background: 'rgba(3,7,15,0.92)' }}>
          <Button onClick={() => setRegraVisualizando(null)} sx={{ color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2, px: 2.4, py: 1 }}>Fechar</Button>
        </DialogActions>
      </Dialog>
      {deleteConfirmationDialog}
    </Box>
  );
};

export default Regras;
