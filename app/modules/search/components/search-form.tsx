import { SearchOutlined } from '@mui/icons-material';
import { Button, InputAdornment, Stack, TextField } from '@mui/material';
import { Form } from '@remix-run/react';
import * as React from 'react';
import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';

export const SearchForm: FC<{ initialQuery: string | null }> = ({
  initialQuery,
}) => {
  const [query, setQuery] = useState(initialQuery ?? '');
  const initialRef = useRef(true);

  useEffect(() => {
    if (initialQuery !== query && initialRef.current) {
      setQuery(initialQuery ?? '');

      initialRef.current = false;
    }
  }, [initialQuery, query]);

  return (
    <Stack component={Form} direction="row" gap={1}>
      <TextField
        label="Search"
        name="q"
        variant="outlined"
        size="small"
        value={query}
        onChange={({ target }) => setQuery(target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchOutlined />
            </InputAdornment>
          ),
        }}
      />
      <Button type="submit" variant="outlined">
        Search
      </Button>
    </Stack>
  );
};
