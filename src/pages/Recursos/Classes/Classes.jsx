import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { getClasses, removeClasse, getUniversos } from 'service/storage';
import { ROUTE_PATHS } from 'common/constants/routes';
import { useAuth } from 'context/AuthContext';
import { RARIDADES } from 'common/constants/constants';
import { ClasseCard } from './styles';

const ATRIBUTO_LABELS = {
  forca: 'Força',
  vitalidade: 'Vitalidade',
  agilidade: 'Agilidade',
  inteligencia: 'Inteligência',
  percepcao: 'Percepção',
};

const HAB_META_FIELDS = [
  { key: 'alvo', label: 'Alvo' },
  { key: 'alcance', label: 'Alcance' },
  { key: 'custo', label: 'Custo' },
  { key: 'recarga', label: 'Recarga' },
  { key: 'duracao', label: 'Duração' },
  { key: 'dados', label: 'Dados' },
];

const Classes = () => {
  const navigate = useNavigate();
  const { canCreate, canWrite } = useAuth();
  const [classes, setClasses] = useState([]);
  const [universos, setUniversos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroRaridade, setFiltroRaridade] = useState('');
  const [filtroUniverso, setFiltroUniverso] = useState('');
  const [classeVisualizando, setClasseVisualizando] = useState(null);

  useEffect(() => {
    Promise.all([getClasses(), getUniversos()])
      .then(([classesData, universosData]) => {
        setClasses(classesData);
        setUniversos(universosData);
      })
      .finally(() => setLoading(false));
  }, []);

  const classesFiltradas = useMemo(() => {
    return classes.filter(classe => {
      const matchNome =
        !filtroNome ||
        classe.nome?.toLowerCase().includes(filtroNome.toLowerCase());
      const matchRaridade =
        !filtroRaridade || classe.raridade === filtroRaridade;
      const matchUniverso =
        !filtroUniverso || classe.universo === filtroUniverso;
      return matchNome && matchRaridade && matchUniverso;
    });
  }, [classes, filtroNome, filtroRaridade, filtroUniverso]);

  const handleRemove = async id => {
    await removeClasse(id);
    setClasses(prev => prev.filter(c => c.id !== id));
  };

  return (
    <Box className="page-container" id="redungeon-classes" data-page="classes">
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
            Classes
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Gerencie as classes disponíveis na campanha.
          </Typography>
        </Box>
        {canCreate() && (
          <Button
            variant="contained"
            onClick={() => navigate(ROUTE_PATHS.NOVA_CLASSE)}
            sx={{
              background: 'var(--color-primary)',
              '&:hover': { background: '#5a2090' },
            }}
          >
            + Nova Classe
          </Button>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: 'var(--color-accent)' }} />
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr 1fr' },
              gap: 2,
              mb: 3,
            }}
          >
            <TextField
              label="Buscar por nome"
              size="small"
              value={filtroNome}
              onChange={e => setFiltroNome(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'var(--text-primary)',
                  '& fieldset': { borderColor: 'var(--border-primary)' },
                  '&:hover fieldset': { borderColor: 'var(--border-hover)' },
                  '&.Mui-focused fieldset': {
                    borderColor: 'var(--color-accent)',
                  },
                },
                '& .MuiInputLabel-root': { color: 'var(--text-secondary)' },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: 'var(--color-accent)',
                },
              }}
            />
            <FormControl size="small">
              <InputLabel
                sx={{
                  color: 'var(--text-secondary)',
                  '&.Mui-focused': { color: 'var(--color-accent)' },
                }}
              >
                Raridade
              </InputLabel>
              <Select
                label="Raridade"
                value={filtroRaridade}
                onChange={e => setFiltroRaridade(e.target.value)}
                sx={{
                  color: 'var(--text-primary)',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--border-primary)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--border-hover)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--color-accent)',
                  },
                  '& .MuiSvgIcon-root': { color: 'var(--text-secondary)' },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      background: 'var(--bg-card)',
                      color: 'var(--text-primary)',
                    },
                  },
                }}
              >
                <MenuItem value="">Todas</MenuItem>
                {RARIDADES.map(r => (
                  <MenuItem key={r} value={r}>
                    {r}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel
                sx={{
                  color: 'var(--text-secondary)',
                  '&.Mui-focused': { color: 'var(--color-accent)' },
                }}
              >
                Universo
              </InputLabel>
              <Select
                label="Universo"
                value={filtroUniverso}
                onChange={e => setFiltroUniverso(e.target.value)}
                sx={{
                  color: 'var(--text-primary)',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--border-primary)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--border-hover)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--color-accent)',
                  },
                  '& .MuiSvgIcon-root': { color: 'var(--text-secondary)' },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      background: 'var(--bg-card)',
                      color: 'var(--text-primary)',
                    },
                  },
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                {universos.map(u => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.Nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {classesFiltradas.length === 0 ? (
            <Box
              sx={{ textAlign: 'center', py: 8, color: 'var(--text-muted)' }}
            >
              <Typography variant="h2" sx={{ mb: 1 }}>
                ⚔️
              </Typography>
              <Typography variant="body1">Nenhuma classe encontrada</Typography>
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
              {classesFiltradas.map(classe => (
                <ClasseCard key={classe.id} elevation={0}>
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
                        onClick={() => setClasseVisualizando(classe)}
                        sx={{
                          color: 'var(--text-secondary)',
                          '&:hover': { color: 'var(--color-accent)' },
                        }}
                        aria-label={`Visualizar classe ${classe.nome}`}
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {canWrite(classe.universo) && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() =>
                            navigate(ROUTE_PATHS.NOVA_CLASSE, {
                              state: { classe },
                            })
                          }
                          sx={{
                            color: 'var(--color-accent)',
                            '&:hover': {
                              color: 'var(--color-accent)',
                              opacity: 0.8,
                            },
                          }}
                          aria-label={`Editar classe ${classe.nome}`}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleRemove(classe.id)}
                          sx={{
                            color: '#ef4444',
                            '&:hover': { color: '#ef4444' },
                          }}
                          aria-label={`Remover classe ${classe.nome}`}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Box>
                  {classe.linkImagem && (
                    <Box
                      component="img"
                      src={classe.linkImagem}
                      alt={classe.nome}
                      sx={{
                        width: '100%',
                        height: 180,
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
                    {classe.nome}
                  </Typography>
                  {classe.raridade && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'var(--color-accent)',
                        fontWeight: 600,
                        display: 'block',
                        mb: 1,
                      }}
                    >
                      {`${universos.find(u => u.id === classe.universo)?.Nome || 'Universo Desconhecido'} - ${classe.raridade}`}
                    </Typography>
                  )}
                  {classe.descricao && (
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
                      {classe.descricao}
                    </Typography>
                  )}
                  {classe.habilidades?.length > 0 && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'var(--text-muted)',
                        mt: 1,
                        display: 'block',
                      }}
                    >
                      {classe.habilidades.length} habilidade
                      {classe.habilidades.length !== 1 ? 's' : ''}
                    </Typography>
                  )}
                </ClasseCard>
              ))}
            </Box>
          )}
        </>
      )}

      <Dialog
        open={Boolean(classeVisualizando)}
        onClose={() => setClasseVisualizando(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{ color: 'var(--text-primary)', fontWeight: 700, pb: 1 }}
        >
          {classeVisualizando?.nome}
          {classeVisualizando?.raridade && (
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                color: 'var(--color-accent)',
                fontWeight: 600,
                mt: 0.5,
              }}
            >
              {`${universos.find(u => u.id === classeVisualizando?.universo)?.Nome || 'Universo Desconhecido'} — ${classeVisualizando.raridade}`}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'var(--border-primary)' }}>
          {classeVisualizando?.linkImagem && (
            <Box
              component="img"
              src={classeVisualizando.linkImagem}
              alt={classeVisualizando.nome}
              sx={{
                width: '100%',
                height: 200,
                borderRadius: 2,
                objectFit: 'cover',
                display: 'block',
                border: '1px solid var(--border-primary)',
                mb: 2,
              }}
              onError={e => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          {classeVisualizando?.descricao && (
            <>
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
                {classeVisualizando.descricao}
              </Typography>
            </>
          )}
          {classeVisualizando?.atributosBasicos &&
            Object.values(classeVisualizando.atributosBasicos).some(v => v) && (
              <>
                <Divider
                  sx={{ borderColor: 'var(--border-primary)', mb: 1.5 }}
                />
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
                  Atributos Básicos
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                    gap: 1,
                    mb: 2,
                  }}
                >
                  {Object.entries(classeVisualizando.atributosBasicos).map(
                    ([key, value]) =>
                      value ? (
                        <Box
                          key={key}
                          sx={{
                            background: 'var(--bg-secondary)',
                            borderRadius: 1,
                            p: 1,
                            textAlign: 'center',
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'var(--text-muted)',
                              display: 'block',
                            }}
                          >
                            {ATRIBUTO_LABELS[key] ?? key}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'var(--text-primary)',
                              fontWeight: 600,
                            }}
                          >
                            {value}
                          </Typography>
                        </Box>
                      ) : null,
                  )}
                </Box>
              </>
            )}
          {classeVisualizando?.habilidadesBasicas?.length > 0 && (
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
                Habilidades Básicas
              </Typography>
              {classeVisualizando.habilidadesBasicas.map((hab, i) => (
                <Box
                  key={i}
                  sx={{
                    mb: 1,
                    p: 1.5,
                    background: 'var(--bg-secondary)',
                    borderRadius: 1,
                    border: '1px solid var(--border-primary)',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: 'var(--text-primary)', fontWeight: 600 }}
                    >
                      {hab.nome}
                    </Typography>
                    {hab.acao && (
                      <Typography
                        variant="caption"
                        sx={{ color: 'var(--color-accent)', fontWeight: 600 }}
                      >
                        {hab.acao}
                      </Typography>
                    )}
                  </Box>
                  {hab.descricao && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'var(--text-secondary)',
                        display: 'block',
                        mb: 0.75,
                      }}
                    >
                      {hab.descricao}
                    </Typography>
                  )}
                  {HAB_META_FIELDS.filter(f => hab[f.key]).length > 0 && (
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 0.75,
                        mt: 0.5,
                      }}
                    >
                      {HAB_META_FIELDS.filter(f => hab[f.key]).map(f => (
                        <Box
                          key={f.key}
                          sx={{
                            background: 'var(--bg-primary)',
                            borderRadius: 1,
                            px: 1,
                            py: 0.5,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'var(--text-muted)',
                              display: 'block',
                              fontSize: '0.65rem',
                            }}
                          >
                            {f.label}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'var(--text-primary)',
                              fontWeight: 600,
                            }}
                          >
                            {hab[f.key]}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                  {hab.bonus?.filter(Boolean).length > 0 && (
                    <Box sx={{ mt: 0.75 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'var(--text-muted)',
                          display: 'block',
                          fontSize: '0.65rem',
                          mb: 0.25,
                        }}
                      >
                        Bônus
                      </Typography>
                      {hab.bonus.filter(Boolean).map((b, bi) => (
                        <Typography
                          key={bi}
                          variant="caption"
                          sx={{
                            color: 'var(--color-accent)',
                            display: 'block',
                          }}
                        >
                          • {b}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Box>
              ))}
            </>
          )}
          {classeVisualizando?.habilidadesAvancadas?.length > 0 && (
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
                Habilidades Avançadas
              </Typography>
              {classeVisualizando.habilidadesAvancadas.map((hab, i) => (
                <Box
                  key={i}
                  sx={{
                    mb: 1,
                    p: 1.5,
                    background: 'var(--bg-secondary)',
                    borderRadius: 1,
                    border: '1px solid var(--border-primary)',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: 'var(--text-primary)', fontWeight: 600 }}
                    >
                      {hab.nome}
                    </Typography>
                    {hab.acao && (
                      <Typography
                        variant="caption"
                        sx={{ color: 'var(--color-accent)', fontWeight: 600 }}
                      >
                        {hab.acao}
                      </Typography>
                    )}
                  </Box>
                  {hab.descricao && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'var(--text-secondary)',
                        display: 'block',
                        mb: 0.75,
                      }}
                    >
                      {hab.descricao}
                    </Typography>
                  )}
                  {HAB_META_FIELDS.filter(f => hab[f.key]).length > 0 && (
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 0.75,
                        mt: 0.5,
                      }}
                    >
                      {HAB_META_FIELDS.filter(f => hab[f.key]).map(f => (
                        <Box
                          key={f.key}
                          sx={{
                            background: 'var(--bg-primary)',
                            borderRadius: 1,
                            px: 1,
                            py: 0.5,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'var(--text-muted)',
                              display: 'block',
                              fontSize: '0.65rem',
                            }}
                          >
                            {f.label}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'var(--text-primary)',
                              fontWeight: 600,
                            }}
                          >
                            {hab[f.key]}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                  {hab.bonus?.filter(Boolean).length > 0 && (
                    <Box sx={{ mt: 0.75 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'var(--text-muted)',
                          display: 'block',
                          fontSize: '0.65rem',
                          mb: 0.25,
                        }}
                      >
                        Bônus
                      </Typography>
                      {hab.bonus.filter(Boolean).map((b, bi) => (
                        <Typography
                          key={bi}
                          variant="caption"
                          sx={{
                            color: 'var(--color-accent)',
                            display: 'block',
                          }}
                        >
                          • {b}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Box>
              ))}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setClasseVisualizando(null)}
            sx={{
              color: 'var(--text-secondary)',
              '&:hover': { color: 'var(--text-primary)' },
            }}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Classes;
