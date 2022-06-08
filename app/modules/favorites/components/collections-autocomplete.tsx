import styled from '@emotion/styled';
import { CollectionsBookmarkOutlined } from '@mui/icons-material';
import { Box, ButtonBase } from '@mui/material';
import type { Collection } from '@prisma/client';
import type { FC } from 'react';
import { useState } from 'react';
import { CheckboxAutocomplete } from '~/modules/common/checkbox-autocomplete';
import { Chip } from '~/modules/common/chip';

interface Props {
  allCollections: Collection[];
  selectedCollections?: Collection[];
  defaultCollections?: Collection[];
  onChange: (collections: Collection[]) => void;
  onNewCollection: (name: string) => void;
}

export const CollectionsAutocomplete: FC<Props> = ({
  allCollections,
  selectedCollections,
  defaultCollections,
  onChange,
  onNewCollection,
}) => {
  const [value, setValue] = useState('');

  return (
    <>
      <CheckboxAutocomplete
        onClose={() => setValue('')}
        options={allCollections}
        value={selectedCollections}
        defaultValue={defaultCollections}
        onChange={(_, value) => onChange(value)}
        getOptionLabel={({ name }) => name}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        renderTags={(value) => (
          <div className="mr-1">
            <Chip
              icon={<CollectionsBookmarkOutlined sx={{ fontSize: '1rem' }} />}
              label={`${value.length}`}
            />
          </div>
        )}
        componentsProps={{
          paper: {
            sx: {
              '& .MuiAutocomplete-noOptions': {
                px: 0,
              },
            },
          },
        }}
        noOptionsText={
          value ? (
            <NewCollectionButton
              onClick={() => onNewCollection(value)}
              disabled={!value}
              className="inline-flex flex-col text-sm w-full border border-gray-400"
              sx={{ px: 2, py: 1 }}
            >
              <span>Create new collection</span>
              <b>{value}</b>
            </NewCollectionButton>
          ) : (
            <Box px={2}>Start typing collection name</Box>
          )
        }
        TextFieldProps={{
          label: 'Collections',
          onChange: (value) => {
            setValue(value);
          },
        }}
      />
    </>
  );
};

const NewCollectionButton = styled(ButtonBase)`
  border-radius: 0.125rem;
  align-items: flex-start;
`;
