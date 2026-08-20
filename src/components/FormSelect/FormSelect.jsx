import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import SearchableSelect from 'components/SearchableSelect/SearchableSelect';

const normalizeOption = option =>
  typeof option === 'string' || typeof option === 'number'
    ? { value: option, label: String(option) }
    : option;

/**
 * Adapta o `SearchableSelect` ao padrão de render prop do Formik
 * (`<Field>`/`<FastField>`), substituindo o antigo `<Select>` do MUI nos
 * formulários. `options` aceita tanto strings/números quanto objetos
 * `{ value, label }`.
 */
const FormSelect = ({
  field,
  form,
  label,
  options,
  multiple = false,
  disableClearable = false,
  fullWidth = true,
  size,
  error,
  helperText,
  placeholder,
  sx,
  onValueChange,
  compactSelection = false,
  compactMaxVisible,
}) => {
  const normalizedOptions = useMemo(
    () => options.map(normalizeOption),
    [options],
  );

  const value = multiple
    ? normalizedOptions.filter(option =>
        (field.value || []).includes(option.value),
      )
    : (normalizedOptions.find(option => option.value === field.value) ?? null);

  const handleChange = (event, newValue) => {
    const nextValue = multiple
      ? newValue.map(option => option.value)
      : newValue
        ? newValue.value
        : '';
    form.setFieldValue(field.name, nextValue);
    onValueChange?.(nextValue, form);
  };

  const handleBlur = () => form.setFieldTouched(field.name, true);

  return (
    <SearchableSelect
      label={label}
      name={field.name}
      options={normalizedOptions}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      multiple={multiple}
      disableClearable={disableClearable}
      fullWidth={fullWidth}
      size={size}
      error={error}
      helperText={helperText}
      placeholder={placeholder}
      sx={sx}
      compactSelection={compactSelection}
      compactMaxVisible={compactMaxVisible}
    />
  );
};

FormSelect.propTypes = {
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.any,
  }).isRequired,
  form: PropTypes.shape({
    setFieldValue: PropTypes.func.isRequired,
    setFieldTouched: PropTypes.func.isRequired,
  }).isRequired,
  label: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  multiple: PropTypes.bool,
  disableClearable: PropTypes.bool,
  fullWidth: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium']),
  error: PropTypes.bool,
  helperText: PropTypes.node,
  placeholder: PropTypes.string,
  sx: PropTypes.object,
  onValueChange: PropTypes.func,
  compactSelection: PropTypes.bool,
  compactMaxVisible: PropTypes.number,
};

export default FormSelect;
