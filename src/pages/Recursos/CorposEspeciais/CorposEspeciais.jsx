import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import Tooltip from '@mui/material/Tooltip';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { getCorposEspeciais, removeCorpoEspecial } from 'service/storage';
import { getBonusEntriesByTipo } from './utils';
import { ROUTE_PATHS } from 'common/constants/routes';
import { useAuth } from 'context/AuthContext';
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
} from '../Racas/styles';
import CardTokens from 'components/CardTokens/CardTokens';

const CorposEspeciais = () => {
  const navigate = useNavigate();
  const { canCreate, canWrite } = useAuth();
  const {
    items: corposEspeciais,
    loading: loadingCorposEspeciais,
    remove: handleRemove,
  } = useEntityCRUD({ getAll: getCorposEspeciais, remove: removeCorpoEspecial });
  const { universos, loadingUniversos } = useUniversos();
  const { confirmDelete, deleteConfirmationDialog } = useDeleteConfirmation();
  const loading = loadingCorposEspeciais || loadingUniversos;
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroUniverso, setFiltroUniverso] = useState('');
  const [ordenacao, setOrdenacao] = useState(ORDEM_ASC);
  const [corpoEspecialVisualizando, setCorpoEspecialVisualizando] = useState(null);

  const corposEspeciaisFiltrados = useMemo(() => {
    const filtrados = corposEspeciais.filter(corpoEspecial => {
      const matchNome = !filtroNome || corpoEspecial.nome?.toLowerCase().includes(filtroNome.toLowerCase());
      const matchUniverso = !filtroUniverso || corpoEspecial.universo === filtroUniverso;
      return matchNome && matchUniverso;
    });
    return ordenarPorNome(filtrados, ordenacao);
  }, [corposEspeciais, filtroNome, filtroUniverso, ordenacao]);

  return (
    <Box className="page-container" id="redungeon-corpos-especiais" data-page="corpos-especiais">
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ color: 'var(--text-primary)', fontWeight: 700, mb: 0.5 }}>Corpos Especiais</Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>Gerencie os corpos especiais disponíveis na campanha.</Typography>
        </Box>
        {canCreate() && (
          <Button variant="contained" onClick={() => navigate(ROUTE_PATHS.NOVO_CORPO_ESPECIAL)} sx={{ background: 'var(--color-primary)', '&:hover': { background: '#5a2090' } }}>
            + Novo Corpo Especial
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
            universos={universos}
            universoValue={filtroUniverso}
            onUniversoChange={setFiltroUniverso}
            sortValue={ordenacao}
            onSortChange={setOrdenacao}
          />

          {corposEspeciaisFiltrados.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, color: 'var(--text-muted)' }}>
              <Typography variant="h2" sx={{ mb: 1 }}>🧍</Typography>
              <Typography variant="body1">Nenhum corpo especial encontrado</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fill, minmax(300px, 1fr))', md: 'repeat(auto-fill, minmax(340px, 1fr))' }, gap: 2 }}>
              {corposEspeciaisFiltrados.map(corpoEspecial => (
                <RacaCard key={corpoEspecial.id} elevation={0}>
                  <RacaImageFrame>
                    <RacaImageOverlay />
                    <RacaActionBar>
                      <Tooltip title="Visualizar detalhes">
                        <IconButton size="small" onClick={() => setCorpoEspecialVisualizando(corpoEspecial)} sx={{ color: 'var(--text-secondary)', padding: '14px', minWidth: '16px', width: '16px', height: '16px', '&:hover': { color: 'var(--color-accent)' } }} aria-label={`Visualizar corpo especial ${corpoEspecial.nome}`}>
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {canWrite(corpoEspecial.universo) && (
                        <>
                          <IconButton size="small" onClick={() => navigate(ROUTE_PATHS.NOVO_CORPO_ESPECIAL, { state: { corpoEspecial } })} sx={{ color: 'var(--color-accent)', padding: '4px', minWidth: '32px', width: '32px', height: '32px', '&:hover': { color: 'var(--color-accent)', opacity: 0.8 } }} aria-label={`Editar corpo especial ${corpoEspecial.nome}`}>
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => confirmDelete(corpoEspecial.nome, () => handleRemove(corpoEspecial.id))} sx={{ color: '#ef4444', padding: '4px', minWidth: '32px', width: '32px', height: '32px', '&:hover': { color: '#ef4444' } }} aria-label={`Remover corpo especial ${corpoEspecial.nome}`}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </RacaActionBar>

                    {corpoEspecial.linkImagem && (
                      <Box component="img" className="raca-card-image" src={corpoEspecial.linkImagem} alt={corpoEspecial.nome} onError={e => { e.currentTarget.style.display = 'none'; }} />
                    )}
                  </RacaImageFrame>

                  <RacaContent>
                    <RacaTitle variant="h6">{corpoEspecial.nome}</RacaTitle>

                    {corpoEspecial.universo && <RacaSubtitle variant="caption">{universos.find(u => u.id === corpoEspecial.universo)?.Nome || 'Universo Desconhecido'}</RacaSubtitle>}

                    {corpoEspecial.descricao && <RacaDescription variant="body2">{corpoEspecial.descricao}</RacaDescription>}

                    <RacaFooter>
                      <CardTokens
                        items={`📖 ${universos.find(u => u.id === corpoEspecial.universo)?.Nome || 'Universo Desconhecido'}`.split(',')}
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
        open={Boolean(corpoEspecialVisualizando)}
        onClose={() => setCorpoEspecialVisualizando(null)}
        maxWidth="lg"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              background: 'linear-gradient(180deg, rgba(6,10,20,0.96), rgba(4,6,12,0.96))',
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: 3,
              boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
              overflow: 'hidden',
              backdropFilter: 'blur(8px)',
            },
          },
        }}
      >
        {/* Header grande com título e badge */}
        <DialogTitle sx={{ px: { xs: 2.4, md: 3 }, py: { xs: 2, md: 3 }, pb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="h3" sx={{ color: '#fff', fontWeight: 900, fontSize: { xs: '1.6rem', md: '2.4rem' }, lineHeight: 1 }}>
              {corpoEspecialVisualizando?.nome}
            </Typography>
            {corpoEspecialVisualizando?.universo && (
              <Box sx={{ ml: '6px' }}>
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2, py: 0.6, borderRadius: '999px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-primary)', fontWeight: 800, fontSize: '0.72rem' }}>
                  {universos.find(u => u.id === corpoEspecialVisualizando.universo)?.Nome || 'Universo'}
                </Box>
              </Box>
            )}
          </Box>

          {/* linha decorativa abaixo do título */}
          <Box sx={{ mt: 2.2, height: 6, borderRadius: 2, background: 'linear-gradient(90deg, rgba(111,45,168,0.9), rgba(0,217,255,0.7))', width: '180px' }} />
        </DialogTitle>

        <DialogContent dividers sx={{ px: { xs: 2.2, md: 3.2 }, pt: 2, pb: 2, background: 'transparent' }}>
          {/* Banner maior com glow e moldura */}
          {corpoEspecialVisualizando?.linkImagem && (
            <Box sx={{ mb: 3, borderRadius: 3, overflow: 'hidden', boxShadow: '0 18px 60px rgba(111,45,168,0.18)', border: '1px solid rgba(255,255,255,0.04)', position: 'relative' }}>
              <Box component="img" src={corpoEspecialVisualizando.linkImagem} alt={corpoEspecialVisualizando.nome} sx={{ width: '100%', height: { xs: 260, md: 340 }, objectFit: 'cover', objectPosition: 'center', display: 'block' }} onError={e => { e.currentTarget.style.display = 'none'; }} />
              <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.12), rgba(0,0,0,0.28))' }} />
              <Box sx={{ position: 'absolute', left: 12, bottom: 12 }}>
                <Box sx={{ px: 2, py: 0.6, borderRadius: 2, background: 'rgba(0,0,0,0.45)', color: '#fff', fontWeight: 800 }}>{universos.find(u => u.id === corpoEspecialVisualizando.universo)?.Nome}</Box>
              </Box>
            </Box>
          )}

          {/* Grid de cards: descrição, vantagens, desvantagens */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <Box sx={{ gridColumn: { xs: 'auto', md: 'span 2' } }}>
              <Paper sx={{ p: 3, borderRadius: 2, background: 'rgba(255,255,255,0.02)', boxShadow: '0 8px 30px rgba(0,0,0,0.24)' }}>
                <Typography variant="h6" sx={{ color: 'var(--text-primary)', fontWeight: 800, mb: 1 }}>Descrição</Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>{corpoEspecialVisualizando?.descricao || 'Nenhuma descrição disponível.'}</Typography>
              </Paper>
            </Box>

            {(() => {
              const { vantagens, desvantagens } = getBonusEntriesByTipo(corpoEspecialVisualizando?.bonus);
              return (
                <>
                  <Paper sx={{ p: 2, borderRadius: 2, background: 'linear-gradient(180deg, rgba(10,40,10,0.02), rgba(8,18,8,0.02))', boxShadow: '0 8px 30px rgba(0,0,0,0.18)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Box sx={{ color: '#1ec15a', display: 'inline-flex', alignItems: 'center' }}><CheckCircleOutlinedIcon /></Box>
                      <Typography variant="subtitle2" sx={{ color: '#9ff1b8', fontWeight: 800 }}>Vantagens</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {vantagens.length > 0 ? (
                        vantagens.map((b, i) => (
                          <Box key={`${b.texto}-${i}`} sx={{ p: 1.25, borderRadius: 1.5, background: 'rgba(30,193,90,0.04)', color: 'var(--text-secondary)' }}>
                            {b.texto}
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>Nenhuma vantagem registrada.</Typography>
                      )}
                    </Box>
                  </Paper>

                  <Paper sx={{ p: 2, borderRadius: 2, background: 'linear-gradient(180deg, rgba(40,10,10,0.02), rgba(18,8,8,0.02))', boxShadow: '0 8px 30px rgba(0,0,0,0.18)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Box sx={{ color: '#ff6b6b', display: 'inline-flex', alignItems: 'center' }}><CancelOutlinedIcon /></Box>
                      <Typography variant="subtitle2" sx={{ color: '#ffb3b3', fontWeight: 800 }}>Desvantagens</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {desvantagens.length > 0 ? (
                        desvantagens.map((d, i) => (
                          <Box key={`${d.texto}-${i}`} sx={{ p: 1.25, borderRadius: 1.5, background: 'rgba(255,80,80,0.03)', color: 'var(--text-secondary)' }}>
                            {d.texto}
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>Nenhuma desvantagem registrada.</Typography>
                      )}
                    </Box>
                  </Paper>
                </>
              );
            })()}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: { xs: 2.2, md: 3.2 }, py: 2, borderTop: '1px solid rgba(255,255,255,0.04)', justifyContent: 'flex-end', background: 'rgba(3,7,15,0.92)' }}>
          <Button onClick={() => setCorpoEspecialVisualizando(null)} sx={{ color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2, px: 2.4, py: 1 }}>Fechar</Button>
        </DialogActions>
      </Dialog>
      {deleteConfirmationDialog}
    </Box>
  );
};

export default CorposEspeciais;
