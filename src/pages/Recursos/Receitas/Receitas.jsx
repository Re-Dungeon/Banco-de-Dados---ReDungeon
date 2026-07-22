import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { getReceitas, removeReceita } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import { useAuth } from 'context/AuthContext';
import { RARIDADES, CATEGORIAS_RECEITA } from 'common/constants/constants';
import useEntityCRUD from 'hooks/useEntityCRUD';
import useUniversos from 'hooks/useUniversos';
import { ordenarPorNome, ORDEM_ASC } from 'common/utils/ordenacao';
import EntityFilters from 'components/EntityFilters/EntityFilters';
import EntityViewDialog from 'components/EntityViewDialog/EntityViewDialog';
import { ReceitaCard } from './styles';

const Receitas = () => {
  const navigate = useNavigate();
  const { canCreate, canWrite } = useAuth();
  const {
    items: receitas,
    loading: loadingReceitas,
    remove: handleRemove,
  } = useEntityCRUD({ getAll: getReceitas, remove: removeReceita });
  const { universos, loadingUniversos } = useUniversos();
  const loading = loadingReceitas || loadingUniversos;
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroRaridade, setFiltroRaridade] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroUniverso, setFiltroUniverso] = useState('');
  const [ordenacao, setOrdenacao] = useState(ORDEM_ASC);
  const [receitaVisualizando, setReceitaVisualizando] = useState(null);

  const receitasFiltradas = useMemo(() => {
    const filtradas = receitas.filter(receita => {
      const matchNome =
        !filtroNome ||
        receita.nome?.toLowerCase().includes(filtroNome.toLowerCase());
      const matchRaridade =
        !filtroRaridade || receita.raridade === filtroRaridade;
      const matchCategoria =
        !filtroCategoria || receita.categoria === filtroCategoria;
      const matchUniverso =
        !filtroUniverso || receita.universo === filtroUniverso;
      return matchNome && matchRaridade && matchCategoria && matchUniverso;
    });
    return ordenarPorNome(filtradas, ordenacao);
  }, [
    receitas,
    filtroNome,
    filtroRaridade,
    filtroCategoria,
    filtroUniverso,
    ordenacao,
  ]);

  return (
    <Box
      className="page-container"
      id="redungeon-receitas"
      data-page="receitas"
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
            Receitas
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Gerencie as receitas disponíveis na campanha.
          </Typography>
        </Box>
        {canCreate() && (
          <Button
            variant="contained"
            onClick={() => navigate(ROUTE_PATHS.NOVA_RECEITA)}
            sx={{
              background: 'var(--color-primary)',
              '&:hover': { background: '#5a2090' },
            }}
          >
            + Nova Receita
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
                label: 'Raridade',
                value: filtroRaridade,
                onChange: setFiltroRaridade,
                options: RARIDADES,
                allLabel: 'Todas',
              },
              {
                label: 'Categoria',
                value: filtroCategoria,
                onChange: setFiltroCategoria,
                options: CATEGORIAS_RECEITA,
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

          {receitasFiltradas.length === 0 ? (
            <Box
              sx={{ textAlign: 'center', py: 8, color: 'var(--text-muted)' }}
            >
              <Typography variant="h2" sx={{ mb: 1 }}>
                📜
              </Typography>
              <Typography variant="body1">
                Nenhuma receita encontrada
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
              {receitasFiltradas.map(receita => (
                <ReceitaCard key={receita.id} elevation={0}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: 0.5,
                      mb: 1,
                    }}
                  >
                    <Tooltip title="Visualizar detalhes">
                      <IconButton
                        size="small"
                        onClick={() => setReceitaVisualizando(receita)}
                        sx={{
                          color: 'var(--text-secondary)',
                          '&:hover': { color: 'var(--color-accent)' },
                        }}
                        aria-label={`Visualizar receita ${receita.nome}`}
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {canWrite(receita.universo) && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() =>
                            navigate(ROUTE_PATHS.NOVA_RECEITA, {
                              state: { receita },
                            })
                          }
                          sx={{
                            color: 'var(--color-accent)',
                            '&:hover': {
                              color: 'var(--color-accent)',
                              opacity: 0.8,
                            },
                          }}
                          aria-label={`Editar receita ${receita.nome}`}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleRemove(receita.id)}
                          sx={{
                            color: '#ef4444',
                            '&:hover': { color: '#ef4444' },
                          }}
                          aria-label={`Remover receita ${receita.nome}`}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Box>

                  {receita.linkImagem && (
                    <Box
                      component="img"
                      src={receita.linkImagem}
                      alt={receita.nome}
                      sx={{
                        width: '100%',
                        height: 160,
                        borderRadius: 2,
                        objectFit: 'cover',
                        display: 'block',
                        border: '1px solid var(--border-primary)',
                        mb: 1.5,
                      }}
                      onError={e => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}

                  <Typography
                    variant="h6"
                    sx={{
                      color: 'var(--text-primary)',
                      fontWeight: 600,
                      lineHeight: 1.2,
                    }}
                  >
                    {receita.nome}
                  </Typography>

                  {(receita.categoria || receita.raridade) && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'var(--color-accent)',
                        fontWeight: 600,
                        display: 'block',
                        mb: 1,
                      }}
                    >
                      {[receita.categoria, receita.raridade]
                        .filter(Boolean)
                        .join(' · ')}
                    </Typography>
                  )}

                  {(receita.valorCompra || receita.valorVenda) && (
                    <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                      {receita.valorCompra && (
                        <Typography
                          variant="caption"
                          sx={{ color: 'var(--text-secondary)' }}
                        >
                          🛒 {receita.valorCompra}
                        </Typography>
                      )}
                      {receita.valorVenda && (
                        <Typography
                          variant="caption"
                          sx={{ color: 'var(--text-secondary)' }}
                        >
                          💰 {receita.valorVenda}
                        </Typography>
                      )}
                    </Box>
                  )}

                  {receita.materiais?.length > 0 && (
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 0.5,
                        mb: 1,
                      }}
                    >
                      {receita.materiais.map(m => (
                        <Chip
                          key={m.id}
                          label={m.nome}
                          size="small"
                          sx={{
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-primary)',
                          }}
                        />
                      ))}
                    </Box>
                  )}

                  {receita.descricao && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'var(--text-secondary)',
                        mt: 0.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {receita.descricao}
                    </Typography>
                  )}
                </ReceitaCard>
              ))}
            </Box>
          )}
        </>
      )}

      <EntityViewDialog
        open={Boolean(receitaVisualizando)}
        onClose={() => setReceitaVisualizando(null)}
        titulo={receitaVisualizando?.nome}
        subtitulo={
          (receitaVisualizando?.categoria || receitaVisualizando?.raridade) &&
          [receitaVisualizando.categoria, receitaVisualizando.raridade]
            .filter(Boolean)
            .join(' · ')
        }
        imagem={receitaVisualizando?.linkImagem}
        imagemSx={{ height: 'auto', maxHeight: 220 }}
        actions={
          canWrite(receitaVisualizando?.universo) && (
            <Button
              variant="contained"
              onClick={() => {
                navigate(ROUTE_PATHS.NOVA_RECEITA, {
                  state: { receita: receitaVisualizando },
                });
                setReceitaVisualizando(null);
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
        {(receitaVisualizando?.valorCompra ||
          receitaVisualizando?.valorVenda) && (
          <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
            {receitaVisualizando.valorCompra && (
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'var(--text-muted)',
                    display: 'block',
                    mb: 0.3,
                  }}
                >
                  Valor de Compra
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'var(--text-primary)', fontWeight: 600 }}
                >
                  {receitaVisualizando.valorCompra}
                </Typography>
              </Box>
            )}
            {receitaVisualizando.valorVenda && (
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'var(--text-muted)',
                    display: 'block',
                    mb: 0.3,
                  }}
                >
                  Valor de Venda
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'var(--text-primary)', fontWeight: 600 }}
                >
                  {receitaVisualizando.valorVenda}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {receitaVisualizando?.materiais?.length > 0 && (
          <>
            <Divider sx={{ borderColor: 'var(--border-primary)', mb: 1.5 }} />
            <Typography
              variant="caption"
              sx={{
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                display: 'block',
                mb: 0.75,
              }}
            >
              Materiais
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
              {receitaVisualizando.materiais.map(m => (
                <Chip
                  key={m.id}
                  label={m.nome}
                  size="small"
                  sx={{
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-primary)',
                  }}
                />
              ))}
            </Box>
          </>
        )}

        {receitaVisualizando?.descricao && (
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
              Descrição
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
              {receitaVisualizando.descricao}
            </Typography>
          </>
        )}
      </EntityViewDialog>
    </Box>
  );
};

export default Receitas;
