import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FlashOnOutlinedIcon from '@mui/icons-material/FlashOnOutlined';
import DataObjectOutlinedIcon from '@mui/icons-material/DataObjectOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import { getAptidoes, removeAptidao } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import { useAuth } from 'context/AuthContext';
import useEntityCRUD from 'hooks/useEntityCRUD';
import useDeleteConfirmation from 'hooks/useDeleteConfirmation';
import useUniversos from 'hooks/useUniversos';
import { ordenarPorNome, ORDEM_ASC } from 'common/utils/ordenacao';
import EntityFilters from 'components/EntityFilters/EntityFilters';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import {
  AptidaoDialogContentWrapper,
  AptidaoSectionGrid,
  AptidaoSectionCard,
  AptidaoSectionHeader,
  AptidaoSectionBody,
} from './styles';
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
import { getAptidaoUniversos, formatNomesUniversos } from './utils';

const Aptidoes = () => {
  const navigate = useNavigate();
  const { canCreate, canWrite } = useAuth();
  const {
    items: aptidoes,
    loading: loadingAptidoes,
    remove: handleRemove,
  } = useEntityCRUD({ getAll: getAptidoes, remove: removeAptidao });
  const { universos, loadingUniversos } = useUniversos();
  const { confirmDelete, deleteConfirmationDialog } = useDeleteConfirmation();
  const loading = loadingAptidoes || loadingUniversos;
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroUniverso, setFiltroUniverso] = useState('');
  const [ordenacao, setOrdenacao] = useState(ORDEM_ASC);
  const [aptidaoVisualizando, setAptidaoVisualizando] = useState(null);

  const aptidoesFiltradas = useMemo(() => {
    const filtradas = aptidoes.filter(aptidao => {
      const matchNome =
        !filtroNome ||
        aptidao.nome?.toLowerCase().includes(filtroNome.toLowerCase());
      const matchUniverso =
        !filtroUniverso ||
        getAptidaoUniversos(aptidao).includes(filtroUniverso);
      return matchNome && matchUniverso;
    });
    return ordenarPorNome(filtradas, ordenacao);
  }, [aptidoes, filtroNome, filtroUniverso, ordenacao]);

  return (
    <Box
      className="page-container"
      id="redungeon-aptidoes"
      data-page="aptidoes"
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
            Aptidões
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Gerencie as aptidões disponíveis na campanha.
          </Typography>
        </Box>
        {canCreate() && (
          <Button
            variant="contained"
            onClick={() => navigate(ROUTE_PATHS.NOVA_APTIDAO)}
            sx={{
              background: 'var(--color-primary)',
              '&:hover': { background: '#5a2090' },
            }}
          >
            + Nova Aptidão
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

          {aptidoesFiltradas.length === 0 ? (
            <Box
              sx={{ textAlign: 'center', py: 8, color: 'var(--text-muted)' }}
            >
              <Typography variant="h2" sx={{ mb: 1 }}>
                🎯
              </Typography>
              <Typography variant="body1">
                Nenhuma aptidão encontrada
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
              {aptidoesFiltradas.map(aptidao => (
                <RacaCard key={aptidao.id} elevation={0}>
                  <RacaImageFrame>
                    <RacaImageOverlay />
                    <RacaActionBar>
                      <Tooltip title="Visualizar detalhes">
                        <IconButton size="small" onClick={() => setAptidaoVisualizando(aptidao)} sx={{ color: 'var(--text-secondary)', padding: '14px', minWidth: '16px', width: '16px', height: '16px', '&:hover': { color: 'var(--color-accent)' } }} aria-label={`Visualizar aptidão ${aptidao.nome}`}>
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {canWrite(getAptidaoUniversos(aptidao)) && (
                        <>
                          <IconButton size="small" onClick={() => navigate(ROUTE_PATHS.NOVA_APTIDAO, { state: { aptidao } })} sx={{ color: 'var(--color-accent)', padding: '4px', minWidth: '32px', width: '32px', height: '32px', '&:hover': { color: 'var(--color-accent)', opacity: 0.8 } }} aria-label={`Editar aptidão ${aptidao.nome}`}>
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => confirmDelete(aptidao.nome, () => handleRemove(aptidao.id))} sx={{ color: '#ef4444', padding: '4px', minWidth: '32px', width: '32px', height: '32px', '&:hover': { color: '#ef4444' } }} aria-label={`Remover aptidão ${aptidao.nome}`}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </RacaActionBar>

                    {aptidao.linkImagem && (
                      <Box component="img" className="raca-card-image" src={aptidao.linkImagem} alt={aptidao.nome} onError={e => { e.currentTarget.style.display = 'none'; }} />
                    )}
                  </RacaImageFrame>

                  <RacaContent>
                    <RacaTitle variant="h6">{aptidao.nome}</RacaTitle>

                    {aptidao.nivelMaximo && (
                      <RacaSubtitle variant="caption">
                        Nível Máx. {aptidao.nivelMaximo}
                      </RacaSubtitle>
                    )}

                    {aptidao.descricao && <RacaDescription variant="body2">{aptidao.descricao}</RacaDescription>}

                    <RacaFooter>
                      <CardTokens
                        items={
                          getAptidaoUniversos(aptidao).length > 0
                            ? universos
                                .filter(u => getAptidaoUniversos(aptidao).includes(u.id))
                                .map(u => `📖 ${u.Nome}`)
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
        open={Boolean(aptidaoVisualizando)}
        onClose={() => setAptidaoVisualizando(null)}
        maxWidth="lg"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              background: 'rgba(4, 8, 20, 0.96)',
              border: '1px solid rgba(111, 45, 168, 0.22)',
              borderRadius: 4,
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.45)',
              overflow: 'hidden',
              maxWidth: '1180px',
              width: '100%',
              backdropFilter: 'blur(18px)',
            },
          },
        }}
      >
        {(aptidaoVisualizando?.nome || aptidaoVisualizando?.nivelMaximo) && (
          <DialogTitle
            sx={{
              px: { xs: 2.4, md: 3.2 },
              pt: { xs: 2.4, md: 3 },
              pb: { xs: 1.4, md: 1.8 },
              background:
                'linear-gradient(135deg, rgba(20, 35, 70, 0.95) 0%, rgba(25, 35, 65, 0.92) 50%, rgba(30, 20, 55, 0.94) 100%)',
              borderBottom: '1px solid rgba(0, 217, 255, 0.12)',
              color: '#fff',
              lineHeight: 1.15,
              position: 'relative',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                {aptidaoVisualizando?.nome && (
                  <Typography
                    variant="h4"
                    sx={{
                      color: '#ffffff',
                      fontWeight: 900,
                      fontSize: { xs: '1.55rem', md: '2rem' },
                      letterSpacing: '0.02em',
                      lineHeight: 1.1,
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    {aptidaoVisualizando?.nome}
                  </Typography>
                )}
                {aptidaoVisualizando?.nivelMaximo && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      color: 'var(--color-accent)',
                      fontWeight: 700,
                      mt: 0.9,
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      fontSize: '0.7rem',
                    }}
                  >
                    {`Nível Máx. ${aptidaoVisualizando.nivelMaximo}`}
                  </Typography>
                )}
              </Box>
            </Box>
          </DialogTitle>
        )}

        <DialogContent
          dividers
          sx={{
            px: { xs: 2.2, md: 3.2 },
            pt: { xs: 2.2, md: 2.8 },
            pb: { xs: 2.2, md: 2.8 },
            borderColor: 'rgba(111, 45, 168, 0.18)',
            background:
              'linear-gradient(180deg, rgba(7, 13, 27, 0.98) 0%, rgba(5, 9, 19, 0.96) 100%)',
            scrollbarWidth: 'thin',
          }}
        >
          {(aptidaoVisualizando?.linkImagem) && (
            <Box
              sx={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 3.5,
                border: '1px solid rgba(255, 255, 255, 0.06)',
                mb: 2, // reduz espaço entre banner e conteúdo
                // altura reduzida para este modal específico
                height: { xs: 220, md: 240 },
                boxShadow: '0 12px 30px rgba(0,0,0,0.45)',
                background: 'linear-gradient(135deg, rgba(8, 13, 28, 0.98) 0%, rgba(15, 22, 40, 0.9) 100%)',
              }}
            >
              <Box
                component="img"
                src={aptidaoVisualizando?.linkImagem}
                alt={aptidaoVisualizando?.nome || 'Imagem do conteúdo'}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  display: 'block',
                }}
                onError={e => {
                  e.currentTarget.style.display = 'none';
                }}
              />

              {/* overlay escuro discreto */}
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.35) 100%)',
                  pointerEvents: 'none',
                }}
              />
            </Box>
          )}

          <AptidaoDialogContentWrapper sx={{ mt: 0 }}>
          <AptidaoSectionGrid>
            <AptidaoSectionCard>
              <AptidaoSectionHeader>
                <DescriptionOutlinedIcon fontSize="small" /> Descrição
              </AptidaoSectionHeader>
              <AptidaoSectionBody>
                {aptidaoVisualizando?.descricao ||
                  'Nenhuma descrição detalhada foi registrada para esta aptidão.'}
              </AptidaoSectionBody>
            </AptidaoSectionCard>

            <AptidaoSectionCard>
              <AptidaoSectionHeader>
                <FlashOnOutlinedIcon fontSize="small" /> Funcionamento
              </AptidaoSectionHeader>
              <AptidaoSectionBody>
                {aptidaoVisualizando?.progressaoNiveis?.length > 0 ? (
                  <Box
                    sx={{
                      // 4 linhas de texto (usa line-height do container: 1.8 * 4 = 7.2em)
                      maxHeight: '7.2em',
                      overflowY: 'auto',
                      pr: 1,
                      // barra de rolagem discreta
                      '&::-webkit-scrollbar': { width: '8px' },
                      '&::-webkit-scrollbar-track': { background: 'transparent' },
                      '&::-webkit-scrollbar-thumb': {
                        background: 'rgba(255,255,255,0.06)',
                        borderRadius: '999px',
                      },
                    }}
                  >
                    {aptidaoVisualizando.progressaoNiveis.map(nivel => (
                      <Box key={nivel.nivel} mb={1.5}>
                        <Box component="div" sx={{ fontWeight: 700 }}>
                          {`Nível ${nivel.nivel}`}
                        </Box>
                        {nivel.possuiBonus ? (
                          <Box sx={{ mt: 0.5 }}>
                            <Box component="div">• {nivel.bonus.descricaoCurta}</Box>
                            {nivel.bonus.descricaoCompleta && (
                              <Box component="div" sx={{ mt: 0.5 }}>
                                {nivel.bonus.descricaoCompleta}
                              </Box>
                            )}
                          </Box>
                        ) : (
                          <Box component="div">Sem bônus: +1 no dado em testes desta aptidão.</Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  'Informações de funcionamento não estão disponíveis para esta aptidão.'
                )}
              </AptidaoSectionBody>
            </AptidaoSectionCard>

            <AptidaoSectionCard>
              <AptidaoSectionHeader>
                <DataObjectOutlinedIcon fontSize="small" /> Dados Utilizados
              </AptidaoSectionHeader>
              <AptidaoSectionBody>
                <Box component="span" display="block" mb={1}>
                  <strong>Nível Máximo:</strong>{' '}
                  {aptidaoVisualizando?.nivelMaximo || 'Não definido'}
                </Box>
                <Box component="span" display="block">
                  <strong>Universos:</strong>{' '}
                  {formatNomesUniversos(getAptidaoUniversos(aptidaoVisualizando), universos) ||
                    'Universo Desconhecido'}
                </Box>
              </AptidaoSectionBody>
            </AptidaoSectionCard>

            <AptidaoSectionCard>
              <AptidaoSectionHeader>
                <CheckCircleOutlinedIcon fontSize="small" /> Sucesso
              </AptidaoSectionHeader>
              <AptidaoSectionBody>
                {aptidaoVisualizando?.progressaoNiveis?.some(n => n.possuiBonus)
                  ? 'As condições de sucesso são alcançadas ao cumprir as vantagens de nível desta aptidão.'
                  : 'Nenhuma definição de sucesso foi registrada para esta aptidão.'}
              </AptidaoSectionBody>
            </AptidaoSectionCard>

            <AptidaoSectionCard>
              <AptidaoSectionHeader>
                <CancelOutlinedIcon fontSize="small" /> Falha
              </AptidaoSectionHeader>
              <AptidaoSectionBody>
                {aptidaoVisualizando?.progressaoNiveis?.every(n => !n.possuiBonus)
                  ? 'A falha indica ausência de bônus extra e pode resultar em testes padrão ou penalidades do mestre.'
                  : 'A falha pode significar que o efeito não se aplica ou que o jogador não cumpriu os requisitos.'}
              </AptidaoSectionBody>
            </AptidaoSectionCard>

            <AptidaoSectionCard>
              <AptidaoSectionHeader>
                <GavelOutlinedIcon fontSize="small" /> Restrições
              </AptidaoSectionHeader>
              <AptidaoSectionBody>
                {aptidaoVisualizando?.nivelMaximo
                  ? `Requer até nível ${aptidaoVisualizando.nivelMaximo} e apenas os universos listados.`
                  : 'Nenhuma restrição específica foi definida para esta aptidão.'}
              </AptidaoSectionBody>
            </AptidaoSectionCard>
          </AptidaoSectionGrid>
        </AptidaoDialogContentWrapper>
        </DialogContent>

        <DialogActions
          sx={{
            px: { xs: 2.2, md: 3.2 },
            py: 2,
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            justifyContent: 'flex-end',
            gap: 1,
            background: 'rgba(3, 7, 15, 0.92)',
          }}
        >
          <Button
            onClick={() => setAptidaoVisualizando(null)}
            sx={{
              color: 'var(--text-primary)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.18)',
              textTransform: 'none',
              px: 2.4,
              py: 1,
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.06)',
                color: 'var(--text-primary)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            Fechar
          </Button>

          {canWrite(getAptidaoUniversos(aptidaoVisualizando)) && (
            <Button
              variant="contained"
              sx={{
                background: 'var(--color-primary)',
                color: '#fff',
                textTransform: 'none',
                px: 2.5,
                py: 1,
                borderRadius: 2,
                '&:hover': { background: '#6f2da8' },
              }}
              onClick={() =>
                navigate(ROUTE_PATHS.NOVA_APTIDAO, {
                  state: { aptidao: aptidaoVisualizando },
                })
              }
            >
              Editar
            </Button>
          )}
        </DialogActions>
      </Dialog>
      {deleteConfirmationDialog}
    </Box>
  );
};

export default Aptidoes;
