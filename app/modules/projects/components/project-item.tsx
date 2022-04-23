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
  Typography,
} from '@mui/material';
import type { ProjectItem } from '@prisma/client';
import { ProjectItemType } from '@prisma/client';
import type { FC, MouseEvent } from 'react';
import React, { useState } from 'react';
import { YoutubeFrame } from '~/modules/common/youtube-frame';

export const ProjectItemCard: FC<{
  item: ProjectItem;
  isCurrentUser: boolean;
}> = ({ item, isCurrentUser }) => {
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

  return (
    <>
      {isCurrentUser && (
        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
          <MenuItem onClick={handleClose}>
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
        <DialogActions>
          <Button onClick={handleModalClose} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleModalClose}
            autoFocus
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
