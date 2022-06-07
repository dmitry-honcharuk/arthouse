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
  const setCollectionsFetcher = useFetcher();

  const updateCollections = useCallback(
    (collections: Collection[]) => {
      const form = new FormData();

      form.set('fields', 'collections');

      collections.forEach(({ id }) => form.append('collections', `${id}`));

      setCollectionsFetcher.submit(form, {
        method: 'put',
        action: `/favorites/${favorite.projectId}`,
      });
    },
    [favorite.projectId, setCollectionsFetcher]
  );

  useEffect(() => {
    if (newCollectionFetcher.data) {
      updateCollections([...favorite.collections, newCollectionFetcher.data]);
    }
  }, [favorite.collections, newCollectionFetcher.data, updateCollections]);

  return (
    <CollectionsAutocomplete
      allCollections={allCollections}
      selectedCollections={favorite.collections}
      onChange={updateCollections}
      onNewCollection={(name) => {
        newCollectionFetcher.submit(
          { name },
          { action: '/collections', method: 'post' }
        );
      }}
    />
  );
};
