import { LocalOfferOutlined, SubtitlesOutlined } from '@mui/icons-material';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import type { Project } from '@prisma/client';
import { Form } from '@remix-run/react';
import type { FC } from 'react';
import * as React from 'react';
import { useState } from 'react';
import { SlugField } from '~/modules/albums/components/slug-field';
import { EditableCardSection } from '~/modules/common/editable-card-section';
import { SectionTitle } from '~/modules/users/components/profile/section-title';
import { getUserPath } from '~/modules/users/get-user-path';
import type { WithUser } from '~/modules/users/types/with-user';

export const GeneralSection: FC<{ project: Project & WithUser }> = ({
  project,
}) => {
  const [name, setName] = useState(project.name);

  const nameLabel = <span className="text-xs font-bold self-center">name</span>;
  const slugLabel = (
    <LocalOfferOutlined color={project.slug ? 'inherit' : 'disabled'} />
  );
  const captionLabel = (
    <SubtitlesOutlined color={project.caption ? 'inherit' : 'disabled'} />
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
              <input type="hidden" name="fields" value="general" />

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
                  `${location.host}/${getUserPath(project.user)}/${slug}`
                }
                name={name}
                defaultSlug={project.slug}
              />

              {captionLabel}
              <TextField
                multiline
                className="grow"
                fullWidth
                label="Description"
                size="small"
                variant="outlined"
                name="caption"
                defaultValue={project.caption}
                InputLabelProps={{
                  shrink: true,
                }}
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
            <span>{project.name}</span>

            {slugLabel}
            <Stack>
              <span>
                {project.slug ??
                  "You didn't specify any short name for this project."}
              </span>
              <Typography variant="caption">
                Your project could be accessed using this short name.
              </Typography>
            </Stack>

            {captionLabel}
            <p className="whitespace-pre-wrap">
              {project.caption || "You didn't specify project description yet"}
            </p>
          </Box>
        )
      }
    />
  );
};
