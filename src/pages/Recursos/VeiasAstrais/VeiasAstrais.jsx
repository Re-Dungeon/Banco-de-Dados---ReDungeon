import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  getVeiasAstrais,
  removeVeiaAstral,
  getDivindades,
} from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import { useAuth } from 'context/AuthContext';
import useEntityCRUD from 'hooks/useEntityCRUD';
import useDeleteConfirmation from 'hooks/useDeleteConfirmation';
import useUniversos from 'hooks/useUniversos';
import { ordenarPorNome, ORDEM_ASC } from 'common/utils/ordenacao';
import EntityFilters from 'components/EntityFilters/EntityFilters';
import EntityViewDialog from 'components/EntityViewDialog/EntityViewDialog';
import { VeiaAstralCard } from './styles';
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

const VeiasAstrais = () => {
  const navigate = useNavigate();
  const { canCreate, canWrite } = useAuth();
  const { confirmDelete, deleteConfirmationDialog } = useDeleteConfirmation();
  const {
    items: veiasAstrais,
    loading: loadingVeiasAstrais,
    remove: handleRemove,
  } = useEntityCRUD({ getAll: getVeiasAstrais, remove: removeVeiaAstral });
  const { universos, loadingUniversos } = useUniversos();
  const [divindades, setDivindades] = useState([]);
  const loading = loadingVeiasAstrais || loadingUniversos;
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroDivindade, setFiltroDivindade] = useState('');
  const [filtroUniverso, setFiltroUniverso] = useState('');
  const [ordenacao, setOrdenacao] = useState(ORDEM_ASC);
  const [veiaAstralVisualizando, setVeiaAstralVisualizando] = useState(null);

  useEffect(() => {
    let active = true;
    getDivindades().then(data => {
      if (active) setDivindades(data);
    });
    return () => {
      active = false;
    };
  }, []);

  const nomePorDivindadeId = useMemo(
    () => Object.fromEntries(divindades.map(d => [d.id, d.nome])),
    [divindades],
  );
  const getDivindadeNome = veiaAstral =>
    nomePorDivindadeId[veiaAstral?.divindade] || veiaAstral?.divindade || '';
  const opcoesDivindade = useMemo(
    () => [...new Set(divindades.map(d => d.nome))],
    [divindades],
  );
  const nomePorVeiaAstralId = useMemo(
    () => Object.fromEntries(veiasAstrais.map(v => [v.id, v.nome])),
    [veiasAstrais],
  );
  const getRequisitoNome = veiaAstral =>
    nomePorVeiaAstralId[veiaAstral?.requisito] || '';

  const veiasAstraisFiltradas = useMemo(() => {
    const filtradas = veiasAstrais.filter(veiaAstral => {
      const nomeDivindade =
        nomePorDivindadeId[veiaAstral.divindade] || veiaAstral.divindade || '';
      const matchNome =
        !filtroNome ||
        veiaAstral.nome?.toLowerCase().includes(filtroNome.toLowerCase());
      const matchDivindade =
        !filtroDivindade || nomeDivindade === filtroDivindade;
      const matchUniverso =
        !filtroUniverso || veiaAstral.universo === filtroUniverso;
      return matchNome && matchDivindade && matchUniverso;
    });
    return ordenarPorNome(filtradas, ordenacao);
  }, [
    veiasAstrais,
    filtroNome,
    filtroDivindade,
    filtroUniverso,
    nomePorDivindadeId,
    ordenacao,
  ]);

  return (
    <Box
      className="page-container"
      id="redungeon-veias-astrais"
      data-page="veias-astrais"
    >
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
            Veias Astrais
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Gerencie as veias astrais concedidas pelas divindades e
            constelações.
          </Typography>
        </Box>
        {canCreate() && (
          <Button
            variant="contained"
            onClick={() => navigate(ROUTE_PATHS.NOVA_VEIA_ASTRAL)}
            sx={{
              background: 'var(--color-primary)',
              '&:hover': { background: '#5a2090' },
            }}
          >
            + Nova Veia Astral
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
                label: 'Divindade/Constelação',
                value: filtroDivindade,
                onChange: setFiltroDivindade,
                options: opcoesDivindade,
                allLabel: 'Todas',
              },
            ]}
            universos={universos}
            universoValue={filtroUniverso}
            onUniversoChange={setFiltroUniverso}
            sortValue={ordenacao}
            onSortChange={setOrdenacao}
          />

          {veiasAstraisFiltradas.length === 0 ? (
            <Box
              sx={{ textAlign: 'center', py: 8, color: 'var(--text-muted)' }}
            >
              <Typography variant="h2" sx={{ mb: 1 }}>
                🌌
              </Typography>
              <Typography variant="body1">
                Nenhuma veia astral encontrada
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(auto-fill, minmax(300px, 1fr))',
                  md: 'repeat(auto-fill, minmax(340px, 1fr))',
                },
                gap: 2,
              }}
            >
              {veiasAstraisFiltradas.map(veiaAstral => (
                <RacaCard key={veiaAstral.id} elevation={0}>
                  <RacaImageFrame>
                    <RacaImageOverlay />
                    <RacaActionBar>
                      <Tooltip title="Visualizar detalhes">
                        <IconButton size="small" onClick={() => setVeiaAstralVisualizando(veiaAstral)} sx={{ color: 'var(--text-secondary)', padding: '14px', minWidth: '16px', width: '16px', height: '16px', '&:hover': { color: 'var(--color-accent)' } }} aria-label={`Visualizar veia astral ${veiaAstral.nome}`}>
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {canWrite(veiaAstral.universo) && (
                        <>
                          <IconButton size="small" onClick={() => navigate(ROUTE_PATHS.NOVA_VEIA_ASTRAL, { state: { veiaAstral } })} sx={{ color: 'var(--color-accent)', padding: '4px', minWidth: '32px', width: '32px', height: '32px', '&:hover': { color: 'var(--color-accent)', opacity: 0.8 } }} aria-label={`Editar veia astral ${veiaAstral.nome}`}>
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => confirmDelete(veiaAstral.nome, () => handleRemove(veiaAstral.id))} sx={{ color: '#ef4444', padding: '4px', minWidth: '32px', width: '32px', height: '32px', '&:hover': { color: '#ef4444' } }} aria-label={`Remover veia astral ${veiaAstral.nome}`}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </RacaActionBar>

                    {veiaAstral.linkImagem && (
                      <Box component="img" className="raca-card-image" src={veiaAstral.linkImagem} alt={veiaAstral.nome} onError={e => { e.currentTarget.style.display = 'none'; }} />
                    )}
                  </RacaImageFrame>

                  <RacaContent>
                    <RacaTitle variant="h6">{veiaAstral.nome}</RacaTitle>

                    {(veiaAstral.divindade || veiaAstral.nivel) && <RacaSubtitle variant="caption">{[getDivindadeNome(veiaAstral), veiaAstral.nivel ? `Nível ${veiaAstral.nivel}` : null].filter(Boolean).join(' · ')}</RacaSubtitle>}

                    {veiaAstral.descricao && <RacaDescription variant="body2">{veiaAstral.descricao}</RacaDescription>}

                    <RacaFooter>
                      <CardTokens
                        items={[
                          `📖 ${universos.find(u => u.id === veiaAstral.universo)?.Nome || 'Universo Desconhecido'}`,
                          ...(veiaAstral.custo ? [`💠 ${veiaAstral.custo}`] : []),
                          ...(veiaAstral.requisito ? [`🔗 ${getRequisitoNome(veiaAstral)}`] : []),
                        ]}
                      />
                    </RacaFooter>
                  </RacaContent>
                </RacaCard>
              ))}
            </Box>
          )}
        </>
      )}

      <EntityViewDialog
        open={Boolean(veiaAstralVisualizando)}
        onClose={() => setVeiaAstralVisualizando(null)}
        titulo={veiaAstralVisualizando?.nome}
        subtitulo={
          (veiaAstralVisualizando?.divindade ||
            veiaAstralVisualizando?.nivel) &&
          [
            getDivindadeNome(veiaAstralVisualizando),
            veiaAstralVisualizando.nivel
              ? `Nível ${veiaAstralVisualizando.nivel}`
              : null,
          ]
            .filter(Boolean)
            .join(' · ')
        }
        imagem={veiaAstralVisualizando?.linkImagem}
        imagemSx={{ height: 'auto', maxHeight: 220 }}
        actions={
          canWrite(veiaAstralVisualizando?.universo) && (
            <Button
              variant="contained"
              onClick={() => {
                navigate(ROUTE_PATHS.NOVA_VEIA_ASTRAL, {
                  state: { veiaAstral: veiaAstralVisualizando },
                });
                setVeiaAstralVisualizando(null);
              }}
              sx={{
                background: 'var(--color-primary)',
                '&:hover': { background: '#5a2090' },
              }}
            >
              Editar
            </Button>
          )
        }
      >
        {veiaAstralVisualizando?.custo && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              sx={{
                color: 'var(--text-muted)',
                display: 'block',
                mb: 0.3,
              }}
            >
              Custo
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'var(--text-primary)', fontWeight: 600 }}
            >
              {veiaAstralVisualizando.custo}
            </Typography>
          </Box>
        )}

        {veiaAstralVisualizando?.requisito && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              sx={{
                color: 'var(--text-muted)',
                display: 'block',
                mb: 0.3,
              }}
            >
              Requisito
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'var(--text-primary)', fontWeight: 600 }}
            >
              {getRequisitoNome(veiaAstralVisualizando)}
            </Typography>
          </Box>
        )}

        {veiaAstralVisualizando?.descricao && (
          <>
            <Typography
              variant="caption"
              sx={{
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                display: 'block',
                mb: 0.5,
              }}
            >
              Descrição
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'var(--text-secondary)', mb: 2 }}
            >
              {veiaAstralVisualizando.descricao}
            </Typography>
          </>
        )}

        {veiaAstralVisualizando?.aprimoramento && (
          <>
            <Divider sx={{ borderColor: 'var(--border-primary)', mb: 1.5 }} />
            <Typography
              variant="caption"
              sx={{
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                display: 'block',
                mb: 0.5,
              }}
            >
              Aprimoramento
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
              {veiaAstralVisualizando.aprimoramento}
            </Typography>
          </>
        )}
      </EntityViewDialog>
      {deleteConfirmationDialog}
    </Box>
  );
};

export default VeiasAstrais;
