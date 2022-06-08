import { DeleteOutline, EditOutlined } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { Collection } from '@prisma/client';
import { useFetcher } from '@remix-run/react';
import { sortBy } from 'lodash';
import type { FC } from 'react';
import { useState } from 'react';

interface Props {
  collections: Collection[];
}

export const CollectionsView: FC<Props> = ({ collections }) => {
  const fetcher = useFetcher();

  const [newCollection, setNewCollection] = useState('');

  return (
    <Stack gap={4}>
      <fetcher.Form
        action="/collections"
        method="post"
        onSubmit={() => setNewCollection('')}
      >
        <Stack direction="row" gap={1}>
          <TextField
            size="small"
            name="name"
            disabled={fetcher.state !== 'idle'}
            value={newCollection}
            onChange={({ target }) => setNewCollection(target.value)}
            label="New collection name"
            className="grow"
          />
          <LoadingButton
            loading={fetcher.state !== 'idle'}
            type="submit"
            variant="outlined"
            size="small"
          >
            Create
          </LoadingButton>
        </Stack>
      </fetcher.Form>

      <List component="div" className="flex flex-col gap-5">
        {sortBy(collections, 'name').map((collection) => (
          <CollectionItem key={collection.id} collection={collection} />
        ))}
      </List>
    </Stack>
  );
};

const CollectionItem: FC<{ collection: Collection }> = ({ collection }) => {
  const fetcher = useFetcher();

  const [mode, setMode] = useState<'idle' | 'edit' | 'delete'>('idle');

  const isLoading = fetcher.state !== 'idle';
  return (
    <Stack gap={1}>
      <Paper elevation={3}>
        <ListItem
          component="div"
          secondaryAction={
            mode === 'idle' ? (
              <>
                <IconButton
                  disabled={isLoading}
                  onClick={() => setMode('edit')}
                  size="small"
                >
                  <EditOutlined />
                </IconButton>
                <IconButton
                  disabled={isLoading}
                  onClick={() => setMode('delete')}
                  size="small"
                  color="secondary"
                >
                  <DeleteOutline />
                </IconButton>
              </>
            ) : (
              <Button
                onClick={() => setMode('idle')}
                size="small"
                color="inherit"
              >
                Cancel
              </Button>
            )
          }
        >
          <ListItemText primary={collection.name} />
        </ListItem>
      </Paper>
      {mode !== 'idle' && (
        <Paper variant="outlined">
          <fetcher.Form
            action={`/collections/${collection.id}`}
            method={mode === 'delete' ? 'delete' : 'put'}
            onSubmit={() => setMode('idle')}
          >
            <ListItem
              component="div"
              sx={{
                pr: 14,
              }}
              secondaryAction={
                mode === 'delete' ? (
                  <Button
                    type="submit"
                    size="small"
                    color="secondary"
                    variant="outlined"
                    disabled={isLoading}
                  >
                    Delete
                  </Button>
                ) : (
                  <Button
                    disabled={isLoading}
                    type="submit"
                    size="small"
                    variant="outlined"
                  >
                    Rename
                  </Button>
                )
              }
            >
              {mode === 'edit' && (
                <TextField
                  label="New collection name"
                  defaultValue={collection.name}
                  size="small"
                  className="grow"
                  name="name"
                  disabled={isLoading}
                  autoFocus
                />
              )}
              {mode === 'delete' && (
                <Typography>
                  Delete <b>{collection.name}</b> collection?
                </Typography>
              )}
            </ListItem>
          </fetcher.Form>
        </Paper>
      )}
    </Stack>
  );
};
