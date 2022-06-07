import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import type { AutocompleteProps } from '@mui/material';
import { Checkbox, TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import * as React from 'react';

interface CheckboxAutocompleteProps<T>
  extends Omit<AutocompleteProps<T, true, false, false>, 'renderInput'> {
  TextFieldProps?: {
    label?: string;
    placeholder?: string;
    onChange?: (value: string) => void;
  };
}

export function CheckboxAutocomplete<T>({
  TextFieldProps,
  ...props
}: CheckboxAutocompleteProps<T>) {
  return (
    <Autocomplete
      {...props}
      multiple
      disableCloseOnSelect
      renderOption={(optionProps, option, { selected }) => (
        <li {...optionProps}>
          <Checkbox
            icon={icon}
            checkedIcon={checkedIcon}
            sx={{ mr: 1 }}
            checked={selected}
          />
          {props.getOptionLabel && props.getOptionLabel(option)}
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="standard"
          onChange={({ target }) => {
            if (TextFieldProps?.onChange) {
              TextFieldProps.onChange(target.value);
            }
          }}
          label={TextFieldProps?.label}
          placeholder={TextFieldProps?.placeholder}
        />
      )}
    />
  );
}

const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;
