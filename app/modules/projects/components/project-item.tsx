import { Delete, Edit, MoreVert } from '@mui/icons-material';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Typography,
} from '@mui/material';
import type { ProjectItem } from '@prisma/client';
import { ProjectItemType } from '@prisma/client';
import { useFetcher } from '@remix-run/react';
import type { FC, MouseEvent } from 'react';
import React, { useRef, useState } from 'react';
import { useToggle } from '~/modules/common/hooks/use-toggle';
import { YoutubeFrame } from '~/modules/common/youtube-frame';
import { ItemForm } from '~/modules/projects/components/item-form';
import type { FullProject } from '~/modules/projects/types/full-project';

export const ProjectItemCard: FC<{
  project: FullProject;
  item: ProjectItem;
  isCurrentUser: boolean;
  deleteLink: string;
}> = ({ project, item, isCurrentUser, deleteLink }) => {
  const deleteFormRef = useRef<HTMLFormElement | null>(null);
  const fetcher = useFetcher();
  const [edit, toggleEdit] = useToggle();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [modalOpen, setModalOpen] = useState(false);

  const handleModalOpen = () => {
    handleClose();
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  if (edit) {
    return (
      <Paper elevation={3} className="p-4">
        <ItemForm
          type={item.type}
          item={item}
          project={project}
          onSuccess={() => toggleEdit()}
          onCancel={() => toggleEdit()}
        />
      </Paper>
    );
  }

  return (
    <>
      {isCurrentUser && (
        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
          <MenuItem
            onClick={() => {
              handleClose();
              toggleEdit();
            }}
          >
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleModalOpen} color="error">
            <ListItemIcon color="error">
              <Delete fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>
              <Typography color="error" fontSize="inherit">
                Delete
              </Typography>
            </ListItemText>
          </MenuItem>
        </Menu>
      )}
      <Card elevation={10}>
        {isCurrentUser || item.title ? (
          <CardHeader
            title={item.title}
            action={
              isCurrentUser && (
                <IconButton aria-label="settings" onClick={handleClick}>
                  <MoreVert />
                </IconButton>
              )
            }
          />
        ) : null}

        {item.type === ProjectItemType.IMAGE ? (
          <CardMedia
            component="img"
            image={item.value}
            alt={item.title ?? 'item'}
          />
        ) : null}

        {item.type === ProjectItemType.YOUTUBE ? (
          <CardMedia>
            <YoutubeFrame title={item.id} url={item.value} />
          </CardMedia>
        ) : null}

        {item.caption && (
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              {item.caption}
            </Typography>
          </CardContent>
        )}
      </Card>

      <Dialog
        open={modalOpen}
        onClose={handleModalClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Delete {item.title ?? 'slide'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this slide?
            <br />
            <strong>This action is not revertable.</strong>
          </DialogContentText>
        </DialogContent>
        <fetcher.Form
          action={`delete`}
          method="post"
          ref={deleteFormRef}
          onSubmit={(e) => {
            e.preventDefault();

            fetcher.submit(
              {},
              {
                action: deleteLink,
                method: 'delete',
              }
            );

            handleModalClose();
          }}
        >
          <DialogActions>
            <Button onClick={handleModalClose} variant="outlined" type="button">
              Cancel
            </Button>
            <Button type="submit" autoFocus variant="contained" color="error">
              Delete
            </Button>
          </DialogActions>
        </fetcher.Form>
      </Dialog>
    </>
  );
};
