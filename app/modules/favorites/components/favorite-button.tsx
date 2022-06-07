import { EditOutlined, FavoriteBorder, HeartBroken } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Link as MaterialLink,
  Stack,
} from '@mui/material';
import type { Collection, Favorite } from '@prisma/client';
import { Link, useFetcher } from '@remix-run/react';
import type { WithCollections } from '~/modules/favorites/types/with-collections';
import { CollectionsAutocompleteField } from './collections-autocomplete-field';

type Props = {
  favorite: null | (Favorite & WithCollections);
  projectId: string;
  allCollections: Collection[];
  favoritesLink: string;
};

export function FavoriteBtn({
  favorite,
  projectId,
  allCollections,
  favoritesLink,
}: Props) {
  const fetcher = useFetcher();

  if (favorite) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Stack gap={1}>
            <fetcher.Form
              method="delete"
              action={`/favorites/${favorite.projectId}`}
            >
              <Button
                fullWidth
                type="submit"
                variant="outlined"
                color="secondary"
                size="large"
              >
                <HeartBroken />
              </Button>
            </fetcher.Form>
            <CollectionsAutocompleteField
              favorite={favorite}
              allCollections={allCollections}
            />
            <Box textAlign="center" mt={2}>
              <MaterialLink
                component={Link}
                to={favoritesLink}
                className="flex gap-1 items-center"
              >
                <EditOutlined fontSize="small" />
                <span>Edit collections</span>
              </MaterialLink>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <fetcher.Form method="post" action="/favorites">
      <input type="hidden" name="projectId" value={projectId} />

      <Button type="submit" color="secondary" size="large" fullWidth>
        <FavoriteBorder />
      </Button>
    </fetcher.Form>
  );
}
