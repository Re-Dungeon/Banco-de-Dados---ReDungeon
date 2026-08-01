import React, { useState, useMemo } from 'react';
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
import { getItens, removeIten } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import { useAuth } from 'context/AuthContext';
import { RARIDADES } from 'common/constants/constants';
import useEntityCRUD from 'hooks/useEntityCRUD';
import useUniversos from 'hooks/useUniversos';
import { ordenarPorNome, ORDEM_ASC } from 'common/utils/ordenacao';
import EntityFilters from 'components/EntityFilters/EntityFilters';
import EntityViewDialog from 'components/EntityViewDialog/EntityViewDialog';
import { TIPOS_ITEM } from './utils';
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
  RacaMeta,
  RacaBadge,
} from '../Racas/styles';

const Itens = () => {
  const navigate = useNavigate();
  const { canCreate, canWrite } = useAuth();
  const {
    items: itens,
    loading: loadingItens,
    remove: handleRemove,
  } = useEntityCRUD({ getAll: getItens, remove: removeIten });
  const { universos, loadingUniversos } = useUniversos();
  const loading = loadingItens || loadingUniversos;
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroQualidade, setFiltroQualidade] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroUniverso, setFiltroUniverso] = useState('');
  const [ordenacao, setOrdenacao] = useState(ORDEM_ASC);
  const [itemVisualizando, setItemVisualizando] = useState(null);

  const itensFiltrados = useMemo(() => {
    const filtrados = itens.filter(item => {
      const matchNome =
        !filtroNome ||
        item.nome?.toLowerCase().includes(filtroNome.toLowerCase());
      const matchQualidade =
        !filtroQualidade || item.qualidade === filtroQualidade;
      const matchTipo = !filtroTipo || item.tipo === filtroTipo;
      const matchUniverso = !filtroUniverso || item.universo === filtroUniverso;
      return matchNome && matchQualidade && matchTipo && matchUniverso;
    });
    return ordenarPorNome(filtrados, ordenacao);
  }, [
    itens,
    filtroNome,
    filtroQualidade,
    filtroTipo,
    filtroUniverso,
    ordenacao,
  ]);

  return (
    <Box className="page-container" id="redungeon-itens" data-page="itens">
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
            Itens
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Gerencie os itens disponíveis na campanha.
          </Typography>
        </Box>
        {canCreate() && (
          <Button
            variant="contained"
            onClick={() => navigate(ROUTE_PATHS.NOVO_ITEM)}
            sx={{
              background: 'var(--color-primary)',
              '&:hover': { background: '#5a2090' },
            }}
          >
            + Novo Item
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
                label: 'Qualidade',
                value: filtroQualidade,
                onChange: setFiltroQualidade,
                options: RARIDADES,
                allLabel: 'Todas',
              },
              {
                label: 'Tipo',
                value: filtroTipo,
                onChange: setFiltroTipo,
                options: TIPOS_ITEM,
                allLabel: 'Todos',
              },
            ]}
            universos={universos}
            universoValue={filtroUniverso}
            onUniversoChange={setFiltroUniverso}
            sortValue={ordenacao}
            onSortChange={setOrdenacao}
          />

          {itensFiltrados.length === 0 ? (
            <Box
              sx={{ textAlign: 'center', py: 8, color: 'var(--text-muted)' }}
            >
              <Typography variant="h2" sx={{ mb: 1 }}>
                ⚔️
              </Typography>
              <Typography variant="body1">Nenhum item encontrado</Typography>
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
              {itensFiltrados.map(item => {
                const universoNome =
                  universos.find(u => u.id === item.universo)?.Nome ||
                  'Universo Desconhecido';

                return (
                  <RacaCard key={item.id} elevation={0}>
                    <RacaImageFrame>
                      {item.linkImagem && (
                        <Box
                          component="img"
                          className="raca-card-image"
                          src={item.linkImagem}
                          alt={item.nome}
                          onError={e => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <RacaImageOverlay />
                      <RacaActionBar>
                        <Tooltip title="Visualizar detalhes">
                          <IconButton
                            size="small"
                            onClick={() => setItemVisualizando(item)}
                            sx={{
                              color: 'var(--text-secondary)',
                              padding: '14px',
                              minWidth: '16px',
                              width: '16px',
                              height: '16px',
                              '&:hover': { color: 'var(--color-accent)' },
                            }}
                            aria-label={`Visualizar item ${item.nome}`}
                          >
                            <VisibilityOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {canWrite(item.universo) && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() =>
                                navigate(ROUTE_PATHS.NOVO_ITEM, {
                                  state: { item },
                                })
                              }
                              sx={{
                                color: 'var(--color-accent)',
                                padding: '4px',
                                minWidth: '32px',
                                width: '32px',
                                height: '32px',
                                '&:hover': {
                                  color: 'var(--color-accent)',
                                  opacity: 0.8,
                                },
                              }}
                              aria-label={`Editar item ${item.nome}`}
                            >
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleRemove(item.id)}
                              sx={{
                                color: '#ef4444',
                                padding: '4px',
                                minWidth: '32px',
                                width: '32px',
                                height: '32px',
                                '&:hover': { color: '#ef4444' },
                              }}
                              aria-label={`Remover item ${item.nome}`}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}
                      </RacaActionBar>
                    </RacaImageFrame>

                    <RacaContent>
                      <RacaTitle variant="h6">{item.nome}</RacaTitle>
                      <RacaSubtitle variant="caption">
                        {universoNome}
                      </RacaSubtitle>
                      {item.descricao && (
                        <RacaDescription variant="body2">
                          {item.descricao}
                        </RacaDescription>
                      )}
                      <RacaFooter>
                        <RacaMeta>
                          <RacaBadge>📖 {universoNome}</RacaBadge>
                          {item.tipo && <RacaBadge>🗡️ {item.tipo}</RacaBadge>}
                          {item.qualidade && (
                            <RacaBadge>⭐ {item.qualidade}</RacaBadge>
                          )}
                          {item.mostrarNaLoja && (
                            <RacaBadge>🛒 Na Loja</RacaBadge>
                          )}
                        </RacaMeta>
                      </RacaFooter>
                    </RacaContent>
                  </RacaCard>
                );
              })}
            </Box>
          )}
        </>
      )}

      <EntityViewDialog
        open={Boolean(itemVisualizando)}
        onClose={() => setItemVisualizando(null)}
        titulo={itemVisualizando?.nome}
        subtitulo={
          (itemVisualizando?.qualidade || itemVisualizando?.tipo) &&
          [
            universos.find(u => u.id === itemVisualizando?.universo)?.Nome,
            itemVisualizando?.tipo,
            itemVisualizando?.qualidade,
          ]
            .filter(Boolean)
            .join(' — ')
        }
        imagem={itemVisualizando?.linkImagem}
      >
        {/* Atributos */}
        {[
          { label: 'Nível Atual', value: itemVisualizando?.nivelAtual },
          { label: 'Nível Máximo', value: itemVisualizando?.nivelMaximo },
          { label: 'Peso Unitário', value: itemVisualizando?.pesoUnitario },
          { label: 'Bônus de Espaço', value: itemVisualizando?.bonusEspaco },
          { label: 'Preço de Compra', value: itemVisualizando?.precoCompra },
          { label: 'Preço de Venda', value: itemVisualizando?.precoVenda },
          { label: 'Dados', value: itemVisualizando?.dados },
          { label: 'Extra', value: itemVisualizando?.extra },
        ].some(
          f => f.value !== '' && f.value !== null && f.value !== undefined,
        ) && (
          <>
            <Typography
              variant="subtitle2"
              sx={{
                color: 'var(--color-accent)',
                fontWeight: 700,
                mb: 1,
                textTransform: 'uppercase',
                letterSpacing: 1,
                fontSize: '0.72rem',
              }}
            >
              Atributos
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                gap: 1,
                mb: 2,
              }}
            >
              {[
                { label: 'Nível Atual', value: itemVisualizando?.nivelAtual },
                {
                  label: 'Nível Máximo',
                  value: itemVisualizando?.nivelMaximo,
                },
                {
                  label: 'Peso Unitário',
                  value: itemVisualizando?.pesoUnitario,
                },
                {
                  label: 'Bônus de Espaço',
                  value: itemVisualizando?.bonusEspaco,
                },
                {
                  label: 'Preço de Compra',
                  value: itemVisualizando?.precoCompra,
                },
                {
                  label: 'Preço de Venda',
                  value: itemVisualizando?.precoVenda,
                },
                { label: 'Dados', value: itemVisualizando?.dados },
                { label: 'Extra', value: itemVisualizando?.extra },
              ]
                .filter(
                  f =>
                    f.value !== '' && f.value !== null && f.value !== undefined,
                )
                .map(f => (
                  <Box
                    key={f.label}
                    sx={{
                      background: 'var(--bg-secondary)',
                      borderRadius: 1,
                      p: 1,
                      textAlign: 'center',
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: 'var(--text-muted)', display: 'block' }}
                    >
                      {f.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'var(--text-primary)', fontWeight: 600 }}
                    >
                      {f.value}
                    </Typography>
                  </Box>
                ))}
            </Box>
          </>
        )}

        {itemVisualizando?.descricao && (
          <>
            <Divider sx={{ borderColor: 'var(--border-primary)', mb: 1.5 }} />
            <Typography
              variant="subtitle2"
              sx={{
                color: 'var(--color-accent)',
                fontWeight: 700,
                mb: 0.5,
                textTransform: 'uppercase',
                letterSpacing: 1,
                fontSize: '0.72rem',
              }}
            >
              Descrição
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'var(--text-secondary)', mb: 2 }}
            >
              {itemVisualizando.descricao}
            </Typography>
          </>
        )}

        {itemVisualizando?.habilidadesEspeciais?.length > 0 && (
          <>
            <Divider sx={{ borderColor: 'var(--border-primary)', mb: 1.5 }} />
            <Typography
              variant="subtitle2"
              sx={{
                color: 'var(--color-accent)',
                fontWeight: 700,
                mb: 1,
                textTransform: 'uppercase',
                letterSpacing: 1,
                fontSize: '0.72rem',
              }}
            >
              Habilidades Especiais
            </Typography>
            {itemVisualizando.habilidadesEspeciais.map((hab, i) => (
              <Box
                key={`${hab.nome}-${i}`}
                sx={{
                  mb: 1,
                  p: 1.5,
                  background: 'var(--bg-secondary)',
                  borderRadius: 1,
                  border: '1px solid var(--border-primary)',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    mb: 0.5,
                  }}
                >
                  {hab.nome}
                </Typography>
                {hab.descricao && (
                  <Typography
                    variant="caption"
                    sx={{ color: 'var(--text-secondary)', display: 'block' }}
                  >
                    {hab.descricao}
                  </Typography>
                )}
              </Box>
            ))}
          </>
        )}
      </EntityViewDialog>
    </Box>
  );
};

export default Itens;
