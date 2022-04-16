import { Add, ConnectWithoutContact, DeleteOutline } from '@mui/icons-material';
import { Button, Divider, IconButton, TextField } from '@mui/material';
import { useFetcher } from '@remix-run/react';
import cuid from 'cuid';
import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import { getSocialIcon } from '~/modules/users/components/profile/social-links-display';

type LinkItem = {
  link: string | null;
  key: string;
};
export const SocialLinksEdit: FC<{
  links: string[];
  onSuccess: () => void;
}> = ({ links, onSuccess }) => {
  const fetcher = useFetcher();

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.type === 'done') {
      onSuccess();
    }
  }, [fetcher.state, fetcher.type, onSuccess]);

  const [linkList, setLinkList] = useState<LinkItem[]>(
    links.length
      ? links.map((link) => ({ link, key: link }))
      : [{ link: null, key: cuid() }]
  );
  const linksRef = useRef(
    new Map(linkList.map(({ key, link }) => [key, link]))
  );

  return (
    <fetcher.Form
      method="post"
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData();

        formData.set('fields', 'socialLinks');

        const links = [...linksRef.current.values()].filter(
          (link): link is string => !!link
        );

        for (const link of links) {
          formData.append('socialLinks', link);
        }

        formData.set('test', 'aha');

        fetcher.submit(formData, { method: 'post' });
      }}
    >
      <div className="flex flex-col gap-2">
        {linkList.map(({ link, key }, index) => {
          return (
            <SocialField
              key={key}
              autoFocus={link === null && index === 0}
              name={`link-${index}`}
              link={link ?? ''}
              onDelete={() => {
                linksRef.current.delete(key);
                setLinkList((list) => {
                  const newList = [...list];

                  newList.splice(index, 1);

                  return newList;
                });
              }}
              onChange={(newLink) => {
                linksRef.current.set(key, newLink);
              }}
            />
          );
        })}
      </div>

      <div className="text-center">
        <Button
          color="primary"
          variant="outlined"
          onClick={() => {
            setLinkList((list) => [...list, { link: null, key: cuid() }]);
          }}
        >
          <Add />
        </Button>
      </div>

      <Divider />
      <Button variant="contained" className="self-end" type="submit">
        Save
      </Button>
    </fetcher.Form>
  );
};
const SocialField: FC<{
  name: string;
  link: string;
  autoFocus: boolean;
  onChange: (link: string) => void;
  onDelete: () => void;
}> = ({ name, link, onChange, onDelete, autoFocus }) => {
  const DefaultIcon = ConnectWithoutContact;

  const [Icon, setIcon] = useState(() => getSocialIcon(link) ?? DefaultIcon);

  return (
    <div className="flex items-center gap-3">
      <div>{Icon ? <Icon /> : <ConnectWithoutContact />}</div>

      <TextField
        fullWidth
        size="small"
        name={name}
        variant="outlined"
        defaultValue={link}
        autoFocus={autoFocus}
        onChange={({ target }) => {
          setIcon(getSocialIcon(target.value) ?? DefaultIcon);
          onChange(target.value);
        }}
      />

      <IconButton onClick={onDelete} color="secondary">
        <DeleteOutline />
      </IconButton>
    </div>
  );
};
