import { CachedOutlined, DeleteOutline } from '@mui/icons-material';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import type { FC } from 'react';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { getURI } from '~/modules/common/utils/getURI';

export const SlugField: FC<{
  getLink: (slug: string) => string;
  name: string;
  defaultSlug: string | null;
}> = ({ getLink, name, defaultSlug }) => {
  const [slug, setSlug] = useState(defaultSlug ?? '');
  const [link, setLink] = useState('');
  const syncedRef = useRef(getURI(name) === slug);

  useEffect(() => {
    if (syncedRef.current) {
      setSlug(getURI(name));
    }
  }, [name]);

  useEffect(() => {
    setLink(getLink(slug));
  }, [getLink, slug]);

  return (
    <TextField
      fullWidth
      name="slug"
      label="Slug"
      value={slug}
      size="small"
      className="grow"
      InputLabelProps={{
        shrink: true,
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <IconButton
              aria-label="toggle password visibility"
              size="small"
              disabled={getURI(name) === slug}
              onClick={() => {
                setSlug(getURI(name));
                syncedRef.current = true;
              }}
              edge="start"
            >
              <CachedOutlined />
            </IconButton>
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              size="small"
              disabled={!slug}
              onClick={() => {
                setSlug('');
                syncedRef.current = false;
              }}
              edge="end"
            >
              <DeleteOutline />
            </IconButton>
          </InputAdornment>
        ),
      }}
      helperText={
        link ? (
          <span className="inline-flex flex-col">
            <span>
              Short name for your album. This should be unique within your
              account.
            </span>
            {slug && (
              <span>
                <span>Your album could be accessed at</span>{' '}
                <span className="py-1 px-2 bg-slate-100 rounded self-start">
                  {link}
                </span>
              </span>
            )}
          </span>
        ) : null
      }
      onChange={({ target }) => {
        syncedRef.current = false;
        setSlug(getURI(target.value));
      }}
    />
  );
};
