import {
  FormControl,
  InputLabel,
  Link as MaterialLink,
  MenuItem,
  OutlinedInput,
  Select,
  Typography,
} from '@mui/material';
import type { Collection, Favorite } from '@prisma/client';
import { Link } from '@remix-run/react';
import type { FC } from 'react';
import { useState } from 'react';
import { ProjectCard } from '~/modules/projects/components/project-card';
import { Projects } from '~/modules/projects/components/project-list';
import { getProjectPath } from '~/modules/projects/get-project-path';
import type { WithFullProject } from '~/modules/projects/types/with-full-project';
import type { WithCollections } from '../../types/with-collections';

interface Props {
  favorites: (Favorite & WithFullProject & WithCollections)[];
  collections: Collection[];
}

export const ProjectsView: FC<Props> = ({ collections, favorites }) => {
  const [collection, setCollection] = useState<Collection | 'all'>('all');

  const showAll = collection === 'all';

  const favoritesToDisplay = showAll
    ? favorites
    : favorites.filter(({ collections }) =>
        collections.some(({ id }) => id === collection.id)
      );

  return (
    <>
      <Typography variant="h4">Favourites</Typography>

      <FormControl>
        <InputLabel>Collection</InputLabel>
        <Select
          value={showAll ? 'all' : collection.id}
          onChange={({ target }) => {
            const selected =
              target.value === 'all'
                ? 'all'
                : collections.find(({ id }) => id === target.value) ?? 'all';

            setCollection(selected === 'all' ? 'all' : selected);
          }}
          input={<OutlinedInput label="Collection" />}
        >
          <MenuItem value="all">All favorites</MenuItem>
          {collections.map(({ id, name }) => (
            <MenuItem key={id} value={id}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {favoritesToDisplay.length ? (
        <Projects>
          {favoritesToDisplay.map(({ project }) => (
            <ProjectCard
              link={`/${getProjectPath(project, project.user)}`}
              key={project.id}
              project={project}
              showIsSecured
            />
          ))}
        </Projects>
      ) : (
        <Typography>
          <p>
            You didn't mark anything as your favourite
            {collection === 'all' ? (
              ''
            ) : (
              <span>
                {' '}
                within{' '}
                <span className="font-bold italic">{collection.name}</span>{' '}
                collection
              </span>
            )}
            .
          </p>
          <br />
          {showAll ? (
            ''
          ) : (
            <span>
              <MaterialLink
                className="cursor-pointer"
                onClick={() => setCollection('all')}
              >
                Check all your favourites
              </MaterialLink>{' '}
              or{' '}
            </span>
          )}
          <MaterialLink component={Link} to="/">
            {showAll ? 'Browse' : 'browse'} all projects
          </MaterialLink>{' '}
          to find something {showAll ? 'you like' : 'that matches your vision'}.
        </Typography>
      )}
    </>
  );
};
