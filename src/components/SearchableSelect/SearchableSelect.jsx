import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

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
}) => {
  const sortedOptions = useMemo(
    () =>
      [...options].sort((a, b) =>
        a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' }),
      ),
    [options],
  );

  return (
    <Autocomplete
      multiple={multiple}
      disableClearable={disableClearable}
      disableCloseOnSelect={multiple}
      fullWidth={fullWidth}
      size={size}
      options={sortedOptions}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      getOptionLabel={option => option?.label ?? ''}
      isOptionEqualToValue={(option, val) => option.value === val.value}
      slotProps={{
        paper: { sx: paperSx },
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
      {...(multiple && {
        renderTags: (tagValue, getTagProps) =>
          tagValue.map((option, index) => {
            const { key, ...tagProps } = getTagProps({ index });
            return (
              <Chip
                key={key}
                label={option.label}
                size="small"
                {...tagProps}
                sx={chipSx}
              />
            );
          }),
      })}
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
};

export default SearchableSelect;
