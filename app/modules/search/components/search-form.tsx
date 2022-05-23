import { AddCircle, Cancel, SearchOutlined, Tag } from '@mui/icons-material';
import {
  Button,
  Card,
  CardContent,
  InputAdornment,
  Stack,
  TextField,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { Form, useNavigate } from '@remix-run/react';
import type { FC } from 'react';
import * as React from 'react';
import { Fragment, useEffect, useRef, useState } from 'react';
import { TagChip } from '~/modules/tags/components/tag-chip';
import { normalizeTags } from '~/modules/tags/normalize-tags';

interface Props {
  initialQuery: string | null;
  tags: string[];
}

export const SearchForm: FC<Props> = ({ initialQuery, tags: initialTags }) => {
  const tags = normalizeTags(initialTags);

  const [query, setQuery] = useState(initialQuery ?? '');

  const initialRef = useRef(true);
  const navigate = useNavigate();

  const [tag, setTag] = useState('');

  useEffect(() => {
    if (initialQuery !== query && initialRef.current) {
      setQuery(initialQuery ?? '');
    }

    initialRef.current = false;
  }, [initialQuery, query]);

  return (
    <Stack
      component={Form}
      gap={1}
      onSubmit={() => {
        if (tag) {
          setTag('');
        }
      }}
    >
      <Stack direction="row" gap={1} marginBottom={2}>
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
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  type="button"
                  size="small"
                  edge="end"
                  onClick={() => {
                    setQuery('');
                    navigate({
                      pathname: '/search',
                      search: getSearchParams({
                        query: null,
                        tags,
                      }).toString(),
                    });
                  }}
                >
                  <Cancel fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button type="submit" variant="outlined">
          Search
        </Button>
      </Stack>
      <div className="relative">
        <div className="absolute -top-3 left-2 bg-white px-1">
          <Tag />
        </div>
        <Card variant="outlined">
          <CardContent>
            <Stack gap={1}>
              <TextField
                label="Tag"
                name="tags"
                id="tags"
                variant="outlined"
                size="small"
                value={tag}
                onChange={({ target }) => setTag(target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        type="submit"
                        size="small"
                        edge="end"
                        onClick={() => {
                          navigate({
                            pathname: '/search',
                            search: getSearchParams({
                              query: null,
                              tags,
                            }).toString(),
                          });
                        }}
                      >
                        <AddCircle fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Stack direction="row" gap={1}>
                {tags.map((tag) => (
                  <Fragment key={tag}>
                    <input type="hidden" name="tags" value={tag} />
                    <TagChip
                      tag={tag}
                      onDelete={() => {
                        navigate({
                          pathname: '/search',
                          search: getSearchParams({
                            query: initialQuery,
                            tags: tags.filter((t) => t !== tag),
                          }).toString(),
                        });
                      }}
                    />
                  </Fragment>
                ))}
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </div>
    </Stack>
  );
};

function getSearchParams({
  query,
  tags,
}: {
  query: string | null;
  tags: string[];
}): URLSearchParams {
  const params = new URLSearchParams();

  if (query) {
    params.set('q', query);
  }

  tags.forEach((t) => params.append('tags', t));

  return params;
}
