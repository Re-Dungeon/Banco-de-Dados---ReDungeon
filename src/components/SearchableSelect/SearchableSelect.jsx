import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

const inputSx = {
  '& .MuiOutlinedInput-root': {
    color: 'var(--text-primary)',
    '& fieldset': { borderColor: 'var(--border-primary)' },
    '&:hover fieldset': { borderColor: 'var(--border-hover)' },
    '&.Mui-focused fieldset': { borderColor: 'var(--color-accent)' },
  },
  '& .MuiInputLabel-root': { color: 'var(--text-secondary)' },
  '& .MuiInputLabel-root.Mui-focused': { color: 'var(--color-accent)' },
  '& .MuiFormHelperText-root': { color: '#ef4444' },
  '& .MuiSvgIcon-root': { color: 'var(--text-secondary)' },
};

const paperSx = {
  background: 'var(--bg-card)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-primary)',
};

const chipSx = {
  background: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-primary)',
};

const checkedIcon = <CheckBoxIcon fontSize="small" />;
const uncheckedIcon = <CheckBoxOutlineBlankIcon fontSize="small" />;

/**
 * Select digitável (filtra opções ao digitar) com opções sempre listadas em
 * ordem alfabética. Substitui o `<Select>`/`<MenuItem>` do MUI em toda a
 * aplicação. É um componente controlado e não sabe nada de Formik — veja
 * `components/FormSelect` para o adaptador usado em `<Field>`/`<FastField>`.
 */
const SearchableSelect = ({
  label,
  options,
  value,
  onChange,
  onBlur,
  name,
  multiple = false,
  disableClearable = false,
  fullWidth = true,
  size,
  error = false,
  helperText,
  placeholder,
  sx = {},
  listboxMaxHeight,
  compactSelection = false,
  compactMaxVisible = 2,
}) => {
  const sortedOptions = useMemo(
    () =>
      [...options].sort((a, b) =>
        a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' }),
      ),
    [options],
  );

  const [previewAnchor, setPreviewAnchor] = useState(null);
  const selectedValues = Array.isArray(value) ? value : [];

  const handleRemoveTag = option => {
    if (!multiple || !Array.isArray(value)) return;

    const nextValue = value.filter(item => item.value !== option.value);
    onChange({ target: { name } }, nextValue);
    setPreviewAnchor(null);
  };

  const shouldCompact = multiple && compactSelection && selectedValues.length > 0;
  const showCompactEye = shouldCompact;

  return (
    <>
      <Box sx={{ position: 'relative', width: '100%' }}>
        <Autocomplete
          multiple={multiple}
          disableClearable={disableClearable || showCompactEye}
          disableCloseOnSelect={multiple}
          fullWidth={fullWidth}
          size={size}
          options={sortedOptions}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          limitTags={shouldCompact ? compactMaxVisible : undefined}
          getOptionLabel={option => option?.label ?? ''}
          isOptionEqualToValue={(option, val) => option.value === val.value}
          slotProps={{
            paper: { sx: paperSx },
            clearIndicator: {
              sx: {
                display: showCompactEye ? 'none' : 'flex',
              },
            },
            popupIndicator: {
              sx: {
                ml: 0.5,
              },
            },
            ...(listboxMaxHeight && {
              listbox: { sx: { maxHeight: listboxMaxHeight } },
            }),
          }}
          renderOption={(liProps, option, { selected }) => {
            const { key, ...optionProps } = liProps;
            return (
              <li key={key} {...optionProps}>
                {multiple && (
                  <Checkbox
                    icon={uncheckedIcon}
                    checkedIcon={checkedIcon}
                    checked={selected}
                    sx={{
                      color: 'var(--text-secondary)',
                      '&.Mui-checked': { color: 'var(--color-accent)' },
                    }}
                  />
                )}
                {option.label}
              </li>
            );
          }}
          renderInput={params => (
            <TextField
              {...params}
              name={name}
              label={label}
              placeholder={placeholder}
              error={error}
              helperText={helperText}
              sx={{ ...inputSx, ...sx }}
            />
          )}
        />

        {showCompactEye && (
          <IconButton
            aria-label="Visualizar universos selecionados"
            size="small"
            onClick={event => {
              event.stopPropagation();
              setPreviewAnchor(event.currentTarget);
            }}
            sx={{
              position: 'absolute',
              right: 36,
              top: '50%',
              transform: 'translateY(-50%)',
              border: '1px solid var(--border-primary)',
              background: 'rgba(255,255,255,0.03)',
              color: 'var(--text-secondary)',
              zIndex: 2,
              minWidth: 28,
              width: 28,
              height: 28,
              '&:hover': {
                background: 'rgba(255,255,255,0.06)',
                borderColor: 'var(--border-hover)',
              },
            }}
          >
            <VisibilityOutlinedIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {multiple && compactSelection && selectedValues.length > 0 && (
        <Popover
          open={Boolean(previewAnchor)}
          anchorEl={previewAnchor}
          onClose={() => setPreviewAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{
            paper: {
              sx: {
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)',
                borderRadius: 2,
                boxShadow: 'var(--shadow-md)',
                p: 1.5,
                minWidth: 240,
              },
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              maxHeight: 220,
              overflowY: 'auto',
            }}
          >
            <Box
              sx={{
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-secondary)',
                mb: 0.5,
              }}
            >
              Todos os universos selecionados
            </Box>

            {selectedValues.map(option => (
              <Chip
                key={option.value}
                label={option.label}
                size="small"
                onDelete={() => handleRemoveTag(option)}
                sx={chipSx}
              />
            ))}
          </Box>
        </Popover>
      )}
    </>
  );
};

SearchableSelect.propTypes = {
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
  value: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  name: PropTypes.string,
  multiple: PropTypes.bool,
  disableClearable: PropTypes.bool,
  fullWidth: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium']),
  error: PropTypes.bool,
  helperText: PropTypes.node,
  placeholder: PropTypes.string,
  sx: PropTypes.object,
  listboxMaxHeight: PropTypes.number,
  compactSelection: PropTypes.bool,
  compactMaxVisible: PropTypes.number,
};

export default SearchableSelect;
