import { LocalOfferOutlined } from '@mui/icons-material';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import type { Album } from '@prisma/client';
import { Form } from '@remix-run/react';
import type { FC } from 'react';
import * as React from 'react';
import { useState } from 'react';
import { SlugField } from '~/modules/albums/components/slug-field';
import { EditableCardSection } from '~/modules/common/editable-card-section';
import { SectionTitle } from '~/modules/users/components/profile/section-title';
import { getUserPath } from '~/modules/users/get-user-path';
import type { WithUser } from '~/modules/users/types/with-user';

export const GeneralSection: FC<{ album: Album & WithUser }> = ({ album }) => {
  const [name, setName] = useState(album.name);

  const nameLabel = <span className="text-xs font-bold self-center">name</span>;
  const slugLabel = (
    <LocalOfferOutlined color={album.slug ? 'inherit' : 'disabled'} />
  );

  return (
    <EditableCardSection
      renderTitle={({ isEdit, toggleIsEdit }) => (
        <SectionTitle variant="h5" onEdit={toggleIsEdit} isEdit={isEdit}>
          General
        </SectionTitle>
      )}
      render={({ isEdit, setIsEdit }) =>
        isEdit ? (
          <Stack
            component={Form}
            method="put"
            onSubmit={() => setIsEdit(false)}
            gap={2}
          >
            <Box display="grid" gridTemplateColumns="auto 1fr" gap={2}>
              <input type="hidden" name="fields" value="name" />

              {nameLabel}

              <TextField
                className="grow"
                fullWidth
                label="Name"
                size="small"
                variant="outlined"
                name="name"
                value={name}
                InputLabelProps={{
                  shrink: true,
                }}
                onChange={({ target }) => setName(target.value)}
                autoFocus
                required
              />

              {slugLabel}

              <SlugField
                getLink={(slug) =>
                  `${location.host}/${getUserPath(album.user)}/albums/${slug}`
                }
                name={name}
                defaultSlug={album.slug}
              />
            </Box>
            <div className="text-right">
              <Button type="submit" variant="outlined">
                Save
              </Button>
            </div>
          </Stack>
        ) : (
          <Box display="grid" gridTemplateColumns="auto 1fr" gap={2}>
            {nameLabel}
            <span>{album.name}</span>
            {slugLabel}
            <Stack>
              <span>
                {album.slug ??
                  "You didn't specify any short name for this album."}
              </span>
              <Typography variant="caption">
                Your album could be accessed using this short name.
              </Typography>
            </Stack>
          </Box>
        )
      }
    />
  );
};
