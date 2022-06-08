import type { Collection, Favorite } from '@prisma/client';
import { useFetcher } from '@remix-run/react';
import type { FC } from 'react';
import { useCallback, useEffect } from 'react';
import type { WithCollections } from '~/modules/favorites/types/with-collections';
import { CollectionsAutocomplete } from './collections-autocomplete';

interface Props {
  favorite: Favorite & WithCollections;
  allCollections: Collection[];
}

export const CollectionsAutocompleteField: FC<Props> = ({
  favorite,
  allCollections,
}) => {
  const newCollectionFetcher = useFetcher<Collection>();
  const { submit: setCollectionsFetcherSubmit } = useFetcher();

  const updateCollections = useCallback(
    (collections: string[]) => {
      const form = new FormData();

      form.set('fields', 'collections');

      collections.forEach((id) => form.append('collections', `${id}`));

      setCollectionsFetcherSubmit(form, {
        method: 'put',
        action: `/favorites/${favorite.projectId}`,
      });
    },
    [favorite.projectId, setCollectionsFetcherSubmit]
  );

  const collectionIds = favorite.collections.map(({ id }) => id);
  const collectionsKey = collectionIds.join(',');

  useEffect(() => {
    if (
      newCollectionFetcher.data &&
      !collectionIds.includes(newCollectionFetcher.data.id)
    ) {
      updateCollections([...collectionIds, newCollectionFetcher.data.id]);
    }
    // favorite.collections always has new reference
  }, [collectionsKey, newCollectionFetcher.data, updateCollections]);

  return (
    <CollectionsAutocomplete
      allCollections={allCollections}
      selectedCollections={favorite.collections}
      onChange={(collections) =>
        updateCollections(collections.map(({ id }) => id))
      }
      onNewCollection={(name) => {
        newCollectionFetcher.submit(
          { name },
          { action: '/collections', method: 'post' }
        );
      }}
    />
  );
};
