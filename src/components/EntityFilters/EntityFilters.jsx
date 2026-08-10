import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import SearchableSelect from 'components/SearchableSelect/SearchableSelect';
import { OPCOES_ORDENACAO_NOME, ORDEM_ASC } from 'common/utils/ordenacao';

const textFieldSx = {
  '& .MuiOutlinedInput-root': {
    color: 'var(--text-primary)',
    '& fieldset': { borderColor: 'var(--border-primary)' },
    '&:hover fieldset': { borderColor: 'var(--border-hover)' },
    '&.Mui-focused fieldset': { borderColor: 'var(--color-accent)' },
  },
  '& .MuiInputLabel-root': { color: 'var(--text-secondary)' },
  '& .MuiInputLabel-root.Mui-focused': { color: 'var(--color-accent)' },
};

/**
 * Grade de filtros repetida em toda página de listagem de entidade: busca
 * por nome, N campos de select dinâmicos (`extraFilters`) e um select de
 * Universo fixo ao final.
 */
const EntityFilters = ({
  nomeValue,
  onNomeChange,
  extraFilters = [],
  universos = [],
  universoValue,
  onUniversoChange,
  sortValue = ORDEM_ASC,
  onSortChange,
  sx = {},
  menuMaxHeight,
}) => {
  const totalColunas = extraFilters.length + 1 + (onSortChange ? 1 : 0);
  const universoOptions = universos.map(u => ({ value: u.id, label: u.Nome }));

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: `2fr repeat(${totalColunas}, 1fr)`,
        },
        gap: 2,
        mb: 3,
        ...sx,
      }}
    >
      <TextField
        label="Buscar por nome"
        size="small"
        value={nomeValue}
        onChange={e => onNomeChange(e.target.value)}
        slotProps={{ inputLabel: { shrink: true } }}
        sx={textFieldSx}
      />
      {extraFilters.map(filtro => {
        const options = filtro.options.map(opcao => ({
          value: opcao,
          label: opcao,
        }));
        return (
          <SearchableSelect
            key={filtro.label}
            label={filtro.label}
            size="small"
            options={options}
            value={options.find(o => o.value === filtro.value) ?? null}
            onChange={(e, newValue) => filtro.onChange(newValue?.value ?? '')}
            placeholder={filtro.allLabel || 'Todos'}
            listboxMaxHeight={menuMaxHeight}
          />
        );
      })}
      <SearchableSelect
        label="Universo"
        size="small"
        options={universoOptions}
        value={universoOptions.find(o => o.value === universoValue) ?? null}
        onChange={(e, newValue) => onUniversoChange(newValue?.value ?? '')}
        placeholder="Todos"
        listboxMaxHeight={menuMaxHeight}
      />
      {onSortChange && (
        <SearchableSelect
          label="Ordenar"
          size="small"
          disableClearable
          options={OPCOES_ORDENACAO_NOME}
          value={OPCOES_ORDENACAO_NOME.find(o => o.value === sortValue) ?? null}
          onChange={(e, newValue) => onSortChange(newValue.value)}
          listboxMaxHeight={menuMaxHeight}
        />
      )}
    </Box>
  );
};

EntityFilters.propTypes = {
  nomeValue: PropTypes.string.isRequired,
  onNomeChange: PropTypes.func.isRequired,
  extraFilters: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      onChange: PropTypes.func.isRequired,
      options: PropTypes.arrayOf(PropTypes.string).isRequired,
      allLabel: PropTypes.string,
    }),
  ),
  universos: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.string, Nome: PropTypes.string }),
  ),
  universoValue: PropTypes.string.isRequired,
  onUniversoChange: PropTypes.func.isRequired,
  sortValue: PropTypes.oneOf(['asc', 'desc']),
  onSortChange: PropTypes.func,
  sx: PropTypes.object,
  menuMaxHeight: PropTypes.number,
};

export default EntityFilters;
